import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/config/backend';
import type { AdminSession, ClientSession } from '@/types/site';

export const ADMIN_SESSION_COOKIE = 'bigwest_admin_session';
export const CLIENT_SESSION_COOKIE = 'bigwest_client_session';

/**
 * Read session from the backend API (source of truth).
 * Avoids JWT secret mismatches between Next.js and the remote Express API.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/session`, {
      headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      authenticated?: boolean;
      role?: string;
      session?: { id?: string; email?: string; name?: string | null };
    };
    if (!payload.authenticated || payload.role !== 'admin' || !payload.session?.id || !payload.session.email) {
      return null;
    }
    return {
      id: payload.session.id,
      email: payload.session.email,
      name: payload.session.name,
    };
  } catch {
    return null;
  }
}

export async function getClientSession(): Promise<ClientSession | null> {
  const store = await cookies();
  const token = store.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/session`, {
      headers: { cookie: `${CLIENT_SESSION_COOKIE}=${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      authenticated?: boolean;
      role?: string;
      session?: { id?: string; email?: string; name?: string };
    };
    if (
      !payload.authenticated ||
      payload.role !== 'client' ||
      !payload.session?.id ||
      !payload.session.email ||
      !payload.session.name
    ) {
      return null;
    }
    return {
      id: payload.session.id,
      email: payload.session.email,
      name: payload.session.name,
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
