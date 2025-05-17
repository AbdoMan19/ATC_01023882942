import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking } from '../models/booking.model';
import { environment } from '../../../environments/environment';
import { EventService } from './event.service';
import { AuthService } from './auth.service';
import { BookingStatus } from '../models/booking-status.enum';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();
  loading = false;
  error: string | null = null;
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private authService: AuthService
  ) {
    if (environment.mockApi) {
      this.loadMockBookings();
    } else {
      // Load user's bookings when service is initialized
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.loadUserBookings();
      }
    }
  }

  private loadUserBookings(): void {
    this.http.get<Booking[]>(`${this.apiUrl}/user`).subscribe({
      next: (bookings) => {
        this.bookingsSubject.next(bookings);
      },
      error: (error) => {
        console.error('Error loading user bookings:', error);
        this.error = 'Failed to load bookings';
      }
    });
  }

  private loadMockBookings(): void {
    const mockBookings: Booking[] = [
      {
        id: '1',
        eventId: '1',
        eventName: 'Summer Music Festival 2024',
        eventDate: new Date('2024-07-15'),
        eventTime: '19:00',
        eventLocation: 'Central Park, NY',
        numberOfTickets: 2,
        totalPrice: 198,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date('2024-03-01')
      },
      {
        id: '2',
        eventId: '2',
        eventName: 'Hamlet - Modern Adaptation',
        eventDate: new Date('2024-08-20'),
        eventTime: '19:30',
        eventLocation: 'Royal Theater, London',
        numberOfTickets: 1,
        totalPrice: 75,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date('2024-03-02')
      }
    ];
    this.bookingsSubject.next(mockBookings);
  }

  bookEvent(eventId: string, userId: string, numberOfTickets: number = 1): Observable<Booking> {
    this.loading = true;
    this.error = null;

    if (environment.mockApi) {
      // Mock flow: Get event details and create booking
      return this.eventService.getEventById(eventId).pipe(
        map(event => {
          if (!event) {
            throw new Error('Event not found');
          }
          const newBooking: Booking = {
            id: this.generateId(),
            eventId,
            eventName: event.title,
            eventDate: event.startDate,
            eventTime: event.schedule[0]?.time || '00:00',
            eventLocation: event.location,
            numberOfTickets,
            totalPrice: event.price * numberOfTickets,
            status: BookingStatus.CONFIRMED,
            createdAt: new Date()
          };

          // Add to local bookings
          this.bookingsSubject.next([...this.bookingsSubject.value, newBooking]);
          this.loading = false;
          return newBooking;
        })
      );
    } else {
      // Real API flow
      return this.eventService.getEventById(eventId).pipe(
        map(event => {
          if (!event) {
            throw new Error('Event not found');
          }
          return {
            eventId,
            userId,
            eventName: event.title,
            eventDate: event.startDate,
            eventTime: event.schedule[0]?.time || '00:00',
            eventLocation: event.location,
            numberOfTickets,
            totalAmount: event.price * numberOfTickets,
            status: BookingStatus.CONFIRMED
          };
        }),
        switchMap(booking => this.createBooking(booking))
      );
    }
  }

  getUserBookings(): Observable<Booking[]> {
    if (environment.mockApi) {
      return this.bookings$;
    }
    return this.http.get<Booking[]>(`${this.apiUrl}/user`);
  }

  getBookingById(id: string): Observable<Booking> {
    if (environment.mockApi) {
      return this.bookings$.pipe(
        map(bookings => {
          const booking = bookings.find(b => b.id === id);
          if (!booking) {
            throw new Error('Booking not found');
          }
          return booking;
        })
      );
    }
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: Partial<Booking>): Observable<Booking> {
    if (environment.mockApi) {
      const newBooking: Booking = {
        ...booking as Booking,
        id: this.generateId(),
        createdAt: new Date(),
      };
      this.bookingsSubject.next([...this.bookingsSubject.value, newBooking]);
      return of(newBooking);
    }
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  cancelBooking(id: string): Observable<Booking> {
    if (environment.mockApi) {
      const bookings = this.bookingsSubject.value;
      const bookingIndex = bookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }
      const updatedBooking = { ...bookings[bookingIndex], status: BookingStatus.CANCELLED };
      bookings[bookingIndex] = updatedBooking;
      this.bookingsSubject.next(bookings);
      return of(updatedBooking);
    }
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }

  updateBooking(id: string, booking: Partial<Booking>): Observable<Booking> {
    if (environment.mockApi) {
      const bookings = this.bookingsSubject.value;
      const bookingIndex = bookings.findIndex(b => b.id === id);
      if (bookingIndex === -1) {
        throw new Error('Booking not found');
      }
      const updatedBooking = { ...bookings[bookingIndex], ...booking };
      bookings[bookingIndex] = updatedBooking;
      this.bookingsSubject.next(bookings);
      return of(updatedBooking);
    }
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  private generateId(): string {
    const currentIds = this.bookingsSubject.value.map(b => parseInt(b.id));
    const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
    return (maxId + 1).toString();
  }

  clearBookings(): void {
    this.bookingsSubject.next([]);
  }

  hasUserBookedEvent(eventId: string): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }

    if (environment.mockApi) {
      // Use the cached bookings from BehaviorSubject
      return this.bookings$.pipe(
        map(bookings => bookings.some(booking => 
          booking.eventId === eventId && 
          booking.status === BookingStatus.CONFIRMED
        ))
      );
    }

    // For real API, use a dedicated endpoint
    return this.http.get<boolean>(`${this.apiUrl}/check/${eventId}`);
  }
} 