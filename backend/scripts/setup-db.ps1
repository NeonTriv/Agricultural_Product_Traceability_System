param(
    [string]$SqlServer = "localhost,1433",
    [string]$SaUser = "sa",
    [string]$SaPassword = "",
    [string]$AppDb = "Traceability",
    [string]$AppLogin = "test",
    [string]$AppPassword = "test",
    [string]$SchemaFile = "$PSScriptRoot\..\..\database\BTL_LEADER_SCHEMA.sql"
)

# --- PRE-FLIGHT CHECK ---
$ErrorActionPreference = "Stop"

if (-not (Get-Command "sqlcmd" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'sqlcmd' command not found." -ForegroundColor Red
    Write-Host "Please install SQL Server Command Line Utilities."
    exit 1
}

if ($env:INIT_SQLSERVER) { $SqlServer = $env:INIT_SQLSERVER }
if ($env:INIT_APPDB) { $AppDb = $env:INIT_APPDB }
if ($env:INIT_SAUSER) { $SaUser = $env:INIT_SAUSER }
if ($env:INIT_SAPASSWORD){ $SaPassword = $env:INIT_SAPASSWORD }

# SQL
function Run-Sql {
    param(
        [string]$Query,
        [string]$Database
    )

    $params = @("-S", $SqlServer)
    
    if (-not [string]::IsNullOrWhiteSpace($SaPassword)) {
        $params += ("-U", $SaUser, "-P", $SaPassword)
    } else {
        $params += "-E" 
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
    
    $params = @("-S", $SqlServer, "-b")  
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


Write-Host "[1/10] Resetting Database '$AppDb'..."
$dropQuery = "
    IF DB_ID('$AppDb') IS NOT NULL 
    BEGIN 
        ALTER DATABASE [$AppDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; 
        DROP DATABASE [$AppDb]; 
    END; 
    CREATE DATABASE [$AppDb];
"
Run-Sql -Query $dropQuery

Write-Host "[2/10] Importing Schema..."
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

Write-Host "[3/10] Importing Master Data..."
$masterDataFile = "$PSScriptRoot\..\..\database\INSERT_MASTER_DATA.sql"
if (Test-Path $masterDataFile) {
    $tempDataFile = "$PSScriptRoot\temp_data.sql"
    $dataContent = Get-Content $masterDataFile -Raw -Encoding UTF8
    $finalData = "USE [$AppDb];`r`n" + $dataContent
    Set-Content -Path $tempDataFile -Value $finalData -Encoding UTF8
    
    Run-SqlFile -FilePath $tempDataFile
    Remove-Item $tempDataFile -Force
} else {
    Write-Warning "Master data file not found. Skipping."
}

Write-Host "[3.5/10] Creating application Users table if missing..."
$usersFile = "$PSScriptRoot\..\..\database\create_users_table.sql"
if (Test-Path $usersFile) {
    try {
        # Ensure the users SQL runs in the target app database
        $tempUsersFile = "$PSScriptRoot\temp_users.sql"
        $usersContent = Get-Content $usersFile -Raw -Encoding UTF8
        $finalUsers = "USE [$AppDb];`r`n" + $usersContent
        Set-Content -Path $tempUsersFile -Value $finalUsers -Encoding UTF8
        Run-SqlFile -FilePath $tempUsersFile
        Remove-Item $tempUsersFile -Force
        Write-Host "Users table ensured." -ForegroundColor Green
    } catch {
        Write-Warning "Creating Users table failed, but continuing..."
    }
} else {
    Write-Warning "Users table script not found at: $usersFile. Skipping."
}

Write-Host "[3.55/10] Seeding default admin user SQL if present..."
$seedFile = "$PSScriptRoot\..\..\database\seed_admin_user.sql"
if (Test-Path $seedFile) {
    try {
        # Run seed in target DB context
        $tempSeedFile = "$PSScriptRoot\temp_seed.sql"
        $seedContent = Get-Content $seedFile -Raw -Encoding UTF8
        $finalSeed = "USE [$AppDb];`r`n" + $seedContent
        Set-Content -Path $tempSeedFile -Value $finalSeed -Encoding UTF8
        Run-SqlFile -FilePath $tempSeedFile
        Remove-Item $tempSeedFile -Force
        Write-Host "Admin seed applied (if missing)." -ForegroundColor Green
    } catch {
        Write-Warning "Admin seed failed, but continuing..."
    }
} else {
    Write-Warning "Admin seed script not found at: $seedFile. Skipping."
}

Write-Host "[3.6/10] Ensuring default admin user exists in Users..."
$adminName = 'admin'
$adminPass = 'admin123'
try {
    $check = Run-Sql -Query "USE [$AppDb]; IF EXISTS (SELECT 1 FROM dbo.Users WHERE Username = '$adminName') SELECT 'EXISTS' ELSE SELECT 'MISSING';" -Database $AppDb
    if ($check -match 'EXISTS') {
        Write-Host "Admin user already exists. Skipping insertion." -ForegroundColor Gray
    } else {
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Host "Generating bcrypt hash for admin password using Node..." -ForegroundColor Cyan
            $rawHash = & node -e 'const b=require("bcryptjs");b.hash(process.argv[1],10).then(h=>console.log(h)).catch(e=>{console.error(e);process.exit(1)})' $adminPass 2>&1
            $hash = $rawHash -join "`n"
            $hash = $hash.Trim()
            if (-not $hash) { throw "Failed to generate bcrypt hash." }
            $hashEscaped = $hash -replace "'", "''"
            $insertQ = "USE [$AppDb]; INSERT INTO dbo.Users (Username, PasswordHash, Role, CreatedAt) VALUES ('$adminName','$hashEscaped','admin', GETDATE());"
            Run-Sql -Query $insertQ -Database $AppDb
            Write-Host "Inserted admin user 'admin'." -ForegroundColor Green
        } else {
            Write-Warning "Node.js not found; cannot auto-generate bcrypt hash. To create admin manually, run the following in Node to get the hash:"
            Write-Host "node -e ""const b=require('bcryptjs');b.hash('admin123',10).then(h=>console.log(h))""" -ForegroundColor Yellow
            Write-Host "Then insert into dbo.Users using that hash." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Warning "Auto-insert admin had issues, but continuing..."
    Write-Warning $_
}

Write-Host "[4/10] Creating App User '$AppLogin'..."
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
        CREATE USER [$AppLogin] FOR LOGIN [$AppLogin] WITH DEFAULT_SCHEMA = dbo;
    END
    ELSE
    BEGIN
        ALTER USER [$AppLogin] WITH DEFAULT_SCHEMA = dbo;
    END;

    -- Apply least-privilege: create app role and grant minimal rights
    IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'app_readwrite' AND type = 'R')
    BEGIN
        CREATE ROLE [app_readwrite];
    END

    -- Grant minimal CRUD privileges on dbo schema to role
    GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [app_readwrite];

    -- Add app login to that role (instead of db_owner)
    IF NOT EXISTS (SELECT 1 FROM sys.database_role_members drm JOIN sys.database_principals rp ON drm.role_principal_id = rp.principal_id WHERE rp.name = 'app_readwrite' AND drm.member_principal_id IN (SELECT principal_id FROM sys.database_principals WHERE name = '$AppLogin'))
    BEGIN
        ALTER ROLE [app_readwrite] ADD MEMBER [$AppLogin];
    END

    -- Remove from db_owner if present
    IF EXISTS (SELECT 1 FROM sys.database_role_members drm JOIN sys.database_principals rp ON drm.role_principal_id = rp.principal_id WHERE rp.name = 'db_owner' AND drm.member_principal_id IN (SELECT principal_id FROM sys.database_principals WHERE name = '$AppLogin'))
    BEGIN
        ALTER ROLE [db_owner] DROP MEMBER [$AppLogin];
    END
"
Run-Sql -Query $userQuery

Write-Host "[5/10] Verifying Login..."
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

Write-Host "`n[6/10] Creating Indexes & Security..."
$setupFile = "$PSScriptRoot\..\..\database\create_indexes_LEADER_SCHEMA.sql"
if (Test-Path $setupFile) {
    try {
        Write-Host "Creating performance indexes..." -ForegroundColor Cyan
        Run-SqlFile -FilePath $setupFile
        Write-Host "Indexes created successfully!" -ForegroundColor Green
    } catch {
        Write-Warning "Index creation had issues, but continuing..."
    }
} else {
    Write-Warning "Index script not found. Skipping."
}

Write-Host "`n[7/10] Setting Up Security Views & Roles..."
$securityFile = "$PSScriptRoot\..\..\database\security\setup view and role.sql"
if (Test-Path $securityFile) {
    try {
        Write-Host "Creating security views and roles..." -ForegroundColor Cyan
        Run-SqlFile -FilePath $securityFile
        Write-Host "Security setup completed!" -ForegroundColor Green
    } catch {
        Write-Warning "Security setup had issues, but continuing..."
    }
} else {
    Write-Warning "Security script not found. Skipping."
}

Write-Host "`n[8/10] Deploying Stored Procedures..."
$spFile = "$PSScriptRoot\..\..\database\GetTraceabilityFull.sql"
if (Test-Path $spFile) {
    try {
        Write-Host "Creating sp_GetTraceabilityFull_JSON..." -ForegroundColor Cyan
        Run-SqlFile -FilePath $spFile
        Write-Host "Stored procedures deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Warning "Stored procedure deployment had issues: $_"
    }
} else {
    Write-Warning "Stored procedure script not found at: $spFile"
}

Write-Host "`n[9/10] Deploying Audit Triggers..."
$auditFile = "$PSScriptRoot\..\..\database\security\audit_triggers.sql"
if (Test-Path $auditFile) {
    try {
        Write-Host "Creating audit triggers (BATCH/PRICE/DISCOUNT/VENDOR)..." -ForegroundColor Cyan
        Run-SqlFile -FilePath $auditFile
        Write-Host "Audit triggers deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Warning "Audit trigger deployment had issues: $_"
    }
} else {
    Write-Warning "Audit trigger script not found at: $auditFile"
}

Write-Host "`n[10/10] Deploying Validation Triggers..."
$validationFile = "$PSScriptRoot\..\..\database\security\validation_triggers.sql"
if (Test-Path $validationFile) {
    try {
        Write-Host "Creating validation triggers (BATCH/PROCESSING/PRICE/DISCOUNT/STORED_IN)..." -ForegroundColor Cyan
        Run-SqlFile -FilePath $validationFile
        Write-Host "Validation triggers deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Warning "Validation trigger deployment had issues: $_"
    }
} else {
    Write-Warning "Validation trigger script not found at: $validationFile"
}

Write-Host "`nCOMPLETE - All database systems initialized!`n" -ForegroundColor Green
