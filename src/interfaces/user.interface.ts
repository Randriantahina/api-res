import { Booking } from './booking.interface';

export interface User {
  id: number;
  name: string;
  phone: string;

  bookings: Booking[];

  createdAt: string;
  updatedAt: string;
}
