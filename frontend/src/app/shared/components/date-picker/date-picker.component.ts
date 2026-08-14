import {
  Component,
  Input,
  ElementRef,
  HostListener,
  forwardRef,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Select due date...';
  @Input() ariaLabel: string = 'Date';

  private elementRef = inject(ElementRef);

  isOpen = signal<boolean>(false);
  value = signal<string | null>(null);
  isDisabled = signal<boolean>(false);

  viewDate = signal<Date>(new Date());

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  readonly dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  private onChange: (val: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | null): void {
    this.value.set(val || null);
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [year, month, day] = val.split('-').map(Number);
      this.viewDate.set(new Date(year, month - 1, day));
    } else {
      this.viewDate.set(new Date());
    }
  }

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  openDirection = signal<'down' | 'up'>('down');

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggleOpen(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) return;

    if (!this.isOpen()) {
      this.calculateDirection();
      this.isOpen.set(true);
      this.onTouched();
    } else {
      this.isOpen.set(false);
    }
  }

  private calculateDirection(): void {
    if (typeof window === 'undefined') return;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const popoverEstimatedHeight = 310;

    if (spaceBelow < popoverEstimatedHeight && spaceAbove >= spaceBelow) {
      this.openDirection.set('up');
    } else {
      this.openDirection.set('down');
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  // Scoped to the host — prevents the Escape from bubbling up and
  // accidentally closing the parent modal when the calendar is open.
  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.isOpen()) {
      event.stopPropagation();
      this.close();
    }
  }

  getAriaLabel(): string {
    const date = this.getFormattedDisplay();
    return date ? `${this.ariaLabel}: ${date}` : this.ariaLabel;
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    const curr = this.viewDate();
    this.viewDate.set(new Date(curr.getFullYear(), curr.getMonth() - 1, 1));
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    const curr = this.viewDate();
    this.viewDate.set(new Date(curr.getFullYear(), curr.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    this.value.set(day.dateString);
    this.onChange(day.dateString);
    this.close();
  }

  selectToday(event: Event): void {
    event.stopPropagation();
    const today = new Date();
    const formatted = this.formatDateString(today);
    this.value.set(formatted);
    this.onChange(formatted);
    this.viewDate.set(today);
    this.close();
  }

  clearValue(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.close();
  }

  getFormattedDisplay(): string {
    const val = this.value();
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return '';
    const [year, month, day] = val.split('-').map(Number);
    const monthName = this.shortMonthNames[month - 1];
    return `${monthName} ${day}, ${year}`;
  }

  getCalendarDays(): CalendarDay[] {
    const currentView = this.viewDate();
    const year = currentView.getFullYear();
    const month = currentView.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based index: 0 = Mon, 6 = Sun
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days: CalendarDay[] = [];
    const todayStr = this.formatDateString(new Date());
    const selectedStr = this.value();

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = this.formatDateString(d);
      days.push({
        date: d,
        dateString,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isSelected: dateString === selectedStr
      });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const dateString = this.formatDateString(dateObj);
      days.push({
        date: dateObj,
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        isSelected: dateString === selectedStr
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      const dateString = this.formatDateString(d);
      days.push({
        date: d,
        dateString,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        isSelected: dateString === selectedStr
      });
    }

    return days;
  }

  getCurrentMonthYearLabel(): string {
    const d = this.viewDate();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  private formatDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
