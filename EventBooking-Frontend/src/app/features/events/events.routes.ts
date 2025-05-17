import { Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: ':id/checkout',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking/confirmation',
    component: BookingConfirmationComponent,
    canActivate: [AuthGuard]
  }
]; 