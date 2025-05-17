export interface Booking {
  id: string;//
  eventId: string;//
  eventName: string;//
  eventDate: Date;//
  eventTime: string;//
  eventLocation: string;
  numberOfTickets: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
}

import{BookingStatus} from './booking-status.enum';