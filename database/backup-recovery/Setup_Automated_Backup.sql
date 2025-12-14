-- ============================================================================
-- AUTOMATED BACKUP JOBS - SQL SERVER AGENT
-- ============================================================================
-- Purpose: Configure automated backup strategy (Full/Diff/Log)
-- Run ONCE: Jobs will execute forever automatically
-- Idempotent: Drops existing jobs if present, recreates them
-- ============================================================================
-- STRATEGY:
--   Full Backup:   Daily at 00:00
--   Diff Backup:   Every 6 hours (00:00, 06:00, 12:00, 18:00)
--   Log Backup:    Every 15 minutes
-- ============================================================================
-- REQUIREMENTS:
--   - SQL Server Agent must be running
--   - User needs sysadmin or SQLAgentOperatorRole permissions
--   - Backup folder must exist (D:\Backup\)
-- ============================================================================

USE msdb;
GO

SET NOCOUNT ON;

DECLARE @BackupPath NVARCHAR(500) = N'D:\Backup\';

PRINT '============================================================================';
PRINT 'AUTOMATED BACKUP SETUP';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- Ensure backup directory exists
-- ============================================================================
PRINT '>>> Checking backup directory...';

DECLARE @CMD NVARCHAR(1000) = N'IF NOT EXIST "' + @BackupPath + '" MKDIR "' + @BackupPath + '"';

EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;

EXEC xp_cmdshell @CMD, NO_OUTPUT;

PRINT '    ✓ Backup directory ready: ' + @BackupPath;

-- ============================================================================
-- Set database to FULL recovery model (required for log backups)
-- ============================================================================
PRINT '>>> Configuring recovery model...';

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Traceability' AND recovery_model_desc = 'FULL')
BEGIN
    ALTER DATABASE [Traceability] SET RECOVERY FULL;
    PRINT '    ✓ Changed to FULL recovery model';
END
ELSE
    PRINT '    → Already in FULL recovery model';

-- Initial full backup if none exists (required for log backups)
IF NOT EXISTS (SELECT 1 FROM msdb.dbo.backupset WHERE database_name = 'Traceability' AND type = 'D')
BEGIN
    DECLARE @InitialBackup NVARCHAR(500) = @BackupPath + 'Traceability_INITIAL.bak';
    PRINT '>>> Creating initial full backup...';
    BACKUP DATABASE [Traceability] TO DISK = @InitialBackup WITH INIT, COMPRESSION, STATS = 10;
    PRINT '    ✓ Initial backup created';
END

PRINT '';

-- ============================================================================
-- Drop existing jobs (idempotent pattern)
-- ============================================================================
PRINT '>>> Removing old jobs (if exist)...';

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = 'Job_DailyFullBackup')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = N'Job_DailyFullBackup';
    PRINT '    → Dropped Job_DailyFullBackup';
END

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = 'Job_DiffBackup_6Hours')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = N'Job_DiffBackup_6Hours';
    PRINT '    → Dropped Job_DiffBackup_6Hours';
END

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = 'Job_LogBackup_15Min')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = N'Job_LogBackup_15Min';
    PRINT '    → Dropped Job_LogBackup_15Min';
END

PRINT '';

-- ============================================================================
-- JOB 1: FULL BACKUP - DAILY AT 00:00
-- ============================================================================
PRINT '>>> Creating Job_DailyFullBackup...';

DECLARE @JobId1 BINARY(16);

EXEC msdb.dbo.sp_add_job
    @job_name = N'Job_DailyFullBackup',
    @enabled = 1,
    @description = N'Daily full backup at midnight',
    @category_name = N'Database Maintenance',
    @owner_login_name = N'sa',
    @job_id = @JobId1 OUTPUT;

EXEC msdb.dbo.sp_add_jobstep
    @job_id = @JobId1,
    @step_name = N'Run Full Backup',
    @subsystem = N'TSQL',
    @command = N'
