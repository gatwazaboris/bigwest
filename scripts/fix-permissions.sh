#!/bin/bash
# Fix EACCES on cPanel Next.js (.next/static permission denied)
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Fixing ownership/permissions in $(pwd)"

# Ensure the account user owns everything (adjust if your user differs)
OWNER="${USER:-bigwxubd}"
if command -v chown >/dev/null 2>&1; then
  chown -R "$OWNER":"$OWNER" . 2>/dev/null || true
fi

# Directories need execute bit so Node can scandir(); files need read
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Startup scripts executable
chmod 755 app.js 2>/dev/null || true
chmod 755 fix-permissions.sh 2>/dev/null || true

# .next must be writable for image cache / ISR if used
chmod -R u+rwX .next 2>/dev/null || true
chmod -R a+rX .next/static 2>/dev/null || true

echo "OK. Restart the Node.js app in cPanel."
echo "Test: https://bigwesttours.com"
