import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  booking: Booking | null = null;
  loading: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Get booking details from state
    this.booking = history.state.booking;
    if (!this.booking) {
      this.router.navigate(['/bookings']);
      return;
    }
    this.loading = false;
  }

  viewBookings() {
    this.router.navigate(['/bookings']);
  }

  browseEvents() {
    this.router.navigate(['/events']);
  }
} 