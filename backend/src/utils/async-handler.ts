import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Express 4 does not catch async errors — wrap handlers so Prisma failures return JSON instead of crashing Passenger (503). */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch((error) => {
      console.error('[api]', req.method, req.path, error);
      if (res.headersSent) {
        next(error);
        return;
      }
      const message =
        error instanceof Error && /prisma|database|p1001|p1017|initialized/i.test(error.message)
          ? 'Database unavailable. Run prisma generate / check DATABASE_URL, then restart the app.'
          : 'Internal server error';
      res.status(500).json({ message });
    });
  };
}
