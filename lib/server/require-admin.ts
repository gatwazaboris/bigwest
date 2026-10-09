import { getAdminSession } from '@/lib/auth/session';
import { fail } from '@/lib/http/responses';

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: fail('Unauthorized', 401) } as const;
  }
  return { session, response: null } as const;
}
