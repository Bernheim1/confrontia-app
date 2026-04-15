import {
  Component, Input, Output, EventEmitter, ElementRef,
  HostListener, OnInit, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  day: number;
  date: string; // yyyy-MM-dd
  currentMonth: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
        <svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <input
        type="text"
        [value]="displayValue"
        [placeholder]="placeholder"
        [disabled]="disabled"
        readonly
        (click)="toggleCalendar()"
        class="w-full ps-8 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">

      <!-- Calendar Dropdown -->
      <div *ngIf="isOpen && !disabled"
        class="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 w-64">

        <!-- Header: nav + month/year -->
        <div class="flex items-center justify-between mb-2">
          <button type="button" (click)="viewMode === 'days' ? prevMonth() : prevYear(); $event.stopPropagation()"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button type="button" (click)="toggleViewMode(); $event.stopPropagation()"
            class="text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-0.5 rounded transition-colors">
            <span *ngIf="viewMode === 'days'">{{ monthNames[viewMonth] }} {{ viewYear }}</span>
            <span *ngIf="viewMode === 'months'">{{ viewYear }}</span>
          </button>
          <button type="button" (click)="viewMode === 'days' ? nextMonth() : nextYear(); $event.stopPropagation()"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Month selector -->
        <div *ngIf="viewMode === 'months'" class="grid grid-cols-3 gap-1">
          <button *ngFor="let m of monthNamesShort; let i = index"
            type="button"
            (click)="selectMonth(i); $event.stopPropagation()"
            class="py-2 text-xs rounded-md transition-colors"
            [ngClass]="{
              'bg-primary-600 text-white font-semibold': i === viewMonth && isCurrentViewYear,
              'text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/30': !(i === viewMonth && isCurrentViewYear)
            }">
            {{ m }}
          </button>
        </div>

        <!-- Day headers -->
        <div *ngIf="viewMode === 'days'" class="grid grid-cols-7 mb-1">
          <div *ngFor="let d of dayNames"
            class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {{ d }}
          </div>
        </div>

        <!-- Days grid -->
        <div *ngIf="viewMode === 'days'" class="grid grid-cols-7">
          <button *ngFor="let day of calendarDays"
            type="button"
            (click)="selectDate(day); $event.stopPropagation()"
            [disabled]="!day.currentMonth || day.disabled"
            [title]="day.disabled && day.currentMonth ? 'Fuera del rango permitido' : ''"
            class="py-1.5 text-xs rounded-md transition-colors"
            [ngClass]="{
              'text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/30': day.currentMonth && !day.selected && !day.today && !day.disabled,
              'text-gray-300 dark:text-gray-600 cursor-not-allowed': !day.currentMonth || day.disabled,
              'line-through opacity-40': day.disabled && day.currentMonth,
              'bg-primary-600 text-white hover:bg-primary-700 font-semibold': day.selected,
              'text-primary-600 dark:text-primary-400 font-semibold': day.today && !day.selected && day.currentMonth && !day.disabled
            }">
            {{ day.day }}
          </button>
        </div>

        <!-- Today button -->
        <div *ngIf="viewMode === 'days'" class="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
          <button type="button" (click)="goToToday(); $event.stopPropagation()"
            [disabled]="isTodayDisabled"
            class="w-full text-xs font-medium py-1"
            [ngClass]="isTodayDisabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'">
            Hoy
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class DatepickerComponent implements OnInit, OnChanges {
  @Input() value: string = ''; // yyyy-MM-dd
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() disabled: boolean = false;
  @Input() minDate: string = ''; // yyyy-MM-dd
  @Input() maxDate: string = ''; // yyyy-MM-dd
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  viewMode: 'days' | 'months' = 'days';
  viewMonth = 0;
  viewYear = 2024;
  calendarDays: CalendarDay[] = [];
  displayValue = '';

  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  monthNamesShort = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  ngOnInit(): void {
    this.initFromValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.initFromValue();
    }
    if (changes['minDate'] || changes['maxDate']) {
      this.buildCalendar();
    }
  }

  private initFromValue(): void {
    if (this.value) {
      const parts = this.value.split('-');
      if (parts.length === 3) {
        this.viewYear = parseInt(parts[0], 10);
        this.viewMonth = parseInt(parts[1], 10) - 1;
        this.displayValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } else {
      const today = new Date();
      this.viewYear = today.getFullYear();
      this.viewMonth = today.getMonth();
      this.displayValue = '';
    }
    this.buildCalendar();
  }

  toggleCalendar(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) this.viewMode = 'days';
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'days' ? 'months' : 'days';
  }

  get isCurrentViewYear(): boolean {
    if (!this.value) return false;
    const parts = this.value.split('-');
    return parseInt(parts[0], 10) === this.viewYear && parseInt(parts[1], 10) - 1 === this.viewMonth;
  }

  selectMonth(month: number): void {
    this.viewMonth = month;
    this.viewMode = 'days';
    this.buildCalendar();
  }

  prevYear(): void {
    this.viewYear--;
  }

  nextYear(): void {
    this.viewYear++;
  }

  prevMonth(): void {
    this.viewMonth--;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.buildCalendar();
  }

  selectDate(day: CalendarDay): void {
    if (!day.currentMonth || day.disabled) return;
    this.value = day.date;
    this.displayValue = this.toDisplay(day.date);
    this.valueChange.emit(this.value);
    this.isOpen = false;
    this.buildCalendar();
  }

  goToToday(): void {
    if (this.isTodayDisabled) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.value = `${y}-${m}-${d}`;
    this.displayValue = this.toDisplay(this.value);
    this.viewYear = y;
    this.viewMonth = today.getMonth();
    this.valueChange.emit(this.value);
    this.isOpen = false;
    this.buildCalendar();
  }

  private buildCalendar(): void {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0);

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    // Previous month padding
    const prevMonthLast = new Date(this.viewYear, this.viewMonth, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLast.getDate() - i;
      const pm = this.viewMonth === 0 ? 12 : this.viewMonth;
      const py = this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear;
      const dateStr = `${py}-${String(pm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr, currentMonth: false, today: false, selected: false, disabled: false });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        date: dateStr,
        currentMonth: true,
        today: dateStr === todayStr,
        selected: dateStr === this.value,
        disabled: this.isDateDisabled(dateStr)
      });
    }

    // Next month padding (fill to 42 = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nm = this.viewMonth === 11 ? 1 : this.viewMonth + 2;
      const ny = this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear;
      const dateStr = `${ny}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr, currentMonth: false, today: false, selected: false, disabled: false });
    }

    this.calendarDays = days;
  }

  private isDateDisabled(dateStr: string): boolean {
    if (this.minDate && dateStr < this.minDate) return true;
    if (this.maxDate && dateStr > this.maxDate) return true;
    return false;
  }

  get isTodayDisabled(): boolean {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return this.isDateDisabled(todayStr);
  }

  private toDisplay(iso: string): string {
    const parts = iso.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}
