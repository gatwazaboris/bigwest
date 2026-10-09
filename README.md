# Big West Tours / Visit KIBUYE

Next.js frontend + dedicated Node.js backend (`backend/`) with MySQL.

## Quick start

1. Start MySQL:

```bash
docker compose up -d
```

2. Setup backend:

```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

3. Setup frontend (second terminal):

```bash
cp .env.example .env
# Use the SAME SESSION_SECRET as backend/.env
npm install
npm run dev
```

- Website: http://localhost:3000
- API: http://localhost:4000
- Admin / client login: http://localhost:3000/admin/login
- Client account: http://localhost:3000/account

Default admin comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## What works

- Admin panel CRUD for tours, offers, gallery, settings
- Admin bookings + clients management
- Client signup / login
- Client tour booking and booking history
- Public pages load content from the Node + MySQL API
