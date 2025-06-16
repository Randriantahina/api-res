import { Payment } from './payment.interface';
import { Seat } from './seat.interface';
import { User } from './user.interface';

export interface Booking {
  id: number;
  userId: number;
  seatId: number;
  status: 'pending' | 'confirmed';

  payment: Payment[];

  createdAt: string;
  updatedAt: string;
}
