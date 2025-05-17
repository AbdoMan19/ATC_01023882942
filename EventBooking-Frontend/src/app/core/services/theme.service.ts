import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly THEME_ATTRIBUTE = 'data-theme';
  
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    // Apply initial theme
    this.applyTheme(this.themeSubject.value);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.THEME_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute(this.THEME_ATTRIBUTE, theme);
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light theme
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute(this.THEME_ATTRIBUTE, theme);
  }
}