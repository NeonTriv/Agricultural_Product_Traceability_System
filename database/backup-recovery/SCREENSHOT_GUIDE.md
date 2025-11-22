# Screenshot Guide for Backup & Recovery Test Cases

## Prerequisites

1. **SQL Server Management Studio (SSMS)** installed and connected to localhost
2. **Traceability database** exists with data
3. **Backup directory** created: `C:\Backup\`
4. **Screen capture tool** ready (Windows Snipping Tool, Snagit, or built-in Win+Shift+S)

---

## Test Case 1: Full Backup and Restore Sanity Check

### Setup
```bash
cd C:\Users\Admin\Documents\DB-repo\database\backup-recovery\scripts
```

### Screenshot 1: Full Backup Execution
**File name:** `test1_backup_execution.png`

**Steps:**
1. Open SSMS and connect to localhost
2. Open file: `testcase1_full_backup_restore.sql`
3. Click **Execute** (F5)
4. Wait for completion
5. Capture **Messages tab** showing:
   - "STEP 1: Creating Full Backup..."
   - "Processed 698 pages for database 'Traceability'..."
   - "BACKUP DATABASE successfully processed..."
   - "✓ Full Backup Completed Successfully!"
   - Backup file path
   - Duration

**Key elements to show:**
- Full output from Step 1
- Timestamp showing backup speed
- Success checkmark

---

### Screenshot 2: RESTORE VERIFYONLY Result
**File name:** `test1_verifyonly.png`

**What to capture:**
- Same Messages tab showing:
  - "STEP 2: Verifying Backup Integrity..."
  - "RESTORE VERIFYONLY" command completion
  - "✓ Backup Verification PASSED!"
  - "CHECKSUM: Valid"

**Tip:** Scroll to the VERIFYONLY section before capturing

---

### Screenshot 3: DBCC CHECKDB Result
**File name:** `test1_dbcc_checkdb.png`

**Steps:**
1. Wait for script to complete Step 5
2. Look for output in Messages tab:
   ```
   DBCC results for 'Traceability_Restore'.
   CHECKDB found 0 allocation errors and 0 consistency errors
   in database 'Traceability_Restore'.
   ```
3. Capture the entire DBCC output section

**Critical text to show:**
- "0 allocation errors"
- "0 consistency errors"

---

### Screenshot 4: Row Count Comparison
**File name:** `test1_count_comparison.png`

**Steps:**
1. Open a **NEW Query Window** in SSMS
2. Paste and execute this query:
```sql
SELECT
    'Original (Traceability)' AS Database_Name,
    (SELECT COUNT(*) FROM Traceability.dbo.BATCH) AS BATCH_Count,
    (SELECT COUNT(*) FROM Traceability.dbo.AGRICULTURE_PRODUCT) AS Product_Count
UNION ALL
SELECT
    'Restored (Traceability_Restore)' AS Database_Name,
    (SELECT COUNT(*) FROM Traceability_Restore.dbo.BATCH) AS BATCH_Count,
    (SELECT COUNT(*) FROM Traceability_Restore.dbo.AGRICULTURE_PRODUCT) AS Product_Count;
