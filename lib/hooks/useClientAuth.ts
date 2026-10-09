'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ClientUser } from '@/types/site';

type ClientAuthState = {
  loading: boolean;
  user: ClientUser | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export function useClientAuth(): ClientAuthState {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ClientUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      if (payload?.authenticated && payload.role === 'client' && payload.user) {
        setUser(payload.user as ClientUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, [refresh]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return { loading, user, refresh, logout };
}
