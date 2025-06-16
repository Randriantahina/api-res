import express, { Request, Response } from 'express';

import { app, logger, server } from './socket';
import mvolaRoutes from './routes/mvola.route';
import stripeRoutes from './routes/stripe.route';
import bookingRoutes from './routes/booking.route';
import prisma from './lib/db';

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/mvola', mvolaRoutes);
app.use('/api/payment', stripeRoutes);
app.use('/api/booking', bookingRoutes);

//creation des sièges
async function initializeSeats() {
  const count = await prisma.seat.count();
  if (count === 0) {
    const seatsData = Array.from({ length: 16 }, (_, i) => ({
      seatNumber: `S${i + 1}`,
    }));
    await prisma.seat.createMany({ data: seatsData });
    console.log('Sièges initialisés');
  }
}
initializeSeats();

const port = process.env.BACKEND_PORT;

if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
