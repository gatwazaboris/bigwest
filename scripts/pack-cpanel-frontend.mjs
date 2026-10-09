import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'cpanel-frontend-deploy');

function run(cmd, cwd = root, env = process.env) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const buildEnv = {
  ...process.env,
  NODE_ENV: 'production',
  BACKEND_URL: process.env.BACKEND_URL || 'https://backend.bigwesttours.com',
  SESSION_SECRET:
    process.env.SESSION_SECRET || 'replace-with-a-long-random-secret-at-least-32-chars',
};

run('npx next build', root, buildEnv);

// Classic cPanel deploy: .next + public + package.json (npm install on server)
cpSync(join(root, '.next'), join(outDir, '.next'), { recursive: true });
// Drop heavy/dev-only build caches from the upload
rmSync(join(outDir, '.next', 'cache'), { recursive: true, force: true });
rmSync(join(outDir, '.next', 'standalone'), { recursive: true, force: true });

if (existsSync(join(root, 'public'))) {
  cpSync(join(root, 'public'), join(outDir, 'public'), { recursive: true });
}

cpSync(join(root, 'scripts', 'cpanel-frontend-app.js'), join(outDir, 'app.js'));
cpSync(join(root, 'scripts', 'fix-permissions.sh'), join(outDir, 'fix-permissions.sh'));
writeFileSync(
  join(outDir, 'next.config.mjs'),
  `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Runtime config for cPanel (build already completed on your PC)
};
export default nextConfig;
`,
);

const envSrc = existsSync(join(root, '.env.cpanel.frontend'))
  ? join(root, '.env.cpanel.frontend')
  : null;
if (envSrc) {
  cpSync(envSrc, join(outDir, '.env'));
  cpSync(envSrc, join(outDir, '.env.cpanel.example'));
}

const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const deployPkg = {
  name: 'visit-kibuye-frontend',
  version: rootPkg.version || '0.1.0',
  private: true,
  scripts: {
    start: 'node app.js',
  },
  dependencies: {
    next: rootPkg.dependencies.next,
    react: rootPkg.dependencies.react,
    'react-dom': rootPkg.dependencies['react-dom'],
  },
  engines: { node: '>=20' },
};

writeFileSync(join(outDir, 'package.json'), `${JSON.stringify(deployPkg, null, 2)}\n`);
writeFileSync(
  join(outDir, '.npmrc'),
  `omit=dev
engine-strict=false
`,
);

run('npm install --package-lock-only --omit=dev', outDir);

writeFileSync(
  join(outDir, 'INSTALL.txt'),
  `FIX: Cannot find module 'next' on cPanel
========================================

Application root (from your screenshot):
  /home/bigwxubd/frontend
Startup file:
  app.js

IMPORTANT
---------
This package NEEDS "Run NPM Install" (or npm install) so "next" is installed.
Do NOT use an old standalone zip without dependencies.

STEPS
-----
1) cPanel → Setup Node.js App → STOP APP

2) File Manager → /home/bigwxubd/frontend
   DELETE the old "node_modules" folder (if present)

3) Upload/extract cpanel-frontend-deploy.zip into /home/bigwxubd/frontend
   (overwrite files)

4) On the Node.js App page click: **Run NPM Install**
   OR in Terminal:

source /home/bigwxubd/nodevenv/frontend/22/bin/activate && cd /home/bigwxubd/frontend
npm install --omit=dev

5) Confirm next exists:
ls node_modules/next/package.json

6) Fix permissions (fixes EACCES: permission denied on .next/static):

bash fix-permissions.sh

# or manually:
chmod -R u+rwX .next
find .next -type d -exec chmod 755 {} \;
find .next -type f -exec chmod 644 {} \;

7) Environment variables:
   BACKEND_URL=https://backend.bigwesttours.com
   SESSION_SECRET=replace-with-a-long-random-secret-at-least-32-chars
   NODE_ENV=production
   HOSTNAME=0.0.0.0

8) START / RESTART the app

9) Open https://bigwesttours.com

On the backend Node app set:
   FRONTEND_URL=https://bigwesttours.com
`,
);

writeFileSync(join(outDir, 'CPANEL.md'), readFileSync(join(root, 'FRONTEND-CPANEL.md'), 'utf8'));

const zipPath = join(root, 'cpanel-frontend-deploy.zip');
rmSync(zipPath, { force: true });
if (process.platform === 'win32') {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' },
  );
} else {
  execSync(`zip -r cpanel-frontend-deploy.zip cpanel-frontend-deploy`, {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log(`\nReady: ${outDir}`);
console.log(`Zip: ${zipPath}`);
console.log('Upload zip → Run NPM Install → Restart');
