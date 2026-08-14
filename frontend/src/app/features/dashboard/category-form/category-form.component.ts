import { Component, inject, signal, output, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { noWhitespaceValidator } from '../../../shared/validators/no-whitespace.validator';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder).nonNullable;
  private categoryService = inject(CategoryService);
  private elementRef = inject(ElementRef);

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

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
    name: ['', [Validators.required, noWhitespaceValidator(), Validators.maxLength(50)]],
    color: ['#3B82F6', [Validators.required]]
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    }, 0);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  @HostListener('keydown.tab', ['$event'])
  onTabKey(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    const container = this.elementRef.nativeElement as HTMLElement;
    const focusableNodes = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const focusables = Array.from(focusableNodes) as HTMLElement[];

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (keyEvent.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        keyEvent.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        keyEvent.preventDefault();
      }
    }
  }

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

    this.categoryService.create({ name: name.trim(), color }).subscribe({
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
    if (this.isLoading()) return;
    this.closeModal.emit();
  }
}
