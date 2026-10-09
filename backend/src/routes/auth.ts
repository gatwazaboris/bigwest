import { randomBytes, randomInt } from 'crypto';
import { Router } from 'express';
import { config } from '../config.js';
import { db } from '../db.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { notifyVerifyEmail, notifyWelcome } from '../email/notifications.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signSession,
  verifyAdminToken,
  verifyClientToken,
} from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { asyncHandler } from '../utils/async-handler.js';
import { serializeClientUser } from '../utils/serializers.js';
import { loginSchema, signupSchema, verifyEmailSchema } from '../utils/validators.js';

export const authRouter = Router();

function createVerifyPayload() {
  const token = randomBytes(24).toString('hex');
  const code = String(randomInt(100000, 999999));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, code, expires, stored: `${code}:${token}` };
}

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid signup payload' });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existingClient = await db.clientUser.findUnique({ where: { email } });
  if (existingClient) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  const existingAdmin = await db.adminUser.findUnique({ where: { email } });
  if (existingAdmin) {
    res.status(409).json({ message: 'This email is reserved for admin use' });
    return;
  }

  const verify = createVerifyPayload();
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.clientUser.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      profileImage: parsed.data.profileImage || '',
      passwordHash,
      emailVerified: false,
      emailVerifyToken: verify.stored,
      emailVerifyExpires: verify.expires,
    },
  });

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'client' as const,
  };
  const token = await signSession(session);
  clearAuthCookie(res, config.adminCookie);
  setAuthCookie(res, config.clientCookie, token);

  void notifyVerifyEmail({
    name: user.name,
    email: user.email,
    code: verify.code,
    token: verify.token,
  });

  res.status(201).json({
    authenticated: true,
    role: 'client',
    needsVerification: true,
    session,
    user: serializeClientUser(user),
    // Shown only when SMTP is off so local signup can still complete.
    ...(config.mail.enabled
      ? {}
      : {
          verificationCode: verify.code,
          verificationHint: 'SMTP is disabled — use this code on the verify page.',
        }),
  });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid login payload' });
    return;
  }

  const email = parsed.data.email.toLowerCase();

  const admin = await db.adminUser.findUnique({ where: { email } });
  if (admin) {
    const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const session = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin' as const,
    };
    const token = await signSession(session);
    clearAuthCookie(res, config.clientCookie);
    setAuthCookie(res, config.adminCookie, token);

    res.json({
      authenticated: true,
      role: 'admin',
      session: { id: admin.id, email: admin.email, name: admin.name },
    });
    return;
  }

  const client = await db.clientUser.findUnique({ where: { email } });
  if (!client) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const valid = await verifyPassword(parsed.data.password, client.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const session = {
    id: client.id,
    email: client.email,
    name: client.name,
    role: 'client' as const,
  };
  const token = await signSession(session);
  clearAuthCookie(res, config.adminCookie);
  setAuthCookie(res, config.clientCookie, token);

  res.json({
    authenticated: true,
    role: 'client',
    needsVerification: !client.emailVerified,
    session,
    user: serializeClientUser(client),
  });
  }),
);

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res, config.adminCookie);
  clearAuthCookie(res, config.clientCookie);
  res.json({ ok: true });
});

authRouter.get('/session', async (req: AuthedRequest, res) => {
  const adminToken = req.cookies?.[config.adminCookie];
  if (typeof adminToken === 'string') {
    try {
      const admin = await verifyAdminToken(adminToken);
      if (admin) {
        res.json({
          authenticated: true,
          role: 'admin',
          session: { id: admin.id, email: admin.email, name: admin.name },
        });
        return;
      }
    } catch {
      // continue
    }
  }

  const clientToken = req.cookies?.[config.clientCookie];
  if (typeof clientToken === 'string') {
    try {
      const client = await verifyClientToken(clientToken);
      if (client) {
        const user = await db.clientUser.findUnique({ where: { id: client.id } });
        if (user) {
          res.json({
            authenticated: true,
            role: 'client',
            needsVerification: !user.emailVerified,
            session: client,
            user: serializeClientUser(user),
          });
          return;
        }
      }
    } catch {
      // continue
    }
  }

  res.json({ authenticated: false, role: null, message: 'Not authenticated' });
});

authRouter.post(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Enter the 6-digit code from your email' });
      return;
    }

    const clientToken = req.cookies?.[config.clientCookie];
    if (typeof clientToken !== 'string') {
      res.status(401).json({ message: 'Sign in to verify your email' });
      return;
    }

    const session = await verifyClientToken(clientToken);
    if (!session) {
      res.status(401).json({ message: 'Sign in to verify your email' });
      return;
    }

    const user = await db.clientUser.findUnique({ where: { id: session.id } });
    if (!user) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    if (user.emailVerified) {
      res.json({ ok: true, verified: true, user: serializeClientUser(user) });
      return;
    }

    const value = parsed.data.token.trim();
    const now = new Date();
    const stored = user.emailVerifyToken || '';
    const expired = !user.emailVerifyExpires || user.emailVerifyExpires <= now;

    if (!stored || expired) {
      res.status(400).json({ message: 'Verification code expired. Request a new email.' });
      return;
    }

    let matches = false;
    if (stored.includes(':')) {
      const [code, token] = stored.split(':');
      matches = value === code || value === token || value === stored;
    } else {
      matches = value === stored;
    }

    if (!matches) {
      res.status(400).json({ message: 'That code does not match the one we emailed you' });
      return;
    }

    const updated = await db.clientUser.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    const nextSession = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: 'client' as const,
    };
    const token = await signSession(nextSession);
    clearAuthCookie(res, config.adminCookie);
    setAuthCookie(res, config.clientCookie, token);

    void notifyWelcome({ name: updated.name, email: updated.email });

    res.json({
      ok: true,
      verified: true,
      user: serializeClientUser(updated),
    });
  }),
);

authRouter.post('/resend-verification', async (req, res) => {
  const clientToken = req.cookies?.[config.clientCookie];
  if (typeof clientToken !== 'string') {
    res.status(401).json({ message: 'Sign in to resend verification' });
    return;
  }

  const session = await verifyClientToken(clientToken);
  if (!session) {
    res.status(401).json({ message: 'Sign in to resend verification' });
    return;
  }

  const user = await db.clientUser.findUnique({ where: { id: session.id } });
  if (!user) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }

  if (user.emailVerified) {
    res.json({ ok: true, alreadyVerified: true });
    return;
  }

  const verify = createVerifyPayload();
  await db.clientUser.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: verify.stored,
      emailVerifyExpires: verify.expires,
    },
  });

  void notifyVerifyEmail({
    name: user.name,
    email: user.email,
    code: verify.code,
    token: verify.token,
  });

  res.json({
    ok: true,
    resent: true,
    ...(config.mail.enabled
      ? {}
      : {
          verificationCode: verify.code,
          verificationHint: 'SMTP is disabled — use this code on the verify page.',
        }),
  });
});
