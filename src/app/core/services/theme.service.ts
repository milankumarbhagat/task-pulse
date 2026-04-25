import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';

import { AppTheme } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<AppTheme>('light');
  theme$ = this.currentTheme.asObservable();

  constructor(
    rendererFactory: RendererFactory2,
    private settingsService: SettingsService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme() {
    // 1. Check local storage first for instant feedback
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.applyTheme(savedTheme);
    }

    // 2. Sync with server preference
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings && settings.theme && settings.theme !== savedTheme) {
          this.applyTheme(settings.theme);
          localStorage.setItem('theme', settings.theme);
        }
      },
      error: () => {
        // Handle guest user or error
      }
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    
    localStorage.setItem('theme', newTheme);
    
    this.settingsService.updateSettings({ theme: newTheme }).subscribe({
        error: (err) => console.error('Failed to save theme preference', err)
    });
  }

  private applyTheme(theme: AppTheme) {
    this.currentTheme.next(theme);
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}
