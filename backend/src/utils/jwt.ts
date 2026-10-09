import { SignJWT, jwtVerify } from 'jose';
import type { Response } from 'express';
import { config } from '../config.js';

export type AdminSession = {
  id: string;
  email: string;
  name?: string | null;
  role: 'admin';
};

export type ClientSession = {
  id: string;
  email: string;
  name: string;
  role: 'client';
};

function secret() {
  return new TextEncoder().encode(config.sessionSecret);
}

export async function signSession(payload: AdminSession | ClientSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${config.sessionMaxAge}s`)
    .sign(secret());
}

export async function verifyAdminToken(token: string) {
  const result = await jwtVerify(token, secret());
  const payload = result.payload as unknown as AdminSession;
  if (payload.role !== 'admin' || !payload.id || !payload.email) return null;
  return payload;
}

export async function verifyClientToken(token: string) {
  const result = await jwtVerify(token, secret());
  const payload = result.payload as unknown as ClientSession;
  if (payload.role !== 'client' || !payload.id || !payload.email) return null;
  return payload;
}

export function setAuthCookie(res: Response, name: string, token: string) {
  const secure =
    process.env.COOKIE_SECURE === 'true' ||
    (process.env.COOKIE_SECURE !== 'false' &&
      config.frontendUrl.startsWith('https://') &&
      process.env.NODE_ENV === 'production');

  res.cookie(name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: config.sessionMaxAge * 1000,
  });
}

export function clearAuthCookie(res: Response, name: string) {
  res.clearCookie(name, { httpOnly: true, path: '/' });
}