```
3. Capture **Results tab** showing both rows with identical counts

**Expected result:**
```
Database_Name                        BATCH_Count    Product_Count
Original (Traceability)              10000          6
Restored (Traceability_Restore)      10000          6
```

---

## Test Case 2: Point-in-Time Recovery

### Setup
```bash
cd C:\Users\Admin\Documents\DB-repo\database\backup-recovery\scripts
```

### Screenshot 1: Data Before Deletion
**File name:** `test2_data_before_delete.png`

**Steps:**
1. Open and execute `testcase2_point_in_time_recovery.sql`
2. Wait for "STEP 1: Recording data BEFORE accidental deletion..."
3. When you see the SELECT query output in Results tab, capture it

**Should show:**
- Table with columns: ID, Qr_Code_URL, Harvest_Date, Grade, Created_By
- At least 1 row with ID ≤ 10
- Full row details visible

**Tip:** Copy the ID value shown - you'll verify it's recovered later

---

### Screenshot 2: Data After Deletion (Missing)
**File name:** `test2_data_after_delete.png`

**What to capture:**
1. Wait for "STEP 2: Simulating ACCIDENTAL DELETION..."
2. Messages tab shows: "⚠ ERROR OCCURRED: Accidentally deleted X BATCH records!"
3. **Results tab** now shows: **(No rows affected)** or empty result set
4. Capture both Messages (showing deletion) and Results (showing empty)

**Critical to show:**
- Same query as Screenshot 1
- But now: NO RESULTS RETURNED
- Clear indication data is missing

---

### Screenshot 3: PITR Restore Process with STOPAT
**File name:** `test2_pitr_restore_process.png`

**Steps:**
1. Wait for "STARTING POINT-IN-TIME RECOVERY" section
2. Capture **Messages tab** showing:
   - "Restore Target Time: [timestamp]"
   - "Capturing tail-log backup..."
   - All restore steps (3.1 through 3.4)
   - **CRITICAL:** "STOPAT = [timestamp]" line
   - "Database is now ONLINE"

**Key text to highlight:**
- The STOPAT timestamp
- "Log 2 restored UP TO safe restore point (DELETE is NOT applied)"
- Success messages for each step

---

### Screenshot 4: Recovered Data in Restored Database
**File name:** `test2_recovered_data.png`

**Steps:**
1. Wait for "VERIFYING POINT-IN-TIME RECOVERY"
2. The script switches to `Traceability_Restore` database
3. Capture **Results tab** showing:
   - Same columns as Screenshot 1
   - Same ID value you noted earlier
   - **Data is BACK** (successfully recovered)

**Expected:**
- Exact same row(s) as Screenshot 1
- Proof that PITR worked correctly

---

## Test Case 3: Tail-Log Recovery from Media Failure

### Setup
```bash
cd C:\Users\Admin\Documents\DB-repo\database\backup-recovery\scripts
```

### Screenshot 1: Insert New Data Before Crash
**File name:** `test3_insert_before_crash.png`

**Steps:**
1. Open and execute `testcase3_taillog_recovery.sql`
2. Wait for "STEP 1: Inserting new QR_CODE records..."
3. Capture **Results tab** showing the 5 new QR codes

**Should show:**
- Table with columns: QR_ID, Code_Value, Date_Assign, Product_ID
- 5 rows with Code_Value like 'TEST_QR_0000000001', etc.
- Recent Date_Assign timestamps

**Important:** Note the QR_ID values to verify recovery later

---

### Screenshot 2: Tail-Log Backup with NO_TRUNCATE
**File name:** `test3_taillog_backup.png`

**Steps:**
1. Wait for "SIMULATING DATABASE CRASH"
2. Database goes OFFLINE
3. Then "CAPTURING TAIL-LOG BACKUP" section appears
4. Capture **Messages tab** showing:
   - "Taking database OFFLINE (simulating media failure)..."
   - "Database is now OFFLINE (crashed)"
   - BACKUP LOG command with NO_TRUNCATE
   - "TAIL-LOG BACKUP SUCCESSFUL!"
   - File path: `C:\Backup\Traceability_TAIL_Test3.trn`

**Critical to show:**
- Database offline message
- Successful tail-log capture FROM offline database
- "This backup contains the 5 INSERT transactions"

---

### Screenshot 3: Restore Sequence WITH RECOVERY
**File name:** `test3_recovery_complete.png`

**Steps:**
1. Wait for "RESTORING DATABASE (INCLUDING TAIL-LOG)" section
2. Capture **Messages tab** showing complete restore sequence:
   - Step 4.1: Full backup restored (NORECOVERY)
   - Step 4.2: Initial log restored
   - Step 4.3: **TAIL-LOG restored** ← Most important
   - Step 4.4: Database brought online WITH RECOVERY
   - "Database is now ONLINE and ready for use"

**Key lines:**
- "Restoring TAIL-LOG backup (contains 5 new QR codes)..."
- "TAIL-LOG restored - 5 INSERT transactions should now be applied"
- Final "WITH RECOVERY" message

---

### Screenshot 4: Tail-Log Data Successfully Recovered
**File name:** `test3_taillog_data_recovered.png`

**Steps:**
1. Wait for "VERIFYING TAIL-LOG RECOVERY"
2. Script switches to `Traceability_Restore` database
3. Capture **Results tab** showing:
   - 5 rows with TEST_QR_* codes
   - All columns including new "Recovery_Status" showing "RECOVERED FROM TAIL-LOG!"
   - Same QR_ID values as Screenshot 1

**Also capture Messages showing:**
```
Recovered QR codes from tail-log: 5
Expected: 5
✓✓✓ TAIL-LOG RECOVERY SUCCESSFUL! ✓✓✓
```

**Expected:**
- All 5 QR codes present
- Proves tail-log captured transactions AFTER last scheduled backup
- Demonstrates RPO = 0 minutes (zero data loss)

---

## Screenshot Tips

### Quality Requirements
- **Resolution:** Minimum 1920x1080, capture at 100% DPI
- **Format:** PNG (better quality than JPG for text)
- **Cropping:** Include relevant SSMS window areas (query text, results, messages)
- **Readability:** Text must be clearly readable when inserted in LaTeX at 0.85\textwidth

### SSMS Settings for Best Screenshots
1. **Font Size:**
   - Tools → Options → Fonts and Colors
   - Set "Text Editor" font size to 11 or 12

2. **Results Grid:**
   - Tools → Options → Query Results → SQL Server → Results to Grid
   - Check "Include column headers when copying or saving the results"

3. **Messages:**
   - Keep Messages tab visible during execution
   - Scroll to ensure relevant output is visible before capturing

### Recommended Capture Tool
**Windows Built-in (Win + Shift + S):**
- Press Win+Shift+S
- Select rectangular snip
- Auto-copies to clipboard
- Paste into Paint/Paint3D
- Save as PNG

**Alternative: Snagit / ShareX** (better for annotations)

---

## File Naming Convention

Save screenshots with these exact names:

### Test Case 1:
- `test1_backup_execution.png`
- `test1_verifyonly.png`
- `test1_dbcc_checkdb.png`
- `test1_count_comparison.png`

### Test Case 2:
- `test2_data_before_delete.png`
- `test2_data_after_delete.png`
- `test2_pitr_restore_process.png`
- `test2_recovered_data.png`

### Test Case 3:
- `test3_insert_before_crash.png`
- `test3_taillog_backup.png`
- `test3_recovery_complete.png`
- `test3_taillog_data_recovered.png`

---

## LaTeX Integration

After capturing, place all PNG files in:
```
c:\Users\Admin\Documents\DB-repo\screenshots\
```

The LaTeX file already has `\includegraphics` commands pointing to these filenames.

---

## Troubleshooting

### "Database does not exist" error
**Solution:** Ensure Traceability database exists before running test scripts

### Backup directory error
```bash
mkdir C:\Backup
```

### Permission denied on restore
**Solution:** Run SSMS as Administrator

### Database already exists
**Solution:** Scripts auto-drop `Traceability_Restore`, but if it fails:
```sql
USE master;
ALTER DATABASE Traceability_Restore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE Traceability_Restore;
```

---

## Post-Test Cleanup

After all screenshots are captured, clean up test databases:

```sql
-- Remove test restore database
USE master;
GO
DROP DATABASE IF EXISTS Traceability_Restore;

