/**
 * cPanel startup file — Application startup file: app.js
 * Requires: npm install (next must exist in node_modules)
 */
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const root = __dirname;
process.chdir(root);
loadEnvFile(path.join(root, '.env'));

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const port = String(process.env.PORT || '3000');
const hostname = process.env.HOSTNAME || '0.0.0.0';

let nextBin;
try {
  nextBin = require.resolve('next/dist/bin/next', { paths: [root] });
} catch {
  console.error(
    '[frontend] Cannot find "next". In cPanel click "Run NPM Install", or run:\n' +
      '  cd ~/frontend && npm install --omit=dev\n' +
      'Then Restart the Node.js app.',
  );
  process.exit(1);
}

process.argv = [process.argv[0], nextBin, 'start', '-H', hostname, '-p', port];
require(nextBin);
