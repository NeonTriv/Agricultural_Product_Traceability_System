# Agricultural Traceability System

Full-stack web application for agricultural product traceability using QR codes.

**Tech Stack:** SQL Server + NestJS + React + TypeScript

---

## Quick Start

### 1. Database Setup (One-time)

```bash
# Create SQL Server login
sqlcmd -S localhost -E -Q "CREATE LOGIN dbuser WITH PASSWORD = 'dbpass123', CHECK_POLICY = OFF;"

# Create database user
sqlcmd -S localhost -E -d Traceability_DB -Q "CREATE USER dbuser FOR LOGIN dbuser; EXEC sp_addrolemember 'db_owner', 'dbuser';"

# Create schema (if database doesn't exist)
cd database
sqlcmd -S localhost -E -i BTL_LEADER_SCHEMA.sql

# Insert test data (optional)
sqlcmd -S localhost -E -d Traceability_DB -i INSERT_TEST_DATA_SIMPLE.sql

# Create indexes
sqlcmd -S localhost -E -d Traceability_DB -i indexes\create_indexes_LEADER_SCHEMA.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (first time only)
npm install

# Configure environment
# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=1433
# DB_USERNAME=dbuser
# DB_PASSWORD=dbpass123
# DB_NAME=Traceability_DB

# Start development server
npm run start:dev
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5001**

---

## Usage

1. Open **http://localhost:5001** in your browser
2. Select network: **LOCAL**
3. Enter QR code (e.g., `QR_DRAGON_001`)
4. Click **Fetch** to view product traceability

### Sample QR Codes

- `QR_DRAGON_001` - Dragon Fruit from Tien Giang
- `QR_DRAGON_002` - Dragon Fruit (batch 2)
- `QR_DURIAN_001` - Durian

---

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/trace/:code` - Get product traceability by QR code
- `GET /api/trace` - Get all products

---

## Project Structure

```
DB-repo/
├── database/           # SQL Server schema and scripts
├── backend/            # NestJS API (TypeScript)
├── frontend/           # React + Vite (TypeScript)
└── README.md           # This file
```

---

## Environment Variables

**Backend (.env):**
```
PORT=5000
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=dbuser
DB_PASSWORD=dbpass123
DB_NAME=Traceability_DB
```

**Frontend (.env.local):**
```
VITE_QR_TARGETS="LAN|http://192.168.1.50:5000;PUBLIC|https://yourdomain.com;LOCAL|http://localhost:5000"
VITE_SITE_URL=http://localhost:5173
VITE_MOCK=0
```

---

## Stop Services

Press **Ctrl+C** in the terminal windows running backend and frontend.

---

## Technologies

- **Database:** SQL Server (MSSQL)
- **Backend:** NestJS 10 + TypeORM + TypeScript
- **Frontend:** React 18 + Vite 5 + TypeScript
- **QR Code:** qrcode.react

---

**Last Updated:** November 2025
