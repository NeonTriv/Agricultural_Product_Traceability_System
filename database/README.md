# Database Setup Guide

## Overview
This directory contains all SQL scripts for the agricultural traceability database system.

## Quick Start 

### Automated Setup (Recommended)
```bash
npm run init
```
This will automatically:
1. Create database & schema
2. Insert master reference data
3. Create performance indexes
4. Setup security views & roles
5. Configure database users

**That's it!** Your system is ready to use.

---

## Manual Setup (If needed)

### Step 1: Create Schema
```bash
sqlcmd -S localhost -d master -i BTL_LEADER_SCHEMA.sql
```

### Step 2: Insert Master Data (Required)
```bash
sqlcmd -S localhost -d Traceability -i INSERT_MASTER_DATA.sql
```

### Step 3: Create Performance Indexes
```bash
sqlcmd -S localhost -d Traceability -i create_indexes_LEADER_SCHEMA.sql
```

### Step 4: Setup Security
```bash
sqlcmd -S localhost -d Traceability -i security/setup\ view\ and\ role.sql
```

## File Structure

### Core Schema
| File | Purpose |
|------|---------|
| `BTL_LEADER_SCHEMA.sql` | Main database schema - creates all tables and relationships |

### Indexes & Performance
| File | Purpose |
|------|---------|
| `create_indexes_LEADER_SCHEMA.sql` | Performance indexes for QR lookup, farms, vendors (idempotent) |
| `tests/performance_tests_LEADER_SCHEMA.sql` | Performance benchmarking queries |

### Data Files
| File | Purpose |
|------|---------|
| `INSERT_MASTER_DATA.sql` | **Required** - Countries, provinces, categories, farms, vendors |
| `CLEAR_ALL_DATA.sql` | Clear all data while preserving schema |

### Security & Monitoring
| File | Purpose |
|------|---------|
| `security/setup view and role.sql` | Security views & role-based access control |
| `backup-recovery/Setup_Automated_Backup.sql` | Automated backup jobs (optional) |
| `SYSTEM_HEALTH_CHECK_LITE.sql` | Database health verification |


### Utility Scripts
| Directory | Files | Purpose |
|-----------|-------|---------|
| `backup-recovery/` | 7 scripts | Database backup and restore procedures |
| `big-data/` | 3 scripts | Generate 1M+ records for stress testing |
| `tests/` | 2 scripts | Test data and performance tests |

## Setup Order (Important!)

1. **Schema First**: `BTL_LEADER_SCHEMA.sql`
   - Creates database structure
   - Drops existing tables if present
   - Creates all 26 tables with relationships

2. **Indexes Second**: `indexes/create_indexes_LEADER_SCHEMA.sql`
   - Performance optimization
   - Creates 15+ indexes on foreign keys and search fields

3. **Master Data Third**: `INSERT_MASTER_DATA.sql`
   - **REQUIRED** - System cannot function without this
   - Adds Vietnam provinces, districts, categories
   - Reference data for dropdowns

4. **Test/Demo Data (Optional)**:
   - `INSERT_TEST_DATA_SIMPLE.sql` - For development
   - `DEMO_PRESENTATION.sql` - For demos/presentations

## Database Schema Overview

### Core Entities (26 Tables)

**Product Hierarchy:**
- `COUNTRY` → `PROVINCE` → `CATEGORY` → `TYPE` → `AGRICULTURE_PRODUCT`

**Supply Chain:**
- `FARM` → `BATCH` → `PROCESSING` → `WAREHOUSE` → `SHIPMENT`

**Vendor & Pricing:**
- `VENDOR` → `VENDOR_PRODUCT` → `PRICE` + `DISCOUNT`

**Logistics:**
- `DISTRIBUTOR`, `RETAIL`, `CARRIERCOMPANY` → `TRANSPORLEG`

**Relationships:**
- `STORED_IN` (Batch ↔ Warehouse)
- `SHIP_BATCH` (Shipment ↔ Batch)
- `PRODUCT_HAS_DISCOUNT` (VendorProduct ↔ Discount)
- `PROCESS_STEP` (Processing steps)
- `FARM_CERTIFICATIONS` (Farm certifications)

## 🤖 Automation Features

### Idempotent Indexing (Safe to Re-run)
```bash
# Safe to run multiple times - won't cause errors
sqlcmd -S localhost -d Traceability -i indexes/create_indexes_LEADER_SCHEMA.sql
```
- Uses `IF NOT EXISTS` pattern
- Perfect for CI/CD pipelines
- Updates statistics automatically

