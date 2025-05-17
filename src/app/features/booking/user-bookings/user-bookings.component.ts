import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';
import { BookingStatus } from '../../../core/models/booking-status.enum';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss']
})
export class UserBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  BookingStatus = BookingStatus; // Make enum available in template

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error loading bookings';
        this.loading = false;
      }
    });
  }

  cancelBooking(id: string) {
    this.loading = true;
    this.bookingService.cancelBooking(id).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        this.error = error.message || 'Error cancelling booking';
        this.loading = false;
      }
    });
  }
} 