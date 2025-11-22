# Agricultural Traceability System

Full-stack web application for agricultural product traceability using QR codes.

**Tech Stack:** SQL Server + NestJS + React + TypeScript

---

## Quick Start

### 1. Database Setup (One-time)

The database **Traceability** should already exist with 26 tables and 10,000 sample batches.

```bash
# Create SQL Server login (if not exists)
sqlcmd -S localhost -E -Q "CREATE LOGIN dbuser WITH PASSWORD = 'dbpass123', CHECK_POLICY = OFF;"

# Grant permissions to Traceability database
sqlcmd -S localhost -E -d Traceability -Q "CREATE USER dbuser FOR LOGIN dbuser; EXEC sp_addrolemember 'db_owner', 'dbuser';"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (first time only)
npm install

# Start development server
npm run start:dev
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

#### For Desktop Testing:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: **http://localhost:5001**

#### For Mobile Testing (same WiFi network):
```bash
cd frontend
npm run dev -- --host
```
Frontend runs on: **http://192.168.1.30:5001** (accessible from mobile devices)

---

## Usage

### Desktop Usage:
1. Open **http://localhost:5001** in your browser
2. Select a batch (Batch 1, Batch 2, etc.)
3. View generated QR code
4. Scan QR code with mobile phone

### Mobile Usage:
1. Connect phone to same WiFi network as computer
2. On computer, run frontend with `npm run dev -- --host`
3. Note the IP address shown (e.g., 192.168.1.30:5001)
4. Open the website on computer: **http://192.168.1.30:5001**
5. Select a batch and scan the generated QR code with your phone
6. View product traceability information on mobile

### Sample QR Codes (from Database)

- `QR_BATCH_00001` - Grade B batch
- `QR_BATCH_00002` - Grade C batch
- `QR_BATCH_00003` - Grade A batch
- `QR_BATCH_00004` - Grade B batch
- ... up to `QR_BATCH_10000`

---

## Adding New Products

To add new products to the home page, edit `frontend/src/components/TracePage.tsx`:

```typescript
const products = [
  { label: 'Batch 1 (Grade B)', code: 'QR_BATCH_00001', emoji: '🌾' },
  { label: 'Batch 2 (Grade C)', code: 'QR_BATCH_00002', emoji: '🌾' },
  // Add more products here
  { label: 'Your Product Name', code: 'QR_CODE_FROM_DATABASE', emoji: '🍎' },
]
```

Make sure the QR code exists in the `BATCH` table's `Qr_Code_URL` column.

---

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/trace/:code` - Get product traceability by QR code
- `GET /api/trace` - Get all products

### Example:
```bash
curl http://localhost:5000/api/trace/QR_BATCH_00001
```

---

## Database Backup & Recovery

See [database/backup-recovery/README.md](database/backup-recovery/README.md) for:
- Manual backup procedures
- Automated daily backups (2 AM)
- Point-in-time recovery
- 30-day retention policy

**Quick backup:**
```bash
cd database/backup-recovery/scripts
sqlcmd -S localhost -E -i manual_backup.sql
```

---

## Project Structure

```
DB-repo/
├── database/
│   ├── backup-recovery/        # Backup & recovery scripts
│   └── ...                     # SQL schema files
├── backend/                    # NestJS API (TypeScript)
│   ├── src/
│   │   ├── trace/              # Traceability endpoints
│   │   └── ...
│   └── .env                    # Database config
├── frontend/                   # React + Vite (TypeScript)
│   ├── src/
│   │   ├── components/         # React components
│   │   └── api/                # API client
│   └── .env.local              # Frontend config
└── README.md
```

---

## Environment Configuration

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=dbuser
DB_PASSWORD=dbpass123
DB_NAME=Traceability
```

**Frontend (.env.local):**
```env
# Update the IP address (192.168.1.30) to match your computer's IP
VITE_QR_TARGETS="LAN|http://192.168.1.30:5000;PUBLIC|https://vinguyen28082005.com;LOCAL|http://localhost:5000"
VITE_SITE_URL=http://192.168.1.30:5001
VITE_MOCK=0
```

**To find your IP address:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

---

## Troubleshooting

### Mobile can't connect:
1. Ensure phone and computer are on **same WiFi network**
2. Check firewall settings - allow ports 5000 and 5001
3. Run frontend with `--host` flag: `npm run dev -- --host`
4. Update IP address in `.env.local` to match your computer's IP
5. Restart backend to listen on `0.0.0.0` (already configured in `main.ts`)

### QR code not found:
1. Check if QR code exists in database:
```bash
sqlcmd -S localhost -U dbuser -P dbpass123 -d Traceability -Q "SELECT TOP 10 Qr_Code_URL FROM BATCH"
```
2. Update product codes in `TracePage.tsx` to match database

### Backend connection failed:
1. Verify SQL Server is running
2. Check database credentials in `backend/.env`
3. Ensure `dbuser` has permissions on `Traceability` database

---

## Technologies

- **Database:** SQL Server (MSSQL) - 26 tables, 10,000+ batches
- **Backend:** NestJS 10 + TypeORM + TypeScript
- **Frontend:** React 18 + Vite 5 + TypeScript
- **QR Code:** qrcode.react
- **Backup:** SQL Server BACKUP/RESTORE + Windows Task Scheduler

---

## Database Schema

The system uses the **Traceability** database with 26 tables including:
- **AGRICULTURE_PRODUCT** - Product information
- **BATCH** - Batch details with QR codes
- **FARM** - Farm information
- **PROVINCE**, **COUNTRY** - Location data
- **PROCESSING**, **PROCESSING_FACILITY** - Processing details
- And 19 more tables for complete traceability

---

**Last Updated:** November 2025
