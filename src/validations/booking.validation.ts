import { body, param } from 'express-validator';

const bookingValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .withMessage('Phone number must be a string'),

  body('seatIds')
    .isArray({ min: 1 })
    .withMessage('Seat IDs must be a non-empty array'),

  body('seatIds.*').isInt().withMessage('Each seat ID must be an integer'),
];

const updateBookingValidator = [
  param('id')
    .exists()
    .withMessage('Booking ID is required')
    .isInt({ gt: 0 })
    .withMessage('Booking ID must be a positive integer'),

  body('seatId')
    .exists()
    .withMessage('seatId is required')
    .isInt({ gt: 0 })
    .withMessage('seatId must be a positive integer'),
];

const getUserByPhoneValidator = [
  param('phone').exists().withMessage('phone number is required'),
];

export { bookingValidator, updateBookingValidator, getUserByPhoneValidator };
