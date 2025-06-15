import express, { Request, Response } from 'express';

import { app, logger, server } from './socket';
import authRoutes from './routes/auth.route';
import mvolaRoutes from './routes/mvola.route';
import stripeRoutes from './routes/stripe.route';

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/auth', authRoutes);
app.use('/api/mvola', mvolaRoutes);
app.use('/api/payment', stripeRoutes);

const port = process.env.BACKEND_PORT;

if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
