import { cookies } from 'next/headers';
import { CLIENT_SESSION_COOKIE } from '@/lib/auth/session';
import { getBackendUrl } from '@/lib/config/backend';
import type { ClientUser } from '@/types/site';

const BACKEND_URL = getBackendUrl();

export async function getClientUserFromApi(): Promise<ClientUser | null> {
  const store = await cookies();
  const token = store.get(CLIENT_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/client/me`, {
      headers: { cookie: `${CLIENT_SESSION_COOKIE}=${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as ClientUser;
  } catch {
    return null;
  }
}
