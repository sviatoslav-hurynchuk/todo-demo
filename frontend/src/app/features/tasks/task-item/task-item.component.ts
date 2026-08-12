import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() categories: Category[] = [];

  getCategoryColor(): string {
    if (this.task.categoryColor) {
      return this.task.categoryColor;
    }
    if (this.task.categoryId && this.categories.length > 0) {
      const found = this.categories.find(c => c.id === this.task.categoryId);
      if (found?.color) {
        return found.color;
      }
    }
    return '#2564cf';
  }

  @Output() toggleComplete = new EventEmitter<number>();
  @Output() toggleImportant = new EventEmitter<Task>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<number>();

  onToggleComplete(event: Event): void {
    event.stopPropagation();
    this.toggleComplete.emit(this.task.id);
  }

  onToggleImportant(event: Event): void {
    event.stopPropagation();
    this.toggleImportant.emit(this.task);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editTask.emit(this.task);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      this.deleteTask.emit(this.task.id);
    }
  }

  getDueDateStatus(): { text: string; statusClass: string } | null {
    if (!this.task.dueDate) return null;

    const due = new Date(this.task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueZero = new Date(due);
    dueZero.setHours(0, 0, 0, 0);

    const diffTime = dueZero.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0 && !this.task.isCompleted) {
      return { text: 'Overdue', statusClass: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Today', statusClass: 'today' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', statusClass: 'tomorrow' };
    } else {
      const formatted = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { text: formatted, statusClass: 'upcoming' };
    }
  }
}
