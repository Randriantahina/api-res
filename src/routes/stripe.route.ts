import {
  createCheckoutSession,
  successPage,
} from '@/controllers/stripe.controller';
import { bookingIdValidator } from '@/validations/stripe.validation';
import express from 'express';

const router = express.Router();

//route pour le paiment
router.post('/stripe', bookingIdValidator, createCheckoutSession);

//route apres le paiment
router.get('/success', successPage);

export default router;
