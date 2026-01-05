import { Component } from '@angular/core';
import { CoreConfigService } from '../../app/core/services/config.service';
import { Subject, takeUntil } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faGavel, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FontAwesomeModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  faGavel = faGavel;
  faMoon = faMoon;
  faSun = faSun;

  sidebarOpen = true;
  isDark = false;
  private _unsubscribeAll$: Subject<any>;

  public constructor(private _coreConfigService: CoreConfigService) {
    this._unsubscribeAll$ = new Subject();
  }
  public coreConfig: any;

  public ngOnInit(): void {
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll$)).subscribe((config: any) => {
      this.coreConfig = config;
    });

    const stored = localStorage.getItem('theme');
    if (stored === 'dark') this.isDark = true;
    else if (stored === 'light') this.isDark = false;
    else this.isDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    this.applyThemeClass();

    if (window.innerWidth < 640) this.sidebarOpen = false;      
  }

  applyThemeClass(): void {
      const root = document.documentElement;
      if (this.isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyThemeClass();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}