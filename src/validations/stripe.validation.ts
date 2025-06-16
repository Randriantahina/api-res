import { body } from 'express-validator';

export const bookingIdValidator = [
  body('bookingId')
    .exists()
    .withMessage('bookingId required')
    .isInt({ gt: 0 })
    .withMessage('must be a positif integer'),
];
