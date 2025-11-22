@echo off
REM ============================================================================
REM AUTOMATED BACKUP SCRIPT - TRACEABILITY DATABASE
REM ============================================================================
REM Purpose: Automated daily backup with retention policy
REM Usage: automated_backup.bat
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set DB_SERVER=localhost
set BACKUP_DIR=C:\Backup
set LOG_DIR=%~dp0..\logs
set RETENTION_DAYS=30

REM Create directories if they don't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Generate timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set DATESTAMP=%%c%%a%%b)
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set TIMESTAMP=%%a%%b)
set DATETIME=%DATESTAMP%_%TIMESTAMP%

REM Log file
set LOGFILE=%LOG_DIR%\backup_log_%DATESTAMP%.txt

echo ======================================== >> "%LOGFILE%"
echo AUTOMATED BACKUP STARTED >> "%LOGFILE%"
echo Date/Time: %date% %time% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

REM Perform full backup
echo Performing full backup... >> "%LOGFILE%"
sqlcmd -S %DB_SERVER% -E -i "%~dp0manual_backup.sql" -o "%LOG_DIR%\backup_output_%DATETIME%.log"

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Full backup completed >> "%LOGFILE%"
) else (
    echo ERROR: Backup failed with error code %ERRORLEVEL% >> "%LOGFILE%"
    goto :error
)

REM Clean up old backups (older than RETENTION_DAYS)
echo. >> "%LOGFILE%"
echo Cleaning up old backups... >> "%LOGFILE%"
forfiles /P "%BACKUP_DIR%" /S /M *.bak /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>>"%LOGFILE%"
forfiles /P "%BACKUP_DIR%" /S /M *.trn /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>>"%LOGFILE%"

echo Old backups cleaned (retention: %RETENTION_DAYS% days) >> "%LOGFILE%"

REM Clean up old logs
forfiles /P "%LOG_DIR%" /S /M *.txt /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>nul
forfiles /P "%LOG_DIR%" /S /M *.log /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>nul

echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo BACKUP COMPLETED SUCCESSFULLY >> "%LOGFILE%"
echo End Time: %date% %time% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"

exit /b 0

:error
echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo BACKUP FAILED >> "%LOGFILE%"
echo End Time: %date% %time% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
exit /b 1
