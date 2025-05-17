import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { BookingService } from '../../../core/services/booking.service';
import { Event } from '../../../core/models/event.model';
import { Booking } from '../../../core/models/booking.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface EventWithBookingCount extends Event {
  bookingCount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats$: Observable<{
    totalEvents: number;
    totalBookings: number;
    upcomingEvents: number;
    recentBookings: Booking[];
    popularEvents: EventWithBookingCount[];
  }>;
  loading = false;
  error: string | null = null;

  constructor(
    private eventService: EventService,
    private bookingService: BookingService
  ) {
    this.stats$ = combineLatest([
      this.eventService.events$,
      this.bookingService.bookings$
    ]).pipe(
      map(([events, bookings]) => {
        const now = new Date();
        const upcomingEvents = events.filter(event => new Date(event.startDate) > now);
        const recentBookings = bookings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const popularEvents = events
          .map(event => ({
            ...event,
            bookingCount: bookings.filter(booking => booking.eventId === event.id).length
          }))
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);

        return {
          totalEvents: events.length,
          totalBookings: bookings.length,
          upcomingEvents: upcomingEvents.length,
          recentBookings,
          popularEvents
        };
      })
    );
  }

  ngOnInit(): void {
    this.loading = true;
    this.bookingService.getUserBookings().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error loading dashboard data';
        this.loading = false;
      }
    });
  }
} 