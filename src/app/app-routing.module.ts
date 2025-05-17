import { Routes } from '@angular/router';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
import { UserBookingsComponent } from './features/booking/user-bookings/user-bookings.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { 
    path: 'bookings', 
    component: UserBookingsComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/events' }
]; 