# Backup & Recovery Testing Workflow

## Quick Start Guide

This document provides a streamlined workflow for executing all 3 test cases and capturing screenshots for the LaTeX report.

---

## Prerequisites Checklist

```bash
# 1. Verify SQL Server is running
services.msc  # Check "SQL Server (SQLEXPRESS)" is running

# 2. Verify database exists
sqlcmd -S localhost -E -Q "SELECT name FROM sys.databases WHERE name = 'Traceability'"

# 3. Create backup directory
mkdir C:\Backup

# 4. Verify recovery model
sqlcmd -S localhost -E -Q "ALTER DATABASE Traceability SET RECOVERY FULL"
```

---

## Test Execution Order

### 📌 Test Case 1: Full Backup & Restore (15 minutes)

**Script:** `testcase1_full_backup_restore.sql`

**Screenshots needed:** 4
1. Backup execution output
2. RESTORE VERIFYONLY result
3. DBCC CHECKDB (0 errors)
4. Row count comparison

**Run:**
```bash
cd C:\Users\Admin\Documents\DB-repo\database\backup-recovery\scripts
sqlcmd -S localhost -E -i testcase1_full_backup_restore.sql -o test1_output.txt
```

**Or in SSMS:**
1. Open `testcase1_full_backup_restore.sql`
2. Press F5
3. Follow prompts in Messages tab for screenshots

**Expected duration:** 2-3 minutes

---

### 📌 Test Case 2: Point-in-Time Recovery (20 minutes)

**Script:** `testcase2_point_in_time_recovery.sql`

**Screenshots needed:** 4
1. Data before deletion (batch records exist)
2. Data after deletion (no results)
3. PITR restore with STOPAT
4. Recovered data

**Run:**
```bash
sqlcmd -S localhost -E -i testcase2_point_in_time_recovery.sql -o test2_output.txt
```

**Important:** Wait for prompts before capturing each screenshot

**Expected duration:** 3-5 minutes

⚠️ **Note:** This test DELETES data from BATCH table (ID ≤ 10). The deleted data is restored to `Traceability_Restore` database only. Original `Traceability` database will still have missing data. See cleanup section.

---

### 📌 Test Case 3: Tail-Log Recovery (20 minutes)

**Script:** `testcase3_taillog_recovery.sql`

**Screenshots needed:** 4
1. Insert 5 new QR codes
2. Tail-log backup (database offline)
3. Restore sequence WITH RECOVERY
4. Tail-log data recovered

**Run:**
```bash
sqlcmd -S localhost -E -i testcase3_taillog_recovery.sql -o test3_output.txt
```

**Expected duration:** 3-5 minutes

**Note:** Script auto-brings Traceability back online after test

---

## Screenshot Capture Workflow

### Using SSMS (Recommended)

1. **Open SSMS**
   - Connect to localhost
   - Use "Results to Text" for better Messages output:
     - Query → Query Options → Results → Text
     - Or: Ctrl+T before executing

2. **Execute Script**
   - Open the .sql file
   - Press F5 to run
   - Watch Messages tab for instructions

3. **Capture Screenshots**
   - When script pauses or shows "SCREENSHOT X:" instruction
   - Press **Win + Shift + S** (Windows Snipping Tool)
   - Select area to capture
   - Paste into Paint and save as PNG
   - Name file exactly as shown in script comments

4. **Continue**
   - Script auto-continues after displaying results
   - No need to manually click anything

---

### Using sqlcmd (Command Line)

If running via command line:

```bash
# Execute script and save output
sqlcmd -S localhost -E -i testcase1_full_backup_restore.sql -o test1_output.txt

# Open output file
notepad test1_output.txt

# Capture screenshots from:
# 1. Command prompt window (during execution)
# 2. SSMS query results (for data verification)
```

**Advantages:**
- Full command output saved to file
- Can review output after execution
- Good for troubleshooting

**Disadvantages:**
- Need to manually run verification queries in SSMS
- Results not formatted as nicely as SSMS

---

## Screenshot Organization

### Directory Structure
```
c:\Users\Admin\Documents\DB-repo\
├── screenshots/
│   ├── test1_backup_execution.png
│   ├── test1_verifyonly.png
│   ├── test1_dbcc_checkdb.png
│   ├── test1_count_comparison.png
│   ├── test2_data_before_delete.png
│   ├── test2_data_after_delete.png
│   ├── test2_pitr_restore_process.png
│   ├── test2_recovered_data.png
│   ├── test3_insert_before_crash.png
│   ├── test3_taillog_backup.png
│   ├── test3_recovery_complete.png
│   └── test3_taillog_data_recovered.png
└── SECTION_5.4_BACKUP_RECOVERY.tex
```

### Create directory:
```bash
mkdir c:\Users\Admin\Documents\DB-repo\screenshots
```

---

## Verification Checklist

After each test case, verify:

### Test 1: Full Backup
- [ ] Backup file exists: `C:\Backup\Traceability_FULL_Test1.bak`
- [ ] File size ~500-700 KB
- [ ] RESTORE VERIFYONLY passed
- [ ] DBCC CHECKDB shows 0 errors
- [ ] Row counts match between original and restored

### Test 2: Point-in-Time Recovery
- [ ] Backup files exist:
  - `C:\Backup\Traceability_FULL_Test2.bak`
  - `C:\Backup\Traceability_LOG_Test2_1.trn`
  - `C:\Backup\Traceability_LOG_Test2_2.trn`
  - `C:\Backup\Traceability_TAIL_Test2.trn`
- [ ] BATCH records (ID ≤ 10) deleted from original DB
- [ ] Traceability_Restore has the deleted records (recovered via PITR)
- [ ] STOPAT timestamp is visible in restore output

