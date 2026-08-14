import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { noWhitespaceValidator } from '../../../shared/validators/no-whitespace.validator';

import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit, OnDestroy {
  @Input() task: Task | null = null;
  @Input() categories: Category[] = [];
  @Input() preselectedCategoryId: number | null = null;

  @Output() taskCreated = new EventEmitter<CreateTaskRequest>();
  @Output() taskUpdated = new EventEmitter<{ id: number; dto: UpdateTaskRequest }>();
  @Output() closeModal = new EventEmitter<void>();

  taskForm!: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    categoryId: FormControl<string>;
    dueDate: FormControl<string>;
    isImportant: FormControl<boolean>;
  }>;
  isSubmitting = signal<boolean>(false);

  private elementRef = inject(ElementRef);
  private openerElement: HTMLElement | null = null;

  constructor(private fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    this.openerElement = document.activeElement as HTMLElement | null;
    let defaultDueDate = '';
    if (this.task?.dueDate) {
      defaultDueDate = this.task.dueDate;
    }

    const initialCategoryId = this.task?.categoryId ?? this.preselectedCategoryId;
    const categoryIdStr = initialCategoryId !== null && initialCategoryId !== undefined ? String(initialCategoryId) : '';

    this.taskForm = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.maxLength(255), noWhitespaceValidator()]],
      description: [this.task?.description || '', [Validators.maxLength(2000)]],
      categoryId: [categoryIdStr],
      dueDate: [defaultDueDate],
      isImportant: [this.task?.isImportant || false]
    });
  }

  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  ngOnDestroy(): void {
    this.openerElement?.focus();
  }

  onTabKey(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    const modal = this.elementRef.nativeElement.querySelector('.modal-container') as HTMLElement;
    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (keyEvent.shiftKey) {
      if (document.activeElement === first) { keyEvent.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { keyEvent.preventDefault(); first.focus(); }
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValues = this.taskForm.getRawValue();

    const categoryIdVal = formValues.categoryId ? Number(formValues.categoryId) : null;
    const dueDateVal = formValues.dueDate || null;

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
