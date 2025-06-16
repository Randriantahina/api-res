import prisma from '@/lib/db';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const getAvailableSeats = async (req: Request, res: Response) => {
  try {
    const seats = await prisma.seat.findMany({
      where: {
        booking: null,
      },
      orderBy: { seatNumber: 'asc' },
    });
    res.status(200).json(seats);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const createBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const {
    name,
    phone,
    seatIds,
  }: { name: string; phone: string; seatIds: number[] } = req.body;

  try {
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
        booking: null,
      },
    });

    if (seats.length !== seatIds.length) {
      res.json({ seatAlreadyReserved: true });
      return;
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { name, phone } });
    }

    const bookings = await Promise.all(
      seatIds.map((seatId) =>
        prisma.booking.create({
          data: {
            userId: user.id,
            seatId,
            status: 'pending',
          },
        }),
      ),
    );

    res.status(201).json({ bookings });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const getUserBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        seat: true,
      },
    });

    res.status(200).json(bookings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const getUserByPhone = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const phone = req.params.phone;

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      res.json({ userNotFound: true });
      return;
    }

    res.status(200).json(user);
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

const updateBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const bookingId = Number(req.params.id);
  const seatId = Number(req.body.seatId);

  try {
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!existingBooking) {
      res.json({ bookingNotFound: true });
      return;
    }

    if (seatId) {
      const seat = await prisma.seat.findUnique({ where: { id: seatId } });
      if (!seat) {
        res.json({ seatAlreadyReserved: true });
        return;
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        seatId,
        updatedAt: new Date(),
      },
    });

    res.status(201).json(updatedBooking);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const deleteBooking = async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);

  if (!bookingId) {
    res.status(400).json({ invalidId: true });
    return;
  }

  try {
    await prisma.booking.delete({ where: { id: bookingId } });

    res.status(200).json({ deteted: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

export {
  getUserBookings,
  createBooking,
  getAvailableSeats,
  updateBooking,
  deleteBooking,
  getUserByPhone,
};
