import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./event-management/event-management.component').then(m => m.EventManagementComponent)
      },
      {
        path: 'events/new',
        loadComponent: () => import('./event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'events/:id/edit',
        loadComponent: () => import('./event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
]; 