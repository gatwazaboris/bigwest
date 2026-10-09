import { createApp } from './app.js';
import { ensureAdminUser } from './bootstrap/ensure-admin.js';
import { config } from './config.js';

const app = createApp();

async function start() {
  try {
    await ensureAdminUser();
  } catch (error) {
    console.error('[ensureAdmin] Failed — login may not work until DB/admin is fixed:', error);
  }

  app.listen(config.port, () => {
    console.log(`Big West Tours API running on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
