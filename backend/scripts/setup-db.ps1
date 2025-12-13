param(
    [string]$SqlServer = "localhost,1433",
    [string]$SaUser = "sa",
    [string]$SaPassword = "",
    [string]$AppDb = "Traceability",
    [string]$AppLogin = "test",
    [string]$AppPassword = "test",
    [string]$SchemaFile = "$PSScriptRoot\..\..\database\BTL_LEADER_SCHEMA.sql"
)

# --- 0. PRE-FLIGHT CHECK ---
$ErrorActionPreference = "Stop"

if (-not (Get-Command "sqlcmd" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'sqlcmd' command not found." -ForegroundColor Red
    Write-Host "Please install SQL Server Command Line Utilities."
    exit 1
}

# Override params from Environment Variables
if ($env:INIT_SQLSERVER) { $SqlServer = $env:INIT_SQLSERVER }
if ($env:INIT_APPDB)     { $AppDb = $env:INIT_APPDB }
if ($env:INIT_SAUSER)    { $SaUser = $env:INIT_SAUSER }
if ($env:INIT_SAPASSWORD){ $SaPassword = $env:INIT_SAPASSWORD }

# Function to run SQL safely
function Run-Sql {
    param(
        [string]$Query,
        [string]$Database
    )

    $params = @("-S", $SqlServer)
    
    # Auth Logic
    if (-not [string]::IsNullOrWhiteSpace($SaPassword)) {
        $params += ("-U", $SaUser, "-P", $SaPassword)
    } else {
        $params += "-E" # Windows Auth
    }

    if (-not [string]::IsNullOrWhiteSpace($Database)) {
        $params += ("-d", $Database)
    }

    if (-not [string]::IsNullOrWhiteSpace($Query)) {
        $params += ("-Q", $Query)
    }

    Write-Host "Executing SQL..." -ForegroundColor DarkGray
    
    # Run sqlcmd directly
    try {
        $result = & sqlcmd @params 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "$result"
        }
        return $result
    } catch {
        Write-Error "SQL Execution Failed."
        Write-Error $_
        exit 1
    }
}

function Run-SqlFile {
    param(
        [string]$FilePath
    )
    
    $params = @("-S", $SqlServer, "-b")  # -b causes sqlcmd to terminate on error
    if (-not [string]::IsNullOrWhiteSpace($SaPassword)) {
        $params += ("-U", $SaUser, "-P", $SaPassword)
    } else {
        $params += "-E"
    }
    $params += ("-i", $FilePath)

    Write-Host "Executing SQL file: $FilePath" -ForegroundColor Cyan
    $output = & sqlcmd @params 2>&1 | Out-String
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host $output -ForegroundColor Red
        throw "SQL File execution failed with exit code $LASTEXITCODE"
    }
    
    Write-Host $output -ForegroundColor Gray
}

Write-Host "`n=========================================="
Write-Host "   DATABASE SETUP STARTED"
Write-Host "==========================================`n"

