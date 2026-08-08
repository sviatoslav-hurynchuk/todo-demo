import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

export type ActiveFilterType = 'all' | 'important' | 'completed' | 'category';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  isLoadingCategories = signal<boolean>(false);
  activeFilter = signal<ActiveFilterType>('all');
  selectedCategoryId = signal<number | null>(null);

  filterChange = output<{ filter: ActiveFilterType; categoryId?: number | null }>();
  createCategoryClick = output<void>();

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService.getAll().subscribe({
      next: (data: Category[]) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.isLoadingCategories.set(false);
      }
    });
  }

  selectQuickFilter(filter: ActiveFilterType): void {
    this.activeFilter.set(filter);
    this.selectedCategoryId.set(null);
    this.filterChange.emit({ filter, categoryId: null });
  }

  selectCategory(category: Category): void {
    this.activeFilter.set('category');
    this.selectedCategoryId.set(category.id);
    this.filterChange.emit({ filter: 'category', categoryId: category.id });
  }

  onCreateCategory(): void {
    this.createCategoryClick.emit();
  }
}
