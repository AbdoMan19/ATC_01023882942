import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { Event as EventModel, EventCategory } from '../../../core/models/event.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class EventManagementComponent implements OnInit {
  events$: Observable<EventModel[]>;
  loading = false;
  error: string | null = null;
  searchTerm = new BehaviorSubject<string>('');
  selectedCategory = new BehaviorSubject<EventCategory | 'ALL'>('ALL');
  categories = Object.values(EventCategory);

  constructor(
    private eventService: EventService,
    private router: Router
  ) {
    this.events$ = combineLatest([
      this.eventService.events$,
      this.searchTerm,
      this.selectedCategory
    ]).pipe(
      map(([events, search, category]) => {
        return events
          .filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
              event.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'ALL' || event.category === category;
            return matchesSearch && matchesCategory;
          })
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      })
    );
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;
    this.eventService.getEvents().subscribe({
      next: () => this.loading = false,
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.next((event.target as HTMLInputElement).value);
  }

  onCategoryChange(category: EventCategory | 'ALL'): void {
    this.selectedCategory.next(category);
  }

  onCreateEvent(): void {
    this.router.navigate(['/admin/events/new']);
  }

  onEditEvent(eventId: string): void {
    this.router.navigate(['/admin/events', eventId, 'edit']);
  }

  onDeleteEvent(event: EventModel): void {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          // Event deleted successfully
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }
} 