# Backend setup

1) Environment
- Copy `.env.example` to `.env` and fill values for `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
- Seed users (admin required, others optional): set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` plus any `SEED_*` pairs for staff, coach, athlete you want to create.
- Bulk team seed also creates 3 teams (Lions U18, Falcons U16, First Team) with 2 coaches and 11 athletes each. Their password defaults to `SEED_BULK_PASSWORD` (falls back to `ChangeMe123!` if not set).

2) Database and seed
- Install deps: `cd backend && npm install`.
- Run migrations: `npx prisma migrate dev`.
- Seed users: `npx prisma db seed` (or `npm run db:seed`).

3) Lint
- From `backend`: `npm run lint`.

Notes
- Seeded accounts are created as ACTIVE.
- If optional seed pairs are missing, they are skipped with a warning; admin credentials are required.
