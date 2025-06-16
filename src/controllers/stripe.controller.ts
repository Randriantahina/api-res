import prisma from '@/lib/db';
import stripe from '@/utils/stripe';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const createCheckoutSession = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { bookingId } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seat: true, user: true },
    });

    if (!booking) {
      res.json({ bookingNotFound: true });
      return;
    }

    if (booking.status === 'paid') {
      res.json({ bookingAlreadyPaid: true });
      return;
    }

    const amount = 2500;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Réservation siège ${booking.seat.seatNumber}`,
              description: `Réservation ID: ${booking.id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5000/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        'http://localhost:5000/api/payment/cancel?bookingId=${booking.id}',
      metadata: {
        bookingId: booking.id.toString(),
      },
    });

    res.status(200).json({ url: session.url });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const successPage = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    res.json({ sessionIdNotFound: true });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.json({ paymentNotConfirmed: true });
      return;
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      res.json({ bookingNotFound: true });
      return;
    }

    await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: 'confirmed', updatedAt: new Date() },
    });

    await prisma.payment.create({
      data: {
        bookingId: Number(bookingId),
        amount: 2500,
        status: 'paid',
      },
    });

    res.status(200).json({ paymentSuccess: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const cancelPage = async (req: Request, res: Response): Promise<void> => {
  const bookingId = req.query.bookingId;

  if (!bookingId) {
    res.json({ error: 'Booking ID is missing in query.' });
    return;
  }

  try {
    res.status(200).json({
      cancelled: true,
      message: `Payment was cancelled for booking ID: ${bookingId}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { successPage, createCheckoutSession, cancelPage };
