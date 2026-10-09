# Deploy backend to cPanel (Node.js)

Your live app (from cPanel):

| Setting | Value |
|---|---|
| Application root | `b.bigwesttours.com` |
| Full path | `/home/bigwxubd/b.bigwesttours.com` |
| Application URL | `https://backend.bigwesttours.com` |
| Startup file | `app.js` |
| Node | 22.x |
| Activate venv | `source /home/bigwxubd/nodevenv/b.bigwesttours.com/22/bin/activate && cd /home/bigwxubd/b.bigwesttours.com` |

## Critical: use Prisma 6 only

This project uses **Prisma 6.19.3**.  
`npx prisma` on the server may download **Prisma 7** and fail with:

> The datasource property `url` is no longer supported

Always use the local binary after `npm install`:

```bash
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push
```

Or run the included script:

```bash
bash install.sh
```

## What to upload

Use the generated folder:

```text
backend/cpanel-deploy/
```

Or the zip:

```text
backend/cpanel-deploy.zip
```

Contents:

- `app.js` — cPanel startup file
- `dist/` — compiled API
- `prisma/` — database schema
- `package.json` / `package-lock.json` (Prisma **6.19.3** pinned)
- `.env` — includes `DATABASE_URL` (also set the same vars in cPanel UI)
- `install.sh` — one-shot install + prisma generate/push

Do **not** upload `node_modules` from your PC. Install on the server.

---

## Fast fix (your current errors)

```bash
source /home/bigwxubd/nodevenv/b.bigwesttours.com/22/bin/activate && cd /home/bigwxubd/b.bigwesttours.com
# upload new zip files first, then:
bash install.sh
```

Then **Restart** the Node.js app and open:

- https://backend.bigwesttours.com/health
- https://backend.bigwesttours.com/api/public/bootstrap

---

## 1. Create MySQL database (cPanel)

1. Open **MySQL® Databases**
2. Create database, e.g. `bigwxubd_bigwest`
3. Create user, e.g. `bigwxubd_bigwest_user`
4. Assign user to database with **ALL PRIVILEGES**
5. Note the full names (cPanel adds a prefix)

`DATABASE_URL` format:

```text
mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
```

Example:

```text
mysql://bigwxubd_bigwest_user:YourPassword@localhost:3306/bigwxubd_bigwest
```

---

## 2. Create Node.js app (cPanel)

1. Open **Setup Node.js App**
2. Click **Create Application**
3. Set:

| Field | Value |
|---|---|
| Node.js version | **20.x** (or newest available ≥ 18) |
| Application mode | **Production** |
| Application root | e.g. `backend` or `api` (folder under your home) |
| Application URL | e.g. `api.yourdomain.com` or `yourdomain.com/api` |
| Application startup file | **`app.js`** |

4. Click **Create**
5. Open the app → **Environment variables** and add:

| Name | Example |
|---|---|
| `PORT` | leave blank if cPanel sets it, or use the port shown |
| `DATABASE_URL` | `mysql://USER:PASS@localhost:3306/DB` |
| `SESSION_SECRET` | long random string |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | strong password |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `SMTP_ENABLED` | `false` (or `true` when ready) |

`FRONTEND_URL` must be your live website URL (no trailing slash). Cookies/CORS depend on it.

---

## 3. Upload files

Upload everything from `cpanel-deploy/` into the **Application root** you chose.

Via File Manager or FTP/SFTP.

Optional: create `.env` in that same folder with the same values as the environment variables (some hosts prefer UI env vars only).

---

## 4. Install & database setup

**Important:** Stop the app first. Delete any old `node_modules` in the app root.

### Option A — cPanel button (recommended)

1. Setup Node.js App → **Stop**
2. Delete `node_modules` in the application root (File Manager)
3. Click **Run NPM Install**
4. Open Terminal, activate the virtual env (command shown on the Node.js app page), then:

```bash
cd ~/backend.bigwesttours.com
npx prisma generate
npx prisma db push
```

5. **Start** the app

### Option B — Terminal only

```bash
# use the "Enter to the virtual environment" command from the Node.js app page first
cd ~/backend.bigwesttours.com
rm -rf node_modules
npm install --omit=dev
npx prisma generate
npx prisma db push
```

Then in cPanel Node.js App → **Restart**.

Do **not** install `cors` / `express` / `prisma` one-by-one in the NPM Modules UI — that often breaks the app. Always install from `package.json` with **Run NPM Install**.

---

## Common issues

### `Cannot find package 'cors'`
npm install did not finish (or old `node_modules` is broken).

1. Stop the app  
2. Delete `node_modules`  
3. Run NPM Install again  
4. `npx prisma generate`  
5. Start the app  

### Prisma error under `/home/.../nodevenv/.../prisma`
Usually from adding Prisma via the NPM Modules UI, or a failed `postinstall`.  
Use this package (no postinstall), delete `node_modules`, then **Run NPM Install** + `npx prisma generate`.

### App won’t start
- Startup file must be `app.js`
- Run NPM Install inside the Node app virtual env
- Check **Stderr Log** in Setup Node.js App

### Database connection error
- Use `localhost` (not `127.0.0.1` on some hosts)
- User/db names must include cPanel prefix
- Password special characters may need URL-encoding in `DATABASE_URL`

### 502 from frontend
- Backend app stopped → Restart in cPanel
- Wrong `BACKEND_URL`

### CORS / login cookies fail
- `FRONTEND_URL` must match the real site origin (`https://...`)
- Site must be HTTPS if cookies are Secure (adjust if needed)

---

## Rebuild package on your PC

From the project:

```bash
cd backend
npm run pack:cpanel
```

That refreshes `cpanel-deploy/` and `cpanel-deploy.zip`.
