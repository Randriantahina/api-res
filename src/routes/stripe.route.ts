import {
  createCheckoutSession,
  successPage,
} from '@/controllers/stripe.controller';
import express from 'express';

const router = express.Router();

router.post('/stripe', createCheckoutSession);
router.get('/success', successPage);

export default router;
