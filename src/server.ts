import express, { Request, Response } from 'express';

import { app, logger, server } from './socket';
import authRoutes from './routes/auth.routes';

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/auth', authRoutes);

const port = process.env.BACKEND_PORT;

if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
