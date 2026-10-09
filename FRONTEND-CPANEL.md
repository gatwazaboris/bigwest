# Deploy frontend to cPanel (Next.js)

## Package

```text
cpanel-frontend-deploy.zip
```

Rebuild:

```bash
npm run pack:cpanel
```

This build **requires npm install on the server** (so `next` is available).

---

## Your cPanel app (from screenshot)

| Setting | Value |
|---|---|
| Application root | `frontend` → `/home/bigwxubd/frontend` |
| Application URL | `bigwesttours.com` |
| Startup file | **`app.js`** |
| Node | 22.x |

Activate venv:

```bash
source /home/bigwxubd/nodevenv/frontend/22/bin/activate && cd /home/bigwxubd/frontend
```

---

## Fix “EACCES: permission denied” on `.next/static`

After upload (especially via ZIP from Windows), run:

```bash
source /home/bigwxubd/nodevenv/frontend/22/bin/activate && cd /home/bigwxubd/frontend
bash fix-permissions.sh
```

Or manually:

```bash
cd /home/bigwxubd/frontend
chmod -R u+rwX .next
find .next -type d -exec chmod 755 {} \;
find .next -type f -exec chmod 644 {} \;
```

Then **Restart** the Node.js app.

---

## Fix “Cannot find module 'next'”

1. **STOP** the app  
2. Delete `/home/bigwxubd/frontend/node_modules`  
3. Upload/extract the **new** `cpanel-frontend-deploy.zip`  
4. Click **Run NPM Install** (or `npm install --omit=dev` in Terminal)  
5. Run `bash fix-permissions.sh`  
6. Confirm: `ls node_modules/next/package.json`  
7. **START** the app  

---

## Environment variables

| Name | Value |
|---|---|
| `BACKEND_URL` | `https://backend.bigwesttours.com` |
| `SESSION_SECRET` | long secret (match backend) |
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |

On the **backend** app:

```text
FRONTEND_URL=https://bigwesttours.com
```

---

## Notes

- Do **not** upload `node_modules` from your PC  
- After upload, **always** Run NPM Install once  
- Startup file must stay `app.js`
