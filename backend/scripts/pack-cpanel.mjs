import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'cpanel-deploy');

function run(cmd, cwd = root) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

run('npx prisma generate');
run('npm run build');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const deployPkg = {
  name: pkg.name,
  version: pkg.version,
  private: true,
  type: 'module',
  scripts: {
    start: 'node app.js',
    setup: 'npm run db:generate && npm run db:push',
    'db:generate': 'prisma generate',
    'db:push': 'prisma db push',
  },
  dependencies: {
    '@prisma/client': '6.19.3',
    bcryptjs: pkg.dependencies.bcryptjs,
    'cookie-parser': pkg.dependencies['cookie-parser'],
    cors: pkg.dependencies.cors,
    dotenv: pkg.dependencies.dotenv,
    express: pkg.dependencies.express,
    jose: pkg.dependencies.jose,
    nodemailer: pkg.dependencies.nodemailer,
    prisma: '6.19.3',
    zod: pkg.dependencies.zod,
  },
  engines: { node: '>=20' },
  overrides: {
    prisma: '6.19.3',
    '@prisma/client': '6.19.3',
  },
};

writeFileSync(join(outDir, 'package.json'), `${JSON.stringify(deployPkg, null, 2)}\n`);

cpSync(join(root, 'dist'), join(outDir, 'dist'), { recursive: true });
cpSync(join(root, 'prisma'), join(outDir, 'prisma'), { recursive: true });
cpSync(join(root, 'app.js'), join(outDir, 'app.js'));
cpSync(join(root, 'CPANEL.md'), join(outDir, 'CPANEL.md'));

const envSrc = existsSync(join(root, '.env.cpanel'))
  ? join(root, '.env.cpanel')
  : join(root, '.env.cpanel.example');
cpSync(envSrc, join(outDir, '.env'));
cpSync(envSrc, join(outDir, '.env.cpanel.example'));

writeFileSync(
  join(outDir, '.npmrc'),
  `engine-strict=false
legacy-peer-deps=false
`,
);

const installSh = `#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Removing old node_modules"
rm -rf node_modules

echo "==> Installing dependencies (Prisma pinned to 6.19.3 — do NOT use Prisma 7)"
npm install --omit=dev

echo "==> Generating Prisma client with LOCAL binary (not npx latest)"
./node_modules/.bin/prisma -v
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push

echo ""
echo "OK. Restart the Node.js app in cPanel."
echo "Then open: https://backend.bigwesttours.com/health/db"
echo "Expected: {\"ok\":true,\"database\":\"up\"}"
echo "If health/db fails, DATABASE_URL is wrong or MySQL is down."
echo "Login after restart: admin@bigwesttours.com / ChangeMe123!"
`;

writeFileSync(join(outDir, 'install.sh'), installSh);
try {
  chmodSync(join(outDir, 'install.sh'), 0o755);
} catch {
  // Windows may ignore chmod
}

writeFileSync(
  join(outDir, 'INSTALL.txt'),
  `FIX FOR cPanel (cors / Prisma 7 / DATABASE_URL missing)
=======================================================

Your app root is:
  /home/bigwxubd/b.bigwesttours.com
URL:
  https://backend.bigwesttours.com

IMPORTANT CAUSES OF YOUR ERRORS
-------------------------------
1) "Prisma schema validation ... url is no longer supported"
   → You ran Prisma 7 via "npx prisma". This project MUST use Prisma 6.19.3.
   → Always run:  ./node_modules/.bin/prisma generate
   → NEVER run:   npx prisma generate   (npx can download Prisma 7)

2) "Cannot find package 'cors'"
   → Dependencies were not installed. Run install.sh below.

3) "DATABASE_URL is missing"
   → .env was missing OR env vars not set in cPanel.
   → This package includes a .env file. Also add the same vars in
     cPanel → Setup Node.js App → Environment Variables.

SETUP STEPS
-----------
1) cPanel → Setup Node.js App → STOP APP

2) Upload/extract this zip into:
   /home/bigwxubd/b.bigwesttours.com
   (overwrite files; keep Application startup file = app.js)

3) In Terminal, paste EXACTLY:

source /home/bigwxubd/nodevenv/b.bigwesttours.com/22/bin/activate && cd /home/bigwxubd/b.bigwesttours.com
bash install.sh

4) In cPanel Node.js App, confirm Environment Variables include at least:
   DATABASE_URL
   SESSION_SECRET
   FRONTEND_URL=https://bigwesttours.com
   (SMTP_* if you want email)

5) START / RESTART the app

6) Test:
   https://backend.bigwesttours.com/health
   https://backend.bigwesttours.com/api/public/bootstrap

Do NOT add cors/express/prisma one-by-one in the NPM Modules UI.
`,
);

run('npm install --package-lock-only --omit=dev', outDir);

console.log(`\nReady: ${outDir}`);

const zipPath = join(root, 'cpanel-deploy.zip');
rmSync(zipPath, { force: true });
if (process.platform === 'win32') {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' },
  );
} else {
  execSync(`zip -r cpanel-deploy.zip cpanel-deploy`, { cwd: root, stdio: 'inherit' });
}
console.log(`Zip: ${zipPath}`);
