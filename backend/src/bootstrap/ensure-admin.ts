import { config } from '../config.js';
import { db } from '../db.js';
import { hashPassword } from '../utils/password.js';

/** Ensure the admin account from ADMIN_EMAIL / ADMIN_PASSWORD exists (and password matches env). */
export async function ensureAdminUser() {
  const email = config.adminEmail.toLowerCase().trim();
  const password = config.adminPassword;
  if (!email || !password) {
    console.warn('[ensureAdmin] ADMIN_EMAIL or ADMIN_PASSWORD missing — skipped');
    return;
  }

  const passwordHash = await hashPassword(password);

  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: 'Big West Admin' },
    create: {
      email,
      passwordHash,
      name: 'Big West Admin',
    },
  });

  console.log(`[ensureAdmin] Admin ready: ${email}`);
}
