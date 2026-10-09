import 'dotenv/config';

function required(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  sessionSecret: required('SESSION_SECRET', 'dev-session-secret-change-me'),
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bigwesttours.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  adminCookie: 'bigwest_admin_session',
  clientCookie: 'bigwest_client_session',
  sessionMaxAge: 60 * 60 * 24 * 7,
  mail: {
    enabled: String(process.env.SMTP_ENABLED || '').toLowerCase() === 'true' || Boolean(process.env.SMTP_HOST),
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.ADMIN_EMAIL || 'Visit KIBUYE <noreply@visitkibuye.com>',
    notifyTo: process.env.MAIL_NOTIFY_TO || process.env.ADMIN_EMAIL || '',
  },
};
