import { body } from 'express-validator';

export const validateTransfer = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number'),

  body('payer')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(0|261)34\d{7}$/)
    .withMessage('Invalid MVola phone number'),

  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isInt({ gt: 0 })
    .withMessage('Booking ID must be a positive integer'),
];