### Test 3: Tail-Log Recovery
- [ ] 5 new QR_CODE records inserted (Code_Value like 'TEST_QR_%')
- [ ] Database went offline successfully
- [ ] Tail-log backup succeeded (WITH NO_TRUNCATE)
- [ ] All 5 QR codes recovered in Traceability_Restore
- [ ] Original Traceability database back online

---

## Cleanup After All Tests

### Remove test databases:
```sql
USE master;
GO

-- Drop restore database
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Traceability_Restore')
BEGIN
    ALTER DATABASE Traceability_Restore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Traceability_Restore;
END
```

### Remove test data from Test Case 3:
```sql
USE Traceability;
GO

-- Remove test QR codes
DELETE FROM QR_CODE WHERE Code_Value LIKE 'TEST_QR_%';

-- Verify removal
SELECT COUNT(*) AS RemainingTestQRs
FROM QR_CODE
WHERE Code_Value LIKE 'TEST_QR_%';
-- Expected: 0
```

### Restore deleted BATCH records from Test Case 2:

⚠️ **IMPORTANT:** Test Case 2 deleted BATCH records (ID ≤ 10) from the original Traceability database.

**Option A: Restore from backup (recommended)**
```sql
-- Restore original Traceability database from a backup made BEFORE testing
-- (You should have created one before starting tests)

RESTORE DATABASE Traceability
FROM DISK = 'C:\Backup\Traceability_BEFORE_TESTING.bak'
WITH REPLACE, RECOVERY;
```

**Option B: Re-insert deleted records manually**
```sql
-- If you noted the deleted batch IDs, re-insert them
-- (Not recommended - use pre-test backup instead)
```

### Remove test backup files:
```bash
del C:\Backup\*Test*.bak
del C:\Backup\*Test*.trn
```

### Verify cleanup:
```bash
# Check no test backups remain
dir C:\Backup\*Test*

# Should show: File Not Found

# Check database state
sqlcmd -S localhost -E -Q "SELECT name, state_desc FROM sys.databases WHERE name IN ('Traceability', 'Traceability_Restore')"

# Expected: Only Traceability, state = ONLINE
```

---

## LaTeX Compilation

After all screenshots are captured:

### 1. Verify all images exist:
```bash
dir c:\Users\Admin\Documents\DB-repo\screenshots\test*.png
```
Expected: 12 files

### 2. Compile LaTeX document:
```bash
cd c:\Users\Admin\Documents\DB-repo

# Using pdflatex
pdflatex SECTION_5.4_BACKUP_RECOVERY.tex
pdflatex SECTION_5.4_BACKUP_RECOVERY.tex  # Run twice for references

# Output: SECTION_5.4_BACKUP_RECOVERY.pdf
```

### 3. Review PDF:
- Check all 12 images are embedded
- Verify image quality and readability
- Ensure captions match content

---

## Common Issues & Solutions

### Issue 1: "Database does not exist"
```sql
-- Check if Traceability exists
SELECT name FROM sys.databases WHERE name = 'Traceability';

-- If missing, create/restore it first
```

### Issue 2: "Cannot open backup device"
```bash
# Verify backup directory exists
dir C:\Backup

# If not, create it:
mkdir C:\Backup
```

### Issue 3: "Exclusive access could not be obtained"
```sql
-- Kill active connections
ALTER DATABASE Traceability SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

-- Then retry the operation

-- Restore multi-user mode after
ALTER DATABASE Traceability SET MULTI_USER;
```

### Issue 4: "Operating system error 3 (path not found)"
- SQL Server service account doesn't have access to C:\Backup
- Solution: Use a path that SQL Server can access, or grant permissions

### Issue 5: sqlcmd not recognized
```bash
# Add SQL Server to PATH, or use full path:
"C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\sqlcmd.exe" -S localhost -E -i testcase1_full_backup_restore.sql
```

### Issue 6: LaTeX compilation errors
```bash
# Missing \usepackage{graphicx}
# Already included in SECTION_5.4_BACKUP_RECOVERY.tex

# Image not found
# Check path in \includegraphics{} matches actual file location
```

---

## Estimated Time

| Task | Duration |
|------|----------|
| Prerequisites setup | 10 min |
| Test Case 1 execution + screenshots | 15 min |
| Test Case 2 execution + screenshots | 20 min |
| Test Case 3 execution + screenshots | 20 min |
| Cleanup | 5 min |
| LaTeX compilation & review | 10 min |
| **Total** | **80 min** |

---

## Success Criteria

✅ All 3 test cases executed successfully
✅ 12 screenshots captured (4 per test case)
✅ All images saved with correct filenames
✅ LaTeX document compiles without errors
✅ PDF output shows all images clearly
✅ Test databases and files cleaned up
✅ Original Traceability database restored to pre-test state

---

## Next Steps

After successful testing and screenshot capture:

1. ✅ Insert screenshots into LaTeX document (already done via `\includegraphics{}`)
2. ✅ Fill in "Actual Result" sections in SECTION_5.4_BACKUP_RECOVERY.tex
3. ✅ Fill in "Conclusion" sections for each test case
4. 📝 Compile final PDF
5. 📄 Include in main DE.pdf report (Section 5.4)
6. 🎯 Submit report

---

## Contact & Support

If you encounter issues not covered in this guide:

1. Check `SCREENSHOT_GUIDE.md` for detailed screenshot instructions
2. Review SQL script comments for step-by-step guidance
3. Check SQL Server error logs: `C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log\ERRORLOG`

---

**Good luck with your testing! 🚀**
