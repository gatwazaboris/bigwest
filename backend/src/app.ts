import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { config } from './config.js';
import { db } from './db.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { clientRouter } from './routes/client.js';
import { publicRouter } from './routes/public.js';

export function createApp() {
  const app = express();

  const allowedOrigins = new Set(
    [
      config.frontendUrl,
      'https://bigwesttours.com',
      'https://www.bigwesttours.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ].filter(Boolean),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '12mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'big-west-tours-backend' });
  });

  app.get('/health/db', async (_req, res) => {
    try {
      await db.$queryRaw`SELECT 1`;
      res.json({ ok: true, database: 'up' });
    } catch (error) {
      console.error('[health/db]', error);
      res.status(500).json({
        ok: false,
        database: 'down',
        message:
          error instanceof Error
            ? error.message
            : 'Database check failed. Run prisma generate and verify DATABASE_URL.',
      });
    }
  });

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/client', clientRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (
        typeof error === 'object' &&
        error &&
        'status' in error &&
        (error as { status?: number }).status === 400 &&
        'type' in error &&
        (error as { type?: string }).type === 'entity.parse.failed'
      ) {
        res.status(400).json({ message: 'Invalid JSON body' });
        return;
      }

      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    },
  );

  return app;
}
