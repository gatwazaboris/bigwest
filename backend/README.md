# Big West Tours Backend

Express + Prisma + MySQL API for Visit KIBUYE.

## Setup

1. Start MySQL:

```bash
docker compose up -d
```

2. Install and configure:

```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

API: `http://localhost:4000`

## Deploy to cPanel

```bash
npm run pack:cpanel
```

Upload `cpanel-deploy.zip` (or the `cpanel-deploy/` folder) and follow **[CPANEL.md](./CPANEL.md)**.

## Main routes

- `GET /api/public/bootstrap`
- `POST /api/auth/signup` / `POST /api/auth/login` / `GET /api/auth/session`
- ` /api/admin/*` tours, offers, gallery, settings, bookings, clients
- ` /api/client/*` profile and bookings
