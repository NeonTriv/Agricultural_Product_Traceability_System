# Centralized Product Traceability Platform

A full-stack platform to track agricultural products from farm to consumer, including backend (NestJS), frontend (React + Vite), and Microsoft SQL Server database scripts.

## What’s inside
- **Backend:** NestJS, TypeScript, TypeORM
- **Frontend:** React, TypeScript, Vite
- **Database:** Microsoft SQL Server (schema + seed scripts)
- **Tooling:** npm workspaces, PowerShell helper scripts

## Repository layout
```
.
├── backend/         # NestJS API source
├── database/        # SQL schema, seed, and utility scripts
├── frontend/        # React web app
└── README.md
```

## Prerequisites
- Node.js 20.x or newer (includes npm)
- SQL Server (Express/Developer/Standard) with Mixed Mode enabled
- Git

## Quick start
1) **Install dependencies**
```bash
npm install
```

2) **Initialize database and baseline** (creates DB `Traceability`, schema, seed, user `test`/`test`)
```bash
npm run init
```
- If prompted for `sa` password, provide it (or leave blank when using Windows Authentication).

3) **Run everything** (backend + frontend concurrently)
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:5001 (Vite may pick a nearby port if 5001 is busy)

## Useful scripts
- `npm run dev:fe` — start only the frontend
- `npm run dev:be` — start only the backend
- `npm --workspace ./backend run migration:generate -- -n MyNewMigration` — generate a new migration after entity changes

## Default credentials
- **Web admin:** `admin` / `admin123`
- **Database user (see config.env):** `test` / `test`

## Notes    
- The `init` step creates the DB, applies schema, seeds data, sets up indexes, security, **and deploys stored procedures** so the system is production-ready.
- If ports are taken, Vite will auto-select another; check the terminal output for the actual URL.
