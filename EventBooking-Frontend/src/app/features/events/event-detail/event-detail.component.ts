import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, interval, combineLatest } from 'rxjs';
import { takeUntil, filter, map, switchMap, tap } from 'rxjs/operators';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../core/models/event.model';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event$: Observable<Event>;
  selectedTab = 'details';
  ticketsToBuy = 1;
  showGallery = false;
  selectedImage = '';
  timeRemaining = '';
  maxTicketsError = false;
  hasBooked = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {
    this.event$ = this.route.paramMap.pipe(
      map(params => params.get('id') || params.get('slug')),
      filter((id): id is string => id !== null),
      switchMap(id => this.eventService.getEventById(id)),
      filter((event): event is Event => event !== null)
    );
  }

  ngOnInit(): void {
    // Start countdown timer
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.event$.subscribe(event => {
          const now = new Date();
          const eventDate = new Date(event.startDate);
          const diff = eventDate.getTime() - now.getTime();
          
          if (diff <= 0) {
            this.timeRemaining = 'Event has started';
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          this.timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        });
      });

    // Check if user has already booked this event
    this.event$.pipe(
      takeUntil(this.destroy$),
      tap(event => {
      if (this.authService.isAuthenticated()) {
        this.bookingService.hasUserBookedEvent(event.id).subscribe(hasBooked => {
          this.hasBooked = hasBooked;
        });
      }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTab(tab: string): void {
    this.selectedTab = tab;
  }

  incrementTickets(): void {
    this.maxTicketsError = true;
  }

  decrementTickets(): void {
    if (this.ticketsToBuy > 1) {
      this.ticketsToBuy--;
      this.maxTicketsError = false;
    }
  }

  calculatePrice(event: Event): number {
    return event.price * this.ticketsToBuy;
  }

  getProgressPercentage(event: Event): number {
    return (event.ticketsSold / event.totalSeats) * 100;
  }

  getRemainingTickets(event: Event): number {
    return event.availableSeats;
  }

  openGallery(image: string): void {
    this.selectedImage = image;
    this.showGallery = true;
  }

  closeGallery(): void {
    this.showGallery = false;
    this.selectedImage = '';
  }

  buyTickets(event: Event): void {
    if (this.hasBooked) {
      return;
    }

    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated, navigating to checkout');
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('No current user found');
        return;
      }
            this.router.navigate(['/events', event.id, 'checkout'], {
        queryParams: { tickets: this.ticketsToBuy }
        });
    } else {
      console.log('User is not authenticated, redirecting to login');
      const returnUrl = `/events/${event.id}/checkout?tickets=${this.ticketsToBuy}`;
      this.authService.setRedirectUrl(returnUrl);
      this.router.navigate(['/auth/login']);
    }
  }

  shareEvent(event: Event): void {
    // Implement share functionality
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: shareUrl
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareUrl);
      alert('Event URL copied to clipboard!');
    }
  }
} 