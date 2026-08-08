import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder).nonNullable;
  private categoryService = inject(CategoryService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  categoryCreated = output<Category>();
  closeModal = output<void>();

  // Curated color palette for categories
  availableColors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald Green
    '#EF4444', // Red
    '#F59E0B', // Amber / Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    color: ['#3B82F6', [Validators.required]]
  });

  selectColor(color: string): void {
    this.categoryForm.patchValue({ color });
  }

  triggerColorPicker(input: HTMLInputElement): void {
    input.click();
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, color } = this.categoryForm.getRawValue();

    this.categoryService.create({ name, color }).subscribe({
      next: (newCategory: Category) => {
        this.isLoading.set(false);
        this.categoryCreated.emit(newCategory);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create category. Please try again.');
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
