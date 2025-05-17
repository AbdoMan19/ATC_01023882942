import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { FeaturedEventsCarouselComponent } from './featured-events-carousel/featured-events-carousel.component';
import { TrendingEventsComponent } from './trending-events/trending-events.component';
import { BigEventsComponent } from './big-events/big-events.component';
import { StatisticsComponent } from './statistics/statistics.component';

interface Category {
  name: string;
  icon: string;
}

interface Testimonial {
  name: string;
  content: string;
  image: string;
  role: string;
}

interface CountdownEvent {
  id: string;
  name: string;
  date: Date;
  location: string;
  imageUrl: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FeaturedEventsCarouselComponent,
    StatisticsComponent,
    TrendingEventsComponent,
    BigEventsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private countdownSubscription?: Subscription;
  loading = false;
  error: string | null = null;

  categories = [
    { name: 'Music', icon: 'fas fa-music' },
    { name: 'Sports', icon: 'fas fa-futbol' },
    { name: 'Technology', icon: 'fas fa-laptop-code' },
    { name: 'Food & Drink', icon: 'fas fa-utensils' },
    { name: 'Arts', icon: 'fas fa-palette' },
    { name: 'Business', icon: 'fas fa-briefcase' }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'John Doe',
      content: 'Amazing platform! Found and booked tickets for multiple events easily.',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      role: 'Event Organizer'
    },
    {
      name: 'Jane Smith',
      content: 'The best event booking experience I\'ve ever had. Highly recommended!',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      role: 'Regular User'
    }
  ];

  constructor(
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }



  onSearch(query: string) {
    if (query.trim()) {
      this.router.navigate(['/events'], { queryParams: { search: query } });
    }
  }

  onViewEvent(eventId: string) {
    this.router.navigate(['/events', eventId]);
  }

  onViewCategory(category: string) {
    // Map the category name to the corresponding EventCategory value
    const categoryMap: { [key: string]: string } = {
      'Music': 'Music',
      'Sports': 'Sports',
      'Technology': 'Technology',
      'Food & Drink': 'Food & Drink',
      'Arts': 'Art',
      'Business': 'Technology' // Map business to Technology category
    };

    const eventCategory = categoryMap[category] || category;
    this.router.navigate(['/events'], { queryParams: { category: eventCategory } });
  }

  onBookEvent(eventId: string): void {
    this.router.navigate(['/events', eventId], {
      queryParams: { mode: 'booking' }
    });
  }

  onViewAllEvents(): void {
    this.router.navigate(['/events']);
  }

  setReminder(eventName: string): void {
    // Check if browser supports notifications
    if ('Notification' in window) {
      // Request permission if not already granted
      if (Notification.permission === 'granted') {
        this.scheduleReminder(eventName);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.scheduleReminder(eventName);
          }
        });
      }
    }
  }

  private scheduleReminder(eventName: string): void {
    // Create a notification
    const notification = new Notification('Event Reminder Set', {
      body: `You will be reminded about ${eventName}`,
      icon: '/assets/icons/notification-icon.png'
    });

    // Store the reminder in localStorage
    const reminders = JSON.parse(localStorage.getItem('eventReminders') || '[]');
    reminders.push({
      eventName,
      date: new Date().toISOString(),
      notified: false
    });
    localStorage.setItem('eventReminders', JSON.stringify(reminders));

    // Show confirmation to user
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  onGetStarted(): void {
    this.router.navigate(['/events']);
  }
} 