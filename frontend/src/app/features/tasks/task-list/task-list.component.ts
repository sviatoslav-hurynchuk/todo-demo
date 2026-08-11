import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskQueryParams } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ActiveFilterType } from '../../dashboard/sidebar/sidebar.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskItemComponent, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() activeFilter: ActiveFilterType = 'all';
  @Input() selectedCategoryId: number | null = null;
  @Output() createCategoryClick = new EventEmitter<void>();

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);

  tasks = signal<Task[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  categories = signal<Category[]>([]);

  isTaskModalOpen = signal<boolean>(false);
  selectedTaskForEdit = signal<Task | null>(null);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadTasks();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeFilter'] || changes['selectedCategoryId']) {
      this.currentPage.set(1);
      this.loadTasks();
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadTasks(): void {
    this.isLoading.set(true);

    const params: TaskQueryParams = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery() || undefined
    };

    if (this.activeFilter === 'important') {
      params.isImportant = true;
    } else if (this.activeFilter === 'completed') {
      params.isCompleted = true;
    } else if (this.activeFilter === 'category' && this.selectedCategoryId) {
      params.categoryId = this.selectedCategoryId;
    }

    this.taskService.getAll(params).subscribe({
      next: (res) => {
        this.tasks.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchSubject.next(val);
  }

  onToggleComplete(taskId: number): void {
    this.taskService.toggleComplete(taskId).subscribe({
      next: (updatedTask) => {
        this.tasks.update(list => list.map(t => t.id === taskId ? updatedTask : t));
        if (this.activeFilter === 'completed' || this.activeFilter === 'important') {
          this.loadTasks();
        }
      },
      error: (err) => console.error('Failed to toggle task completion', err)
    });
  }

  onToggleImportant(task: Task): void {
    const dto: UpdateTaskRequest = {
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      isImportant: !task.isImportant,
      dueDate: task.dueDate,
      categoryId: task.categoryId
    };

    this.taskService.update(task.id, dto).subscribe({
      next: (updatedTask) => {
        this.tasks.update(list => list.map(t => t.id === task.id ? updatedTask : t));
        if (this.activeFilter === 'important') {
          this.loadTasks();
        }
      },
      error: (err) => console.error('Failed to toggle task importance', err)
    });
  }

  openCreateTaskModal(): void {
    this.selectedTaskForEdit.set(null);
    this.isTaskModalOpen.set(true);
  }

  openEditTaskModal(task: Task): void {
    this.selectedTaskForEdit.set(task);
    this.isTaskModalOpen.set(true);
  }

  closeTaskModal(): void {
    this.isTaskModalOpen.set(false);
    this.selectedTaskForEdit.set(null);
  }

  onTaskCreated(dto: CreateTaskRequest): void {
    this.taskService.create(dto).subscribe({
      next: () => {
        this.closeTaskModal();
        this.loadTasks();
        this.loadCategories();
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }

  onTaskUpdated(event: { id: number; dto: UpdateTaskRequest }): void {
    this.taskService.update(event.id, event.dto).subscribe({
      next: () => {
        this.closeTaskModal();
        this.loadTasks();
        this.loadCategories();
      },
      error: (err) => console.error('Failed to update task', err)
    });
  }

  onTaskDeleted(taskId: number): void {
    this.taskService.delete(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.loadCategories();
      },
      error: (err) => console.error('Failed to delete task', err)
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadTasks();
    }
  }

  getHeaderTitle(): string {
    switch (this.activeFilter) {
      case 'important': return 'Important Tasks ⭐';
      case 'completed': return 'Completed Tasks ✅';
      case 'category':
        const cat = this.categories().find(c => c.id === this.selectedCategoryId);
        return cat ? cat.name : 'Category Tasks';
      default: return 'All Tasks';
    }
  }
}
