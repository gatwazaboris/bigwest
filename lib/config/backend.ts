/** Backend API base URL (no trailing slash). Used by the Next.js `/api` proxy and server fetches. */
export function getBackendUrl() {
  const raw = process.env.BACKEND_URL || 'https://backend.bigwesttours.com';
  return raw.replace(/\/$/, '');
}
