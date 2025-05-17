import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingRoutingModule } from './booking-routing.module';
import { UserBookingsComponent } from './user-bookings/user-bookings.component';
import { BookingCardComponent } from './booking-card/booking-card.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    UserBookingsComponent,
    BookingCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BookingRoutingModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  exports: [
    BookingCardComponent
  ]
})
export class BookingModule { } 