DECLARE @Path NVARCHAR(500) = N''C:\Backup\'';
DECLARE @File NVARCHAR(500) = @Path + ''Traceability_FULL_'' + CONVERT(NVARCHAR, GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR, GETDATE(), 108), '':'', '''') + ''.bak'';

BACKUP DATABASE [Traceability] TO DISK = @File
WITH FORMAT, COMPRESSION, STATS = 10, CHECKSUM;

-- Cleanup: Delete full backups older than 30 days
EXEC master.dbo.xp_delete_file 0, @Path, N''bak'', N''2025-11-14T00:00:00'';
',
    @database_name = N'master',
    @on_success_action = 1;

EXEC msdb.dbo.sp_add_jobschedule
    @job_id = @JobId1,
    @name = N'Daily at Midnight',
    @enabled = 1,
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 0;

EXEC msdb.dbo.sp_add_jobserver @job_id = @JobId1, @server_name = N'(local)';

PRINT '    ✓ Created Job_DailyFullBackup (runs at 00:00)';

-- ============================================================================
-- JOB 2: DIFFERENTIAL BACKUP - EVERY 6 HOURS
-- ============================================================================
PRINT '>>> Creating Job_DiffBackup_6Hours...';

DECLARE @JobId2 BINARY(16);

EXEC msdb.dbo.sp_add_job
    @job_name = N'Job_DiffBackup_6Hours',
    @enabled = 1,
    @description = N'Differential backup every 6 hours',
    @category_name = N'Database Maintenance',
    @owner_login_name = N'sa',
    @job_id = @JobId2 OUTPUT;

EXEC msdb.dbo.sp_add_jobstep
    @job_id = @JobId2,
    @step_name = N'Run Differential Backup',
    @subsystem = N'TSQL',
    @command = N'
DECLARE @Path NVARCHAR(500) = N''C:\Backup\'';
DECLARE @File NVARCHAR(500) = @Path + ''Traceability_DIFF_'' + CONVERT(NVARCHAR, GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR, GETDATE(), 108), '':'', '''') + ''.bak'';

BACKUP DATABASE [Traceability] TO DISK = @File
WITH DIFFERENTIAL, FORMAT, COMPRESSION, STATS = 10, CHECKSUM;

-- Cleanup: Delete diff backups older than 7 days
EXEC master.dbo.xp_delete_file 0, @Path, N''bak'', N''2025-12-07T00:00:00'';
',
    @database_name = N'master',
    @on_success_action = 1;

EXEC msdb.dbo.sp_add_jobschedule
    @job_id = @JobId2,
    @name = N'Every 6 Hours',
    @enabled = 1,
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 8,
    @freq_subday_interval = 6,
    @active_start_time = 0;

EXEC msdb.dbo.sp_add_jobserver @job_id = @JobId2, @server_name = N'(local)';

PRINT '    ✓ Created Job_DiffBackup_6Hours (runs every 6 hours)';

-- ============================================================================
-- JOB 3: TRANSACTION LOG - EVERY 15 MINUTES
-- ============================================================================
PRINT '>>> Creating Job_LogBackup_15Min...';

DECLARE @JobId3 BINARY(16);

EXEC msdb.dbo.sp_add_job
    @job_name = N'Job_LogBackup_15Min',
    @enabled = 1,
    @description = N'Transaction log backup every 15 minutes',
    @category_name = N'Database Maintenance',
    @owner_login_name = N'sa',
    @job_id = @JobId3 OUTPUT;

EXEC msdb.dbo.sp_add_jobstep
    @job_id = @JobId3,
    @step_name = N'Run Log Backup',
    @subsystem = N'TSQL',
    @command = N'
DECLARE @Path NVARCHAR(500) = N''C:\Backup\'';
DECLARE @File NVARCHAR(500) = @Path + ''Traceability_LOG_'' + CONVERT(NVARCHAR, GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR, GETDATE(), 108), '':'', '''') + ''.trn'';

BACKUP LOG [Traceability] TO DISK = @File
WITH FORMAT, COMPRESSION, CHECKSUM;

-- Cleanup: Delete log backups older than 3 days
EXEC master.dbo.xp_delete_file 0, @Path, N''trn'', N''2025-12-11T00:00:00'';
',
    @database_name = N'master',
    @on_success_action = 1;

EXEC msdb.dbo.sp_add_jobschedule
    @job_id = @JobId3,
    @name = N'Every 15 Minutes',
    @enabled = 1,
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 4,
    @freq_subday_interval = 15,
    @active_start_time = 0;

EXEC msdb.dbo.sp_add_jobserver @job_id = @JobId3, @server_name = N'(local)';

PRINT '    ✓ Created Job_LogBackup_15Min (runs every 15 minutes)';

PRINT '';

-- ============================================================================
-- Verify Jobs Created
-- ============================================================================
PRINT '============================================================================';
PRINT 'JOBS CREATED SUCCESSFULLY';
PRINT '============================================================================';

SELECT
    name AS [Job Name],
    CASE enabled WHEN 1 THEN 'Enabled' ELSE 'Disabled' END AS [Status],
    date_created AS [Created]
FROM msdb.dbo.sysjobs
WHERE name LIKE 'Job_%Backup%'
ORDER BY name;

PRINT '';
PRINT 'BACKUP STRATEGY:';
PRINT '  → Full Backup:         Daily at 00:00 (retention: 30 days)';
PRINT '  → Differential Backup: Every 6 hours  (retention: 7 days)';
PRINT '  → Transaction Log:     Every 15 min   (retention: 3 days)';
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '  1. Verify SQL Server Agent is running (Windows Services)';
PRINT '  2. Monitor job history: SSMS > SQL Server Agent > Jobs';
PRINT '  3. Test manually: Right-click job > Start Job at Step...';
PRINT '';
PRINT '✓ Setup complete. Jobs will run automatically forever.';
PRINT '============================================================================';

GO
