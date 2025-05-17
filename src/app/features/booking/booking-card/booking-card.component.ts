import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../core/models/booking.model';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BookingCardComponent {
  @Input() booking!: Booking;
  @Input() showActions = true;
  event: Event | null = null;

  constructor(private eventService: EventService) {
    if (this.booking) {
      this.loadEvent();
    }
  }

  private loadEvent(): void {
    this.eventService.getEventById(this.booking.eventId).subscribe(event => {
      if (event) {
        this.event = event;
      }
    });
  }

  getBookingStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }
} 