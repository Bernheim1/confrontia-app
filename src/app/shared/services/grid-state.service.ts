import { Injectable } from '@angular/core';

export interface GridState<TFilters = Record<string, any>, TData = any> {
  filters: TFilters;
  data: TData;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  extras?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class GridStateService {
  private states = new Map<string, GridState>();

  save<TFilters extends Record<string, any>, TData>(key: string, state: GridState<TFilters, TData>): void {
    this.states.set(key, state);
  }

  restore<TFilters = Record<string, any>, TData = any>(key: string): GridState<TFilters, TData> | null {
    return (this.states.get(key) as GridState<TFilters, TData>) ?? null;
  }

  clear(key: string): void {
    this.states.delete(key);
  }

  has(key: string): boolean {
    return this.states.has(key);
  }
}
