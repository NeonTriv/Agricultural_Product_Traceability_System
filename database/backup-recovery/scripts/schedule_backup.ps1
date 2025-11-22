# ============================================================================
# SCHEDULE BACKUP TASK - TRACEABILITY DATABASE
# ============================================================================
# Purpose: Create Windows Task Scheduler job for automated backups
# Usage: Run as Administrator: powershell -ExecutionPolicy Bypass -File schedule_backup.ps1
# ============================================================================

# Require Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "This script requires Administrator privileges!"
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    exit 1
}

# Configuration
$TaskName = "TraceabilityDB_DailyBackup"
$ScriptPath = Join-Path $PSScriptRoot "automated_backup.bat"
$TaskDescription = "Automated daily backup for Traceability Database"

# Schedule: Daily at 2:00 AM
$TriggerTime = "02:00"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CREATING SCHEDULED BACKUP TASK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Task Name: $TaskName" -ForegroundColor Yellow
Write-Host "Script: $ScriptPath" -ForegroundColor Yellow
Write-Host "Schedule: Daily at $TriggerTime" -ForegroundColor Yellow
Write-Host ""

# Check if task already exists
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($ExistingTask) {
    Write-Host "Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "✓ Old task removed" -ForegroundColor Green
}

# Create task action
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""

# Create task trigger (Daily at 2:00 AM)
$Trigger = New-ScheduledTaskTrigger -Daily -At $TriggerTime

# Create task settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

# Create task principal (run with highest privileges)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Description $TaskDescription `
        -ErrorAction Stop | Out-Null

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SCHEDULED TASK CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup will run daily at $TriggerTime" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To view the task, run:" -ForegroundColor Yellow
    Write-Host "  Get-ScheduledTask -TaskName $TaskName" -ForegroundColor White
    Write-Host ""
    Write-Host "To run the task manually now:" -ForegroundColor Yellow
    Write-Host "  Start-ScheduledTask -TaskName $TaskName" -ForegroundColor White
    Write-Host ""
    Write-Host "To disable the task:" -ForegroundColor Yellow
    Write-Host "  Disable-ScheduledTask -TaskName $TaskName" -ForegroundColor White
    Write-Host ""
    Write-Host "To remove the task:" -ForegroundColor Yellow
    Write-Host "  Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
