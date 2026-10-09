import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import {
  type AdminSession,
  type ClientSession,
  verifyAdminToken,
  verifyClientToken,
} from '../utils/jwt.js';

export type AuthedRequest = Request & {
  admin?: AdminSession;
  client?: ClientSession;
};

function readCookie(req: Request, name: string) {
  const value = req.cookies?.[name];
  return typeof value === 'string' ? value : null;
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, config.adminCookie);
    if (!token) {
      res.status(401).json({ message: 'Admin authentication required' });
      return;
    }

    const session = await verifyAdminToken(token);
    if (!session) {
      res.status(401).json({ message: 'Invalid admin session' });
      return;
    }

    req.admin = session;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid admin session' });
  }
}

export async function requireClient(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, config.clientCookie);
    if (!token) {
      res.status(401).json({ message: 'Please log in to continue' });
      return;
    }

    const session = await verifyClientToken(token);
    if (!session) {
      res.status(401).json({ message: 'Invalid client session' });
      return;
    }

    req.client = session;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid client session' });
  }
}

export async function optionalClient(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, config.clientCookie);
    if (token) {
      const session = await verifyClientToken(token);
      if (session) req.client = session;
    }
  } catch {
    // ignore
  }
  next();
}