### Automated Backups (Set & Forget)
```bash
# One-time setup - creates SQL Server Agent jobs
sqlcmd -S localhost -E -i backup-recovery/Setup_Automated_Backup.sql
```
**What happens:**
- ✅ Full Backup: Daily at 00:00 (retention: 30 days)
- ✅ Differential: Every 6 hours (retention: 7 days)
- ✅ Transaction Log: Every 15 minutes (retention: 3 days)
- ✅ Auto-cleanup of old backups

## Common Tasks

### Reset Database (Development)
```sql
-- Clear all data but keep schema
USE Traceability;
EXEC sp_executesql N'$(cat CLEAR_ALL_DATA.sql)';

-- Re-insert master data
EXEC sp_executesql N'$(cat INSERT_MASTER_DATA.sql)';
```

### Manual Backup (One-Time)
```bash
# Full backup
sqlcmd -S localhost -d Traceability -i backup-recovery/scripts/manual_backup.sql

# Transaction log backup
sqlcmd -S localhost -d Traceability -i backup-recovery/scripts/transaction_log_backup.sql

# Differential backup
sqlcmd -S localhost -d Traceability -i backup-recovery/scripts/differential_backup.sql
```

### Restore Database
```bash
# Restore procedure with transaction logs
sqlcmd -S localhost -d master -i backup-recovery/scripts/testcase1_full_backup_restore.sql
```

### Generate Big Data (Testing)
```bash
# Generate 1M records for performance testing
sqlcmd -S localhost -d Traceability -i big-data/generate_1m_test_data.sql

# Create big data indexes
sqlcmd -S localhost -d Traceability -i big-data/create_big_data_indexes.sql

# Quick demo with 10K records
sqlcmd -S localhost -d Traceability -i big-data/QUICK_DEMO.sql
```

## Environment Variables

Set these before running scripts:

```bash
# Windows
set DB_SERVER=localhost
set DB_NAME=Traceability
set DB_USER=sa
set DB_PASSWORD=YourPassword

# Linux/Mac
export DB_SERVER=localhost
export DB_NAME=Traceability
export DB_USER=sa
export DB_PASSWORD=YourPassword
```

## Troubleshooting

### Error: "Cannot drop database because it is in use"
```sql
USE master;
GO
ALTER DATABASE Traceability SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE Traceability;
```

### Error: "Foreign key constraint violation"
Run `CLEAR_ALL_DATA.sql` instead of manually deleting - it handles FK order correctly.

### Performance Issues
1. Check indexes: `indexes/create_indexes_LEADER_SCHEMA.sql`
2. Run performance tests: `tests/performance_tests_LEADER_SCHEMA.sql`
3. Consider big data indexes: `big-data/create_big_data_indexes.sql`

## Development Notes

### Schema Changes
When modifying schema:
1. Update `BTL_LEADER_SCHEMA.sql`
2. Update corresponding indexes in `indexes/`
3. Update test data if needed
4. Test with `INSERT_TEST_DATA_SIMPLE.sql`

### Data Integrity
- All foreign keys are properly constrained
- Unique constraints on natural keys (TIN, QR codes)
- Cascade deletes disabled - manual cleanup required for data safety

## Production Deployment

### Pre-deployment Checklist
- [ ] Backup existing database
- [ ] Run schema in transaction mode
- [ ] Verify indexes created
- [ ] Insert master data
- [ ] Run smoke tests
- [ ] Verify NestJS backend connects successfully

### Recommended Setup
1. Run `BTL_LEADER_SCHEMA.sql` in transaction mode
2. Add indexes with `create_indexes_LEADER_SCHEMA.sql`
3. Insert only `INSERT_MASTER_DATA.sql` (no test data)
4. Verify backend API endpoints work
5. Monitor performance with query plans

## File History

### Deprecated/Removed Files
- `FIX_SCHEMA_COLUMNS.sql` - Merged into main schema
- `QUICK_FIX_SCHEMA.sql` - Merged into main schema
- `DELETE_TEST_DATA.sql` - Use `CLEAR_ALL_DATA.sql` instead

### Active Maintenance
- `BTL_LEADER_SCHEMA.sql` - Updated as needed
- `INSERT_MASTER_DATA.sql` - Vietnam provinces/categories
- Performance scripts - Updated for optimization

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review schema comments in SQL files
3. Check NestJS backend logs for connection issues
4. Verify environment variables are set correctly
