import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  event: any;
  numberOfTickets: number = 1;
  totalAmount: number = 0;
  loading: boolean = false;
  error: string | null = null;
  paymentForm: FormGroup;
  paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: 'fas fa-credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
    { id: 'apple', name: 'Apple Pay', icon: 'fab fa-apple-pay' }
  ];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['card', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const tickets = this.route.snapshot.queryParamMap.get('tickets');
    
    if (eventId) {
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => {
          this.event = event;
          this.numberOfTickets = tickets ? parseInt(tickets) : 1;
          this.calculateTotal();
        },
        error: (error) => {
          this.error = 'Failed to load event details';
          console.error('Event loading error:', error);
        }
      });
    } else {
      this.router.navigate(['/events']);
    }
  }

  calculateTotal() {
    this.totalAmount = this.event.price * this.numberOfTickets;
  }

  updateTickets(value: number) {
    this.numberOfTickets = Math.max(1, this.numberOfTickets + value);
    this.calculateTotal();
  }

  async onSubmit() {
    if (this.paymentForm.valid) {
      this.loading = true;
      this.error = null;

      try {
        const userId = this.authService.getCurrentUser()?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const result = await this.bookingService.bookEvent(
          this.event.id,
          userId,
          this.numberOfTickets
        ).toPromise();
        
        // Navigate to confirmation with booking details
        this.router.navigate(['/events/booking/confirmation'], { 
          state: { booking: result }
        });
      } catch (error) {
        this.error = 'Failed to create booking. Please try again.';
        console.error('Booking error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
} 