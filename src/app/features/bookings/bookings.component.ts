import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking.model';
import { BookingStatus } from '../../core/models/booking-status.enum';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading: boolean = true;
  error: string | null = null;
  BookingStatus = BookingStatus; // Make enum available in template

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.error = null;

    this.bookingService.getUserBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load bookings. Please try again later.';
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  cancelBooking(bookingId: string) {
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        this.error = 'Failed to cancel booking. Please try again.';
        console.error('Error cancelling booking:', error);
      }
    });
  }
} 