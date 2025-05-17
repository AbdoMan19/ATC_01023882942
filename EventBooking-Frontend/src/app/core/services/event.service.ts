import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Event, EventCategory, EventStatus } from '../models/event.model';
import { EventFilterDto, PaginatedResult, AvailabilityFilter, SortBy } from '../models/event-filter.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/event`;
  private mockEvents: Event[] = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Central Park, NY',
      description: 'Join us for an amazing summer music festival featuring top artists from around the world.',
      price: 99,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: EventCategory.MUSIC,
      organizer: {
        name: 'EventPro Productions',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.8
      },
      ticketsSold: 750,
      duration: 3,
      availableSeats: 5000,
      totalSeats: 10000,
      status: EventStatus.UPCOMING,
      tags: ['Music', 'Festival', 'Outdoor', 'Summer'],
      schedule: [
        {
          time: '18:00',
          activity: 'Doors Open',
          description: 'Gates open for attendees'
        },
        {
          time: '19:00',
          activity: 'Opening Ceremony',
          description: 'Welcome speech and introduction'
        },
        {
          time: '20:00',
          activity: 'Main Performance',
          description: 'Headline artist performance'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
      ],
      faq: [
        {
          question: 'What should I bring?',
          answer: 'Please bring your ticket, ID, and any necessary personal items. Outside food and drinks are not permitted.'
        },
        {
          question: 'Is there parking available?',
          answer: 'Yes, there is parking available at the venue. Please arrive early as spaces are limited.'
        }
      ],
      reviews: [
        {
          user: {
            name: 'John Doe',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          },
          rating: 5,
          comment: 'Amazing event! The atmosphere was incredible.',
          date: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Central Park, NY',
      description: 'Join us for an amazing summer music festival featuring top artists from around the world.',
      price: 99,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: EventCategory.MUSIC,
      organizer: {
        name: 'EventPro Productions',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.8
      },
      ticketsSold: 750,
      duration: 3,
      availableSeats: 5000,
      totalSeats: 10000,
      status: EventStatus.UPCOMING,
      tags: ['Music', 'Festival', 'Outdoor', 'Summer'],
      schedule: [
        {
          time: '18:00',
          activity: 'Doors Open',
          description: 'Gates open for attendees'
        },
        {
          time: '19:00',
          activity: 'Opening Ceremony',
          description: 'Welcome speech and introduction'
        },
        {
          time: '20:00',
          activity: 'Main Performance',
          description: 'Headline artist performance'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
      ],
      faq: [
        {
          question: 'What should I bring?',
          answer: 'Please bring your ticket, ID, and any necessary personal items. Outside food and drinks are not permitted.'
        },
        {
          question: 'Is there parking available?',
          answer: 'Yes, there is parking available at the venue. Please arrive early as spaces are limited.'
        }
      ],
      reviews: [
        {
          user: {
            name: 'John Doe',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          },
          rating: 5,
          comment: 'Amazing event! The atmosphere was incredible.',
          date: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '7',
      title: 'Summer Music Festival 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Central Park, NY',
      description: 'Join us for an amazing summer music festival featuring top artists from around the world.',
      price: 99,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: EventCategory.MUSIC,
      organizer: {
        name: 'EventPro Productions',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.8
      },
      ticketsSold: 750,
      duration: 3,
      availableSeats: 5000,
      totalSeats: 10000,
      status: EventStatus.UPCOMING,
      tags: ['Music', 'Festival', 'Outdoor', 'Summer'],
      schedule: [
        {
          time: '18:00',
          activity: 'Doors Open',
          description: 'Gates open for attendees'
        },
        {
          time: '19:00',
          activity: 'Opening Ceremony',
          description: 'Welcome speech and introduction'
        },
        {
          time: '20:00',
          activity: 'Main Performance',
          description: 'Headline artist performance'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
      ],
      faq: [
        {
          question: 'What should I bring?',
          answer: 'Please bring your ticket, ID, and any necessary personal items. Outside food and drinks are not permitted.'
        },
        {
          question: 'Is there parking available?',
          answer: 'Yes, there is parking available at the venue. Please arrive early as spaces are limited.'
        }
      ],
      reviews: [
        {
          user: {
            name: 'John Doe',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          },
          rating: 5,
          comment: 'Amazing event! The atmosphere was incredible.',
          date: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '6',
      title: 'Summer Music Festival 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Central Park, NY',
      description: 'Join us for an amazing summer music festival featuring top artists from around the world.',
      price: 99,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: EventCategory.MUSIC,
      organizer: {
        name: 'EventPro Productions',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.8
      },
      ticketsSold: 750,
      duration: 3,
      availableSeats: 5000,
      totalSeats: 10000,
      status: EventStatus.UPCOMING,
      tags: ['Music', 'Festival', 'Outdoor', 'Summer'],
      schedule: [
        {
          time: '18:00',
          activity: 'Doors Open',
          description: 'Gates open for attendees'
        },
        {
          time: '19:00',
          activity: 'Opening Ceremony',
          description: 'Welcome speech and introduction'
        },
        {
          time: '20:00',
          activity: 'Main Performance',
          description: 'Headline artist performance'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
      ],
      faq: [
        {
          question: 'What should I bring?',
          answer: 'Please bring your ticket, ID, and any necessary personal items. Outside food and drinks are not permitted.'
        },
        {
          question: 'Is there parking available?',
          answer: 'Yes, there is parking available at the venue. Please arrive early as spaces are limited.'
        }
      ],
      reviews: [
        {
          user: {
            name: 'John Doe',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          },
          rating: 5,
          comment: 'Amazing event! The atmosphere was incredible.',
          date: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '5',
      title: 'Summer Music Festival 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Central Park, NY',
      description: 'Join us for an amazing summer music festival featuring top artists from around the world.',
      price: 99,
      imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: EventCategory.MUSIC,
      organizer: {
        name: 'EventPro Productions',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.8
      },
      ticketsSold: 750,
      duration: 3,
      availableSeats: 5000,
      totalSeats: 10000,
      status: EventStatus.UPCOMING,
      tags: ['Music', 'Festival', 'Outdoor', 'Summer'],
      schedule: [
        {
          time: '18:00',
          activity: 'Doors Open',
          description: 'Gates open for attendees'
        },
        {
          time: '19:00',
          activity: 'Opening Ceremony',
          description: 'Welcome speech and introduction'
        },
        {
          time: '20:00',
          activity: 'Main Performance',
          description: 'Headline artist performance'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg'
      ],
      faq: [
        {
          question: 'What should I bring?',
          answer: 'Please bring your ticket, ID, and any necessary personal items. Outside food and drinks are not permitted.'
        },
        {
          question: 'Is there parking available?',
          answer: 'Yes, there is parking available at the venue. Please arrive early as spaces are limited.'
        }
      ],
      reviews: [
        {
          user: {
            name: 'John Doe',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          },
          rating: 5,
          comment: 'Amazing event! The atmosphere was incredible.',
          date: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '2',

      title: 'Hamlet - Modern Adaptation',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 15);
        date.setHours(19, 30, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 50);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'Royal Theater, London',
      description: 'A contemporary take on Shakespeare\'s classic tragedy, featuring innovative staging and modern interpretations.',
      price: 75,
      imageUrl: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      category: EventCategory.THEATER,
      organizer: {
        name: 'Royal Theater Company',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.9
      },
      ticketsSold: 300,
      duration: 2.5,
      availableSeats: 200,
      totalSeats: 500,
      status: EventStatus.UPCOMING,
      tags: ['Theater', 'Drama', 'Classic', 'Shakespeare'],
      schedule: [
        {
          time: '19:00',
          activity: 'Doors Open',
          description: 'Theater doors open'
        },
        {
          time: '19:30',
          activity: 'Performance',
          description: 'Main performance begins'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
        'https://images.pexels.com/photos/1763076/pexels-photo-1763076.jpeg'
      ],
      faq: [
        {
          question: 'Is there an intermission?',
          answer: 'Yes, there is a 15-minute intermission halfway through the performance.'
        }
      ],
      reviews: []
    },
    {
      id: '3',
      title: 'Marvel\'s New Blockbuster Premiere',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 80);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),
      location: 'IMAX Theater, Los Angeles',
      description: 'Be the first to experience the latest Marvel cinematic masterpiece in stunning IMAX format.',
      price: 25,
      imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
      category: EventCategory.MOVIES,
      organizer: {
        name: 'Marvel Studios',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.7
      },
      ticketsSold: 250,
      duration: 2,
      availableSeats: 50,
      totalSeats: 300,
      status: EventStatus.UPCOMING,
      tags: ['Movies', 'Premiere', 'IMAX', 'Marvel'],
      schedule: [
        {
          time: '19:30',
          activity: 'Doors Open',
          description: 'Theater doors open'
        },
        {
          time: '20:00',
          activity: 'Movie Starts',
          description: 'Feature presentation begins'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
        'https://images.pexels.com/photos/7991580/pexels-photo-7991580.jpeg'
      ],
      faq: [],
      reviews: []
    },
    {
      id: '4',
      title: 'Modern Art Exhibition 2024',
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 45);
        date.setHours(10, 0, 0, 0);
        return date;
      })(),
      endDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 80);
        date.setHours(18, 0, 0, 0);
        return date;
      })(),

      location: 'Museum of Modern Art, Paris',
      description: 'A stunning collection of contemporary artworks from emerging and established artists worldwide.',
      price: 35,
      imageUrl: 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg',
      category: EventCategory.EXHIBITION,
      organizer: {
        name: 'Paris Modern Art Museum',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 4.6
      },
      ticketsSold: 100,
      duration: 4,
      availableSeats: 100,
      totalSeats: 200,
      status: EventStatus.UPCOMING,
      tags: ['Art', 'Exhibition', 'Modern', 'Culture'],
      schedule: [
        {
          time: '10:00',
          activity: 'Exhibition Opens',
          description: 'Doors open to the public'
        },
        {
          time: '14:00',
          activity: 'Guided Tour',
          description: 'Expert-led tour of the exhibition'
        }
      ],
      gallery: [
        'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg',
        'https://images.pexels.com/photos/1674050/pexels-photo-1674050.jpeg'
      ],
      faq: [
        {
          question: 'Are guided tours included?',
          answer: 'Yes, guided tours are included in the ticket price and start at 2 PM daily.'
        }
      ],
      reviews: []
    }
  ];

  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {
    if (environment.mockApi) {
      this.loadMockEvents();
    }
  }

  private loadMockEvents() {
    this.eventsSubject.next(this.mockEvents);
  }

  private convertEventDates(event: Event): Event {
    return {
      ...event,
      startDate: new Date(event.startDate),
      reviews: event.reviews?.map(review => ({
        ...review,
        date: new Date(review.date)
      }))
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    console.log(token);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getEvents(): Observable<Event[]> {
    if (environment.mockApi) {
      return this.events$.pipe(
        map(events => events.map(event => this.convertEventDates(event)))
      );
    }
    return this.http.get<{data: Event[], message: string, errorList: string[]}>(`${this.apiUrl}/admin/all`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data.map(event => this.convertEventDates(event)))
    );
  }

  getEventById(id: string): Observable<Event | null> {
    if (environment.mockApi) {
      const event = this.mockEvents.find(e => e.id === id);
      return of(event ? this.convertEventDates(event) : null);
    }
    return this.http.get<{data: Event, message: string, errorList: string[]}>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.convertEventDates(response.data))
    );
  }

  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    console.log('create event:', environment.mockApi);
    if (environment.mockApi) {
      const newEvent: Event = {
        ...event,
        id: Date.now().toString()
      };
      const convertedEvent = this.convertEventDates(newEvent);
      this.mockEvents.push(convertedEvent);
      this.eventsSubject.next([...this.mockEvents]);
      return of(convertedEvent);
    }
    return this.http.post<{data: Event, message: string, errorList: string[]}>(`${this.apiUrl}/create`, event, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.convertEventDates(response.data))
    );
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    console.log('Updating event:', environment.mockApi);
    if (environment.mockApi) {
      const index = this.mockEvents.findIndex(e => e.id === id);
      if (index === -1) {
        return throwError(() => new Error(`Event with id ${id} not found`));
      }
      const updatedEvent = { ...this.mockEvents[index], ...event };
      const convertedEvent = this.convertEventDates(updatedEvent);
      this.mockEvents[index] = convertedEvent;
      this.eventsSubject.next([...this.mockEvents]);
      return of(convertedEvent);
    }
    return this.http.put<{data: Event, message: string, errorList: string[]}>(`${this.apiUrl}/${id}`, event, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => this.convertEventDates(response.data))
    );
  }

  deleteEvent(id: string): Observable<void> {
    if (environment.mockApi) {
      const index = this.mockEvents.findIndex(e => e.id === id);
      if (index === -1) {
        return throwError(() => new Error(`Event with id ${id} not found`));
      }
      this.mockEvents.splice(index, 1);
      this.eventsSubject.next([...this.mockEvents]);
      return of(void 0);
    }
    return this.http.delete<{data: any, message: string, errorList: string[]}>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => void 0)
    );
  }

  getUpcomingEvents(): Observable<Event[]> {
    if (environment.mockApi) {
      return of(this.mockEvents);
    }
    return this.http.get<{data: Event[], message: string, errorList: string[]}>(`${this.apiUrl}/events/upcoming`).pipe(
      map(response => response.data.map(event => this.convertEventDates(event)))
    );
  }

  getTrendingEvents(): Observable<Event[]> {
    if (environment.mockApi) {
      return of(this.mockEvents
        .sort((a, b) => b.ticketsSold - a.ticketsSold)
        .slice(0, 3));
    }
    return this.http.get<{data: Event[], message: string, errorList: string[]}>(`${this.apiUrl}/events/trending`).pipe(
      map(response => response.data.map(event => this.convertEventDates(event)))
    );
  }

  getBigEvents(): Observable<Event[]> {
    if (environment.mockApi) {
      return of(this.mockEvents);
    }
    return this.http.get<{data: Event[], message: string, errorList: string[]}>(`${this.apiUrl}/events/big`).pipe(
      map(response => response.data.map(event => this.convertEventDates(event)))
    );
  }

  getEventsByCategory(category: EventCategory): Observable<Event[]> {
    return this.getEvents().pipe(
      map(events => events.filter(event => event.category === category))
    );
  }

  getEventsByTag(tag: string): Observable<Event[]> {
    return this.getEvents().pipe(
      map(events => events.filter(event => 
        event.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      ))
    );
  }

  searchEvents(query: string): Observable<Event[]> {
    const searchTerm = query.toLowerCase();
    return this.getEvents().pipe(
      map(events => events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        event.organizer.name.toLowerCase().includes(searchTerm)
      ))
    );
  }

  getFilteredEvents(filter: EventFilterDto): Observable<PaginatedResult<Event>> {
    if (environment.mockApi) {
      // Get all events and apply filters manually for mock implementation
      let filteredEvents = [...this.mockEvents];
      
      // Apply search filter
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          event.organizer.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply category filter
      if (filter.category && filter.category !== 'ALL') {
        filteredEvents = filteredEvents.filter(event => 
          event.category === filter.category
        );
      }
      
      // Apply date range filter
      if (filter.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.startDate) >= new Date(filter.startDate!)
        );
      }
      
      if (filter.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.startDate) <= new Date(filter.endDate!)
        );
      }
      
      // Apply price range filter
      if (filter.minPrice !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.price >= filter.minPrice!
        );
      }
      
      if (filter.maxPrice !== undefined) {
        filteredEvents = filteredEvents.filter(event => 
          event.price <= filter.maxPrice!
        );
      }
      
      // Apply availability filter
      if (filter.availability === AvailabilityFilter.Available) {
        filteredEvents = filteredEvents.filter(event => 
          event.availableSeats > 0
        );
      } else if (filter.availability === AvailabilityFilter.AlmostFull) {
        filteredEvents = filteredEvents.filter(event => 
          event.availableSeats > 0 && event.availableSeats < (event.totalSeats * 0.2)
        );
      }
      
      // Apply sorting
      filteredEvents.sort((a, b) => {
        let comparison = 0;
        
        switch (filter.sortBy) {
          case SortBy.Date:
            comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            break;
          case SortBy.Price:
            comparison = a.price - b.price;
            break;
          case SortBy.Name:
            comparison = a.title.localeCompare(b.title);
            break;
          default:
            comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        
        return filter.ascending ? comparison : -comparison;
      });
      
      // Apply pagination
      const totalCount = filteredEvents.length;
      const totalPages = Math.ceil(totalCount / filter.pageSize);
      const startIndex = (filter.pageNumber - 1) * filter.pageSize;
      const paginatedEvents = filteredEvents.slice(startIndex, startIndex + filter.pageSize);
      
      // Create paginated result
      const result: PaginatedResult<Event> = {
        items: paginatedEvents.map(event => this.convertEventDates(event)),
        totalCount,
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
        totalPages
      };
      
      return of(result);
    }
    
    // For real API implementation - send filter object only in the body with auth headers
    return this.http.post<{data: PaginatedResult<Event>, message: string, errorList: string[]}>(`${this.apiUrl}/events`, filter, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        response.data.items = response.data.items.map(event => this.convertEventDates(event));
        return response.data;
      })
    );
  }
}