import { Component, inject, signal, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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
export class SidebarComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private loadSub?: Subscription;

  categories = signal<Category[]>([]);
  isLoadingCategories = signal<boolean>(false);
  hasCategoryError = signal<boolean>(false);
  activeFilter = signal<ActiveFilterType>('all');
  selectedCategoryId = signal<number | null>(null);

  filterChange = output<{ filter: ActiveFilterType; categoryId?: number | null }>();
  createCategoryClick = output<void>();

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }

  loadCategories(): void {
    this.loadSub?.unsubscribe();

    this.isLoadingCategories.set(true);
    this.hasCategoryError.set(false);

    this.loadSub = this.categoryService.getAll().subscribe({
      next: (data: Category[]) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.isLoadingCategories.set(false);
        this.hasCategoryError.set(true);
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
