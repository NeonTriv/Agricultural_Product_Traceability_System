# Backend - Onboarding

Quick steps to prepare database and run the backend locally.

Prerequisites
- SQL Server accessible at `localhost:1433` (or change `backend/config.env`).
- `sqlcmd` available on PATH (or use SSMS/Azure Data Studio).
- Node 20+, npm installed.

Steps

1) Prepare environment

Edit `backend/config.env` if necessary (DB host/port/username/password).

2) Create database and run schema (one-time)

From repository root run:

```powershell
npm --workspace ./backend run setup-db
```

Script will prompt for SA password if needed; it will create DB `Traceability`, run `BTL_LEADER_SCHEMA.sql`, and create the `test` login/user with `db_owner` rights.

3) Run migrations (future schema changes)

Generate migration from entities:

```powershell
cd backend
npm run migration:generate -- -n MigrationName
```

Apply pending migrations:

```powershell
npm run migration:run
```

4) Start backend

From repo root (start backend only):

```powershell
npm --workspace ./backend run start:dev
```

5) JWT and secrets

 - Set a `JWT_SECRET` environment variable before starting the backend. Example (PowerShell):

```powershell
$env:JWT_SECRET = 'replace_this_with_a_strong_secret'; npm --workspace ./backend run start:dev
```

 - For production, store `JWT_SECRET` in your secret manager or CI environment variables; do NOT commit it to source control.

6) Database least-privilege reminder

 - `setup-db` now creates a database role `app_readwrite` and grants `SELECT, INSERT, UPDATE, DELETE` on `dbo` schema; it then adds the app login to that role and removes `db_owner` membership.
 - To run initial setup from repo root:

```powershell
npm run init
```

Notes
- `app.module.ts` is configured with `synchronize: false` — do not enable this in production.
- Use migrations to manage schema changes after initial setup.
