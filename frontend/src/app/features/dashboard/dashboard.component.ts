import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, ActiveFilterType } from './sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isSidebarOpen = signal<boolean>(false);
  activeFilter = signal<ActiveFilterType>('all');
  selectedCategoryId = signal<number | null>(null);

  toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  onFilterChange(event: { filter: ActiveFilterType; categoryId?: number | null }): void {
    this.activeFilter.set(event.filter);
    this.selectedCategoryId.set(event.categoryId ?? null);
    // Close mobile drawer on selection
    this.isSidebarOpen.set(false);
  }

  onCreateCategoryClick(): void {
    // Category creation modal will be implemented in next step
  }
}
