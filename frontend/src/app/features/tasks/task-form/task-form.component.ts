import { Component, Input, Output, EventEmitter, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { noWhitespaceValidator } from '../../../shared/validators/no-whitespace.validator';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() categories: Category[] = [];
  @Input() preselectedCategoryId: number | null = null;

  @Output() taskCreated = new EventEmitter<CreateTaskRequest>();
  @Output() taskUpdated = new EventEmitter<{ id: number; dto: UpdateTaskRequest }>();
  @Output() closeModal = new EventEmitter<void>();

  taskForm!: FormGroup;
  isSubmitting = signal<boolean>(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    let defaultDueDate = '';
    if (this.task?.dueDate) {
      defaultDueDate = new Date(this.task.dueDate).toISOString().split('T')[0];
    }

    this.taskForm = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.maxLength(255), noWhitespaceValidator()]],
      description: [this.task?.description || '', [Validators.maxLength(2000)]],
      categoryId: [this.task?.categoryId ?? this.preselectedCategoryId ?? ''],
      dueDate: [defaultDueDate],
      isImportant: [this.task?.isImportant || false]
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValues = this.taskForm.value;

    const categoryIdVal = formValues.categoryId ? Number(formValues.categoryId) : null;
    const dueDateVal = formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null;

    if (this.task) {
      const updateDto: UpdateTaskRequest = {
        title: formValues.title.trim(),
        description: formValues.description ? formValues.description.trim() : null,
        isCompleted: this.task.isCompleted,
        isImportant: formValues.isImportant,
        dueDate: dueDateVal,
        categoryId: categoryIdVal
      };
      this.taskUpdated.emit({ id: this.task.id, dto: updateDto });
    } else {
      const createDto: CreateTaskRequest = {
        title: formValues.title.trim(),
        description: formValues.description ? formValues.description.trim() : null,
        isImportant: formValues.isImportant,
        dueDate: dueDateVal,
        categoryId: categoryIdVal
      };
      this.taskCreated.emit(createDto);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