-- Remove test QR codes from Test Case 3
USE Traceability;
DELETE FROM QR_CODE WHERE Code_Value LIKE 'TEST_QR_%';

-- Verify cleanup
SELECT COUNT(*) FROM QR_CODE WHERE Code_Value LIKE 'TEST_QR_%';
-- Expected: 0
```

Remove test backup files:
```bash
del C:\Backup\*Test*.bak
del C:\Backup\*Test*.trn
```

---

## Final Checklist

Before compiling LaTeX report:

- [ ] All 12 screenshots captured (4 per test case)
- [ ] All files named correctly (test1_*.png, test2_*.png, test3_*.png)
- [ ] All images saved in `screenshots/` folder
- [ ] Images are high resolution PNG format
- [ ] Text in screenshots is readable
- [ ] Each screenshot clearly shows the expected result
- [ ] Test databases cleaned up
- [ ] Test backup files removed

---

## Questions?

If any test fails or produces unexpected results, check:

1. **Recovery Model:** `SELECT recovery_model_desc FROM sys.databases WHERE name = 'Traceability'`
   - Must be 'FULL'

2. **Backup Directory Exists:** `dir C:\Backup`

3. **SQL Server Version:** Scripts assume SQL Server 2022/Express
   - Adjust file paths if using different version

4. **Permissions:** SQL Server service account must have write access to C:\Backup

Good luck with your testing! 🎯
