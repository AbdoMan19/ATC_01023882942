import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-featured-events-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-events-carousel.component.html',
  styleUrls: ['./featured-events-carousel.component.scss']
})
export class FeaturedEventsCarouselComponent implements OnInit {
  currentPosition = 0;
  featuredEvents: Event[] = [];
  bookedEvents: Set<string> = new Set();

  constructor(
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFeaturedEvents();
    this.checkBookedEvents();
  }

  private loadFeaturedEvents() {
    this.eventService.getUpcomingEvents().subscribe(events => {
      this.featuredEvents = events;
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

  nextSlide() {
    const itemWidth = 300 + 32; // card width + gap
    const maxPosition = -(this.featuredEvents.length - 3) * itemWidth;
    
    if (this.currentPosition > maxPosition) {
      this.currentPosition -= itemWidth;
    }
  }

  prevSlide() {
    const itemWidth = 300 + 32; // card width + gap
    
    if (this.currentPosition < 0) {
      this.currentPosition += itemWidth;
    }
  }
} 