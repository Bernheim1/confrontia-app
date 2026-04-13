import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MevFiltroOption } from '../../../services/mev/contracts/mev-filtros-response';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" (click)="$event.stopPropagation()">
      <!-- Trigger -->
      <button type="button"
        (click)="toggle()"
        [disabled]="disabled"
        class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-transparent text-left flex items-center justify-between min-h-[30px] disabled:opacity-50 disabled:cursor-not-allowed">
        <span class="truncate" [class.text-gray-400]="selectedValues.length === 0">
          {{ displayText }}
        </span>
        <svg class="w-4 h-4 ml-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <div *ngIf="isOpen"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 flex flex-col">
        <!-- Search -->
        <div class="p-1.5 border-b border-gray-200 dark:border-gray-700">
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchText"
            (input)="filterOptions()"
            placeholder="Buscar..."
            class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:outline-none"
            (click)="$event.stopPropagation()">
        </div>

        <!-- Selected count + clear -->
        <div *ngIf="selectedValues.length > 0"
          class="px-2 py-1 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ selectedValues.length }} seleccionados</span>
          <button type="button" (click)="clearAll()" class="text-xs text-red-500 hover:text-red-700">Limpiar</button>
        </div>

        <!-- Options -->
        <div class="overflow-y-auto flex-1">
          <label *ngFor="let opt of filteredOptions"
            class="flex items-center px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
            <input type="checkbox"
              [checked]="isSelected(opt.value)"
              (change)="toggleOption(opt.value)"
              class="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="text-gray-900 dark:text-white text-xs truncate">{{ opt.text }}</span>
          </label>
          <div *ngIf="filteredOptions.length === 0" class="px-2 py-2 text-xs text-gray-400 text-center">
            Sin resultados
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MultiSelectComponent implements OnInit, OnChanges {
  @Input() options: MevFiltroOption[] = [];
  @Input() selectedValues: number[] = [];
  @Input() placeholder: string = 'Todos';
  @Input() disabled: boolean = false;
  @Output() selectedValuesChange = new EventEmitter<number[]>();

  isOpen = false;
  searchText = '';
  filteredOptions: MevFiltroOption[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filterOptions();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get displayText(): string {
    if (this.selectedValues.length === 0) return this.placeholder;
    if (this.selectedValues.length === 1) {
      const opt = this.options.find(o => o.value === this.selectedValues[0]);
      return opt ? opt.text : '1 seleccionado';
    }
    return `${this.selectedValues.length} seleccionados`;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.filteredOptions = this.options;
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
    }
  }

  filterOptions(): void {
    const term = this.searchText.toLowerCase();
    this.filteredOptions = term
      ? this.options.filter(o => o.text.toLowerCase().includes(term))
      : this.options;
  }

  isSelected(value: number): boolean {
    return this.selectedValues.includes(value);
  }

  toggleOption(value: number): void {
    const idx = this.selectedValues.indexOf(value);
    if (idx >= 0) {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
    } else {
      this.selectedValues = [...this.selectedValues, value];
    }
    this.selectedValuesChange.emit(this.selectedValues);
  }

  clearAll(): void {
    this.selectedValues = [];
    this.selectedValuesChange.emit(this.selectedValues);
  }
}
