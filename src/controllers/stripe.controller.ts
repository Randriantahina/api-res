// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import stripe from '../utils/stripe';

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 1000,
            product_data: {
              name: 'Billet de bus',
              description: 'Trajet Antananarivo - Tamatave',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5000/api/payment/success',
      cancel_url: 'http://localhost:5000/api/payment/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

export const successPage = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Paiement réussi ! Merci pour votre achat.',
  });
};
