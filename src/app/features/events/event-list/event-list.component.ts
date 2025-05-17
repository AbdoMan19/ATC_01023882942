import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { Event, EventCategory } from '../../../core/models/event.model';
import { EventFilterDto, AvailabilityFilter, SortBy, PaginatedResult } from '../../../core/models/event-filter.model';

interface FilterOptions {
  category: EventCategory | 'ALL';
  priceRange: { min: number; max: number };
  dateRange: { start: Date | null; end: Date | null };
  availability: 'all' | 'available' | 'almost-full';
  sortBy: 'date' | 'price' | 'name';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})

export class EventListComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  showFilters: boolean = false;
  selectedCategory: EventCategory | null = null;
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  totalCount = 0;
  
  // Filter options for the UI
  filterOptions: FilterOptions = {
    category: 'ALL',
    priceRange: { min: 0, max: 1000 },
    dateRange: { start: null, end: null },
    availability: 'all',
    sortBy: 'date',
    sortOrder: 'asc'
  };
  
  // API filter object
  eventFilter: EventFilterDto = new EventFilterDto({
    pageNumber: 1,
    pageSize: 6,
    sortBy: SortBy.Date,
    ascending: false
  });

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  EventCategory = EventCategory;

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.eventFilter.searchTerm = term;
      this.loadFilteredEvents();
    });
  }

  ngOnInit(): void {
    // Subscribe to query params to get both search term and category
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
        this.searchQuery = params['search'];
        this.eventFilter.searchTerm = params['search'];
      }
      
      if (params['category']) {
        const category = params['category'] as EventCategory;
        console.log('Received category:', category);
        console.log('Available categories:', Object.values(EventCategory));
        if (Object.values(EventCategory).includes(category)) {
          console.log('Category matched:', category);
          this.filterOptions.category = category;
          this.eventFilter.category = category;
          this.showFilters = true; // Show filters panel when category is selected
        }
      }
      
      if (params['page']) {
        const page = parseInt(params['page'], 10);
        if (!isNaN(page) && page > 0) {
          this.currentPage = page;
          this.eventFilter.pageNumber = page;
        }
      }
      
      this.loadFilteredEvents();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;
    
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filterEvents();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load events. Please try again later.';
        this.isLoading = false;
        console.error('Error loading events:', error);
      }
    });
  }

  loadFilteredEvents(): void {
    this.isLoading = true;
    this.error = null;
    this.syncFilterWithUIOptions();
    
    this.eventService.getFilteredEvents(this.eventFilter).subscribe({
      next: (result) => {
        console.log(result);
        this.filteredEvents = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.currentPage = result.pageNumber;
        this.isLoading = false;
        if (this.currentPage !== this.eventFilter.pageNumber) {
          this.updateUrlWithPage();
        }
      },
      error: (error) => {
        this.error = 'Failed to load events. Please try again later.';
        this.isLoading = false;
        console.error('Error loading filtered events:', error);
      }
    });
  }
  
  syncFilterWithUIOptions(): void {
    if (this.filterOptions.category !== 'ALL') {
      this.eventFilter.category = this.filterOptions.category;
    } else {
      this.eventFilter.category = undefined;
    }
    
    this.eventFilter.minPrice = this.filterOptions.priceRange.min;
    this.eventFilter.maxPrice = this.filterOptions.priceRange.max;
    
    this.eventFilter.startDate = this.filterOptions.dateRange.start || undefined;
    this.eventFilter.endDate = this.filterOptions.dateRange.end || undefined;
    
    // Map availability
    switch (this.filterOptions.availability) {
      case 'available':
        this.eventFilter.availability = AvailabilityFilter.Available;
        break;
      case 'almost-full':
        this.eventFilter.availability = AvailabilityFilter.AlmostFull;
        break;
      default:
        this.eventFilter.availability = AvailabilityFilter.All;
    }
    
    switch (this.filterOptions.sortBy) {
      case 'price':
        this.eventFilter.sortBy = SortBy.Price;
        break;
      case 'name':
        this.eventFilter.sortBy = SortBy.Name;
        break;
      default:
        this.eventFilter.sortBy = SortBy.Date;
    }
    
    this.eventFilter.ascending = this.filterOptions.sortOrder === 'asc';
    
    this.eventFilter.pageNumber = this.currentPage;
    this.eventFilter.pageSize = this.itemsPerPage;
  }

  onViewEvent(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  onSearch(event: any): void {
    const value = event.target.value;
    this.searchSubject.next(value);
    // Update URL with search query
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        search: value || undefined,
        category: this.filterOptions.category !== 'ALL' ? this.filterOptions.category : undefined
      },
      queryParamsHandling: 'merge'
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  updateFilters(filter: Partial<FilterOptions>): void {
    this.filterOptions = { ...this.filterOptions, ...filter };
    
    // Reset to first page when filters change
    this.currentPage = 1;
    this.eventFilter.pageNumber = 1;
    
    // Update the filter and load events
    this.loadFilteredEvents();
    
    // Update URL with category filter
    if (filter.category) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { 
          category: filter.category !== 'ALL' ? filter.category : undefined,
          search: this.searchTerm || undefined,
          page: undefined // Reset page when changing filters
        },
        queryParamsHandling: 'merge'
      });
    }
  }

  resetFilters(): void {
    // Reset filter UI
    this.filterOptions = {
      category: 'ALL',
      priceRange: { min: 0, max: 1000 },
      dateRange: { start: null, end: null },
      availability: 'all',
      sortBy: 'date',
      sortOrder: 'asc'
    };
    
    // Reset API filter
    this.eventFilter = new EventFilterDto({
      searchTerm: this.searchTerm,
      pageNumber: 1,
      pageSize: this.itemsPerPage,
      sortBy: SortBy.Date,
      ascending: false
    });
    
    // Load events with new filter
    this.loadFilteredEvents();
    
    // Clear category from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        category: undefined,
        search: this.searchTerm || undefined,
        page: undefined
      },
      queryParamsHandling: 'merge'
    });
  }

  private filterEvents(): void {
    let filtered = this.events.filter(event => {
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        event.organizer.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = this.filterOptions.category === 'ALL' || 
        event.category === this.filterOptions.category;

      // Price range filter
      const matchesPrice = event.price >= this.filterOptions.priceRange.min && 
        event.price <= this.filterOptions.priceRange.max;

      // Date range filter
      const matchesDate = (!this.filterOptions.dateRange.start || event.startDate >= this.filterOptions.dateRange.start) &&
        (!this.filterOptions.dateRange.end || event.startDate <= this.filterOptions.dateRange.end);

      // Availability filter
      const matchesAvailability = this.filterOptions.availability === 'all' ||
        (this.filterOptions.availability === 'available' && event.availableSeats > 0) ||
        (this.filterOptions.availability === 'almost-full' && event.availableSeats < event.totalSeats * 0.2);

      return matchesSearch && matchesCategory && matchesPrice && matchesDate && matchesAvailability;
    });

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.filterOptions.sortBy) {
        case 'date':
          comparison = a.startDate.getTime() - b.startDate.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return this.filterOptions.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.eventFilter.pageNumber = page;
    console.log(page);
    this.loadFilteredEvents();
    this.updateUrlWithPage();
  }

  getCategoryIcon(category: EventCategory): string {
    switch (category) {
      case EventCategory.MUSIC:
        return 'fa-music';
      case EventCategory.THEATER:
        return 'fa-theater-masks';
      case EventCategory.MOVIES:
        return 'fa-film';
      case EventCategory.EXHIBITION:
        return 'fa-palette';
      default:
        return 'fa-calendar';
    }
  }

  updatePriceRange(type: 'min' | 'max', event: any): void {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      this.updateFilters({
        priceRange: {
          ...this.filterOptions.priceRange,
          [type]: value
        }
      });
    }
  }

  updateUrlWithPage(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        page: this.currentPage > 1 ? this.currentPage : undefined
      },
      queryParamsHandling: 'merge'
    });
  }
}