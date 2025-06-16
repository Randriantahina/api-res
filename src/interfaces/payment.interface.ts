import { Booking } from './booking.interface';

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  status: 'pending' | 'paid';

  createdAt: string;
  updatedAt: string;
}
