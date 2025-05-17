import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: EventListComponent
  },
  {
    path: ':id',
    component: EventDetailComponent
  },
  {
    path: ':id/checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'booking/confirmation',
    component: BookingConfirmationComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { } 