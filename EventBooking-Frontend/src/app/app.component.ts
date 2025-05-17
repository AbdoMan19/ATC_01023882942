import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { UserRole } from './core/models/user.model';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/home">Event Booking App</a>
      </div>
      <div class="nav-links">
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a routerLink="/events" routerLinkActive="active">Events</a>
        
        <ng-container *ngIf="authService.isAuthenticated()">
          <!-- User Navigation -->
          <ng-container *ngIf="authService.getCurrentUser()?.role === UserRole.USER">
            <a routerLink="/bookings" routerLinkActive="active">My Bookings</a>
          </ng-container>

          <!-- Admin Navigation -->
          <ng-container *ngIf="authService.getCurrentUser()?.role === UserRole.ADMIN">
            <a routerLink="/admin/dashboard" routerLinkActive="active">Admin Dashboard</a>
            <a routerLink="/admin/events" routerLinkActive="active">Manage Events</a>
          </ng-container>

          <!-- User Menu Dropdown -->
          <div class="user-menu-container">
            <button class="user-menu-button" (click)="toggleUserMenu()">
              <span>{{ authService.getCurrentUser()?.name || 'User' }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown" [class.active]="isUserMenuOpen">
              <a routerLink="/profile" class="dropdown-item">
                <i class="fas fa-user"></i> My Profile
              </a>
              <a routerLink="/settings" class="dropdown-item">
                <i class="fas fa-cog"></i> Settings
              </a>
              <div class="dropdown-divider"></div>
              <a (click)="logout()" class="dropdown-item logout-item">
                <i class="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="!authService.isAuthenticated()">
          <a routerLink="/auth" routerLinkActive="active" class="nav-link">Sign In</a>
        </ng-container>
        
        <!-- Theme Toggle (always visible) -->
        <app-theme-toggle></app-theme-toggle>
      </div>
    </nav>

    <div class="content-wrapper">
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  UserRole = UserRole; // Make UserRole available in template
  isUserMenuOpen = false;

  constructor(public authService: AuthService) {}

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isUserMenuOpen = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}