# --- 1. RESET DATABASE ---
Write-Host "[1/7] Resetting Database '$AppDb'..."
$dropQuery = "
    IF DB_ID('$AppDb') IS NOT NULL 
    BEGIN 
        ALTER DATABASE [$AppDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; 
        DROP DATABASE [$AppDb]; 
    END; 
    CREATE DATABASE [$AppDb];
"
Run-Sql -Query $dropQuery

Write-Host "[2/7] Importing Schema..."
if (-not (Test-Path $SchemaFile)) {
    Write-Error "Schema file not found at: $SchemaFile"
    exit 1
}

$tempSqlFile = "$PSScriptRoot\temp_schema.sql"
$schemaContent = Get-Content $SchemaFile -Raw -Encoding UTF8
$finalSchema = "USE [$AppDb];`r`n" + $schemaContent
Set-Content -Path $tempSqlFile -Value $finalSchema -Encoding UTF8

Run-SqlFile -FilePath $tempSqlFile
Remove-Item $tempSqlFile -Force

Write-Host "[3/7] Importing Master Data..."
$masterDataFile = "$PSScriptRoot\..\..\database\INSERT_MASTER_DATA.sql"
if (Test-Path $masterDataFile) {
    # Temp file for data
    $tempDataFile = "$PSScriptRoot\temp_data.sql"
    $dataContent = Get-Content $masterDataFile -Raw -Encoding UTF8
    $finalData = "USE [$AppDb];`r`n" + $dataContent
    Set-Content -Path $tempDataFile -Value $finalData -Encoding UTF8
    
    Run-SqlFile -FilePath $tempDataFile
    Remove-Item $tempDataFile -Force
} else {
    Write-Warning "Master data file not found. Skipping."
}

# --- 4. CREATE PERFORMANCE INDEXES ---
Write-Host "[4/7] Creating Performance Indexes..."
$indexFile = "$PSScriptRoot\..\..\database\indexes\create_indexes_LEADER_SCHEMA.sql"
if (Test-Path $indexFile) {
    $tempIndexFile = "$PSScriptRoot\temp_indexes.sql"
    $indexContent = Get-Content $indexFile -Raw -Encoding UTF8
    $finalIndex = "USE [$AppDb];`r`n" + $indexContent
    Set-Content -Path $tempIndexFile -Value $finalIndex -Encoding UTF8
    
    Run-SqlFile -FilePath $tempIndexFile
    Remove-Item $tempIndexFile -Force
    Write-Host "  -> 12 performance indexes created successfully" -ForegroundColor Green
} else {
    Write-Warning "Index file not found at: $indexFile. Skipping."
}

# --- 5. SETUP BACKUP CONFIGURATION ---
Write-Host "[5/7] Setting up Backup Configuration..."

# Set database to FULL recovery mode
$backupSetupQuery = @"
    USE [master];
    ALTER DATABASE [$AppDb] SET RECOVERY FULL;
    
    -- Create backup directory if not exists
    EXEC xp_create_subdir 'C:\Backup\Traceability';
    
    -- First full backup (required for log backups)
    BACKUP DATABASE [$AppDb] 
    TO DISK = 'C:\Backup\Traceability\Initial_Full.bak'
    WITH INIT, NAME = 'Initial Full Backup', COMPRESSION;
    
    PRINT 'Backup configuration completed';
"@
try {
    Run-Sql -Query $backupSetupQuery
    Write-Host "  -> Recovery mode: FULL" -ForegroundColor Green
    Write-Host "  -> Initial backup: C:\Backup\Traceability\Initial_Full.bak" -ForegroundColor Green
    Write-Host "  -> For scheduled backups, run as Admin:" -ForegroundColor Yellow
    Write-Host "     .\database\backup-recovery\scripts\schedule_backup.ps1" -ForegroundColor White
} catch {
    Write-Warning "Backup setup failed (non-critical): $_"
    Write-Host "  -> You can run backup setup manually later" -ForegroundColor Yellow
}

Write-Host "[6/7] Creating App User '$AppLogin'..."
$userQuery = "
    USE [master];
    IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = '$AppLogin')
    BEGIN
        ALTER LOGIN [$AppLogin] WITH PASSWORD = '$AppPassword', CHECK_POLICY = OFF;
        ALTER LOGIN [$AppLogin] ENABLE;
    END
    ELSE
    BEGIN
        CREATE LOGIN [$AppLogin] WITH PASSWORD = '$AppPassword', CHECK_POLICY = OFF;
    END;

    USE [$AppDb];
    IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = '$AppLogin')
    BEGIN
        CREATE USER [$AppLogin] FOR LOGIN [$AppLogin];
    END;
    ALTER ROLE [db_owner] ADD MEMBER [$AppLogin];
"
Run-Sql -Query $userQuery

Write-Host "[7/7] Verifying Login..."
# Test login with new user credentials
$verifyParams = @("-S", $SqlServer, "-U", $AppLogin, "-P", $AppPassword, "-d", $AppDb, "-Q", "SELECT 'OK'")
$verifyResult = & sqlcmd @verifyParams 2>&1

if ($verifyResult -match "OK") {
    Write-Host "`n[SUCCESS] Database '$AppDb' is ready!" -ForegroundColor Green
    Write-Host "Connection String: Server=$SqlServer;Database=$AppDb;User Id=$AppLogin;Password=$AppPassword;"
} else {
    Write-Error "Verification failed. The user '$AppLogin' could not login."
    Write-Host "Tip: Ensure SQL Server is in 'Mixed Mode Authentication'." -ForegroundColor Yellow
    exit 1
}