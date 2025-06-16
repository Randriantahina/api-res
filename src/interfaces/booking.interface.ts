import { Payment } from './payment.interface';

export interface Booking {
  id: number;
  userId: number;
  seatId: number;
  status: 'pending' | 'confirmed';

  payment: Payment[];

  createdAt: string;
  updatedAt: string;
}
