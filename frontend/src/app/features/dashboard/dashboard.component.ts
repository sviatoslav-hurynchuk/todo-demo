import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, ActiveFilterType } from './sidebar/sidebar.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { TaskListComponent } from '../tasks/task-list/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, CategoryFormComponent, TaskListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;
  @ViewChild(TaskListComponent) taskListComponent!: TaskListComponent;

  isSidebarOpen = signal<boolean>(false);
  isCategoryModalOpen = signal<boolean>(false);
  activeFilter = signal<ActiveFilterType>('all');
  selectedCategoryId = signal<number | null>(null);

  toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  onFilterChange(event: { filter: ActiveFilterType; categoryId?: number | null }): void {
    this.activeFilter.set(event.filter);
    this.selectedCategoryId.set(event.categoryId ?? null);
    this.isSidebarOpen.set(false);
  }

  openCategoryModal(): void {
    this.isCategoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen.set(false);
  }

  onCategoryCreated(): void {
    this.closeCategoryModal();
    if (this.sidebarComponent) {
      this.sidebarComponent.loadCategories();
    }
    if (this.taskListComponent) {
      this.taskListComponent.loadCategories();
    }
  }
}
