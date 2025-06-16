import express from 'express';
import {
  createBooking,
  deleteBooking,
  getAvailableSeats,
  getUserBookings,
  getUserByPhone,
  updateBooking,
} from '@/controllers/booking.controller';
import {
  bookingValidator,
  getUserByPhoneValidator,
  updateBookingValidator,
} from '@/validations/booking.validation';

const router = express.Router();

//pour obtenir tous les user qui on fait la reservation
router.get('/', getUserBookings);

//pour obtenir les users par numero de telephone
router.get('/:phone', getUserByPhoneValidator, getUserByPhone);

//pour voir les places disponibles
router.get('/seats/available', getAvailableSeats);

//pour créer une reservation
router.post('/create', bookingValidator, createBooking);

//pour modifier une reservation
router.put('/update/:id', updateBookingValidator, updateBooking);

//pour supprimer
router.delete('/delete/:id', deleteBooking);
export default router;
