import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-trending-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trending-events.component.html',
  styleUrls: ['./trending-events.component.scss']
})
export class TrendingEventsComponent implements OnInit {
  trendingEvents: Event[] = [];
  bookedEvents: Set<string> = new Set();

  constructor(
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTrendingEvents();
    this.checkBookedEvents();
  }

  private loadTrendingEvents() {
    this.eventService.getTrendingEvents().subscribe(events => {
      this.trendingEvents = events;
    });
  }

  private checkBookedEvents() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.bookingService.getUserBookings().subscribe(bookings => {
        this.bookedEvents = new Set(bookings.map(booking => booking.eventId));
      });
    }
  }

  onViewEvent(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  onBookEvent(eventId: string): void {
    if (this.bookedEvents.has(eventId)) {
      return; // Already booked
    }
    this.router.navigate(['/events', eventId], {
      queryParams: { mode: 'booking' }
    });
  }

  isEventBooked(eventId: string): boolean {
    return this.bookedEvents.has(eventId);
  }
} 