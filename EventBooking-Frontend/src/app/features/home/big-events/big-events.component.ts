import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { interval, Subscription } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-big-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './big-events.component.html',
  styleUrls: ['./big-events.component.scss']
})
export class BigEventsComponent implements OnInit, OnDestroy {
  bigEvents: Event[] = [];
  bookedEvents: Set<string> = new Set();
  private countdownSubscription?: Subscription;

  constructor(
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadBigEvents();
    this.startCountdown();
    this.checkBookedEvents();
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private loadBigEvents() {
    this.eventService.getBigEvents().subscribe(events => {
      this.bigEvents = events.slice(0, 2);
      this.updateCountdown();
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

  private startCountdown() {
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
    });
  }

  private updateCountdown() {
    const now = new Date().getTime();
    this.bigEvents.forEach(event => {
      const eventTime = new Date(event.startDate).getTime();
      const distance = eventTime - now;
      
      event.timeRemaining = {
        days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000))
      };
    });
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