param(
  [string]$SqlServer = "tcp:localhost,1433",
  [string]$SaUser = "sa",
  [string]$SaPassword = "",
  [string]$AppDb = "Traceability",
  [string]$AppLogin = "test",
  [string]$AppPassword = "test",
  [string]$SchemaFile = "$PSScriptRoot\..\..\database\BTL_LEADER_SCHEMA.sql"
)

function Run-Sql($Query, $Database = $null) {
  if ([string]::IsNullOrWhiteSpace($SaPassword)) {
    # Try Windows Integrated Auth
    if ($Database) {
      & sqlcmd -S $SqlServer -E -d $Database -Q $Query
    } else {
      & sqlcmd -S $SqlServer -E -Q $Query
    }
  } else {
    if ($Database) {
      & sqlcmd -S $SqlServer -U $SaUser -P $SaPassword -d $Database -Q $Query
    } else {
      & sqlcmd -S $SqlServer -U $SaUser -P $SaPassword -Q $Query
    }
  }
  if ($LASTEXITCODE -ne 0) {
    throw "sqlcmd failed with exit code $LASTEXITCODE"
  }
}

Write-Host "Using SQL Server: $SqlServer"
Write-Host "Target database: $AppDb"
Write-Host "Schema file: $SchemaFile"

if (-not (Test-Path $SchemaFile)) {
  Write-Error "Schema file not found at $SchemaFile"
  exit 1
}

if ([string]::IsNullOrWhiteSpace($SaPassword)) {
  $input = Read-Host "Enter SA password (leave blank to use Windows Integrated Auth)"
  if (-not [string]::IsNullOrWhiteSpace($input)) { $SaPassword = $input }
}

try {
  Write-Host "Creating database '$AppDb' if it does not exist..."
  $createDbSql = "IF DB_ID(N'$AppDb') IS NULL CREATE DATABASE [$AppDb];"
  Run-Sql $createDbSql

  Write-Host "Running schema file to create tables..."
  if ([string]::IsNullOrWhiteSpace($SaPassword)) {
    & sqlcmd -S $SqlServer -E -d $AppDb -i $SchemaFile
  } else {
    & sqlcmd -S $SqlServer -U $SaUser -P $SaPassword -d $AppDb -i $SchemaFile
  }
  if ($LASTEXITCODE -ne 0) { throw "sqlcmd failed to run schema (exit $LASTEXITCODE)" }

  Write-Host "Ensuring login/user '$AppLogin' exists and has db_owner on $AppDb..."
  $userSql = @"
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'$AppLogin')
  CREATE LOGIN [$AppLogin] WITH PASSWORD = N'$AppPassword';
USE [$AppDb];
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$AppLogin')
  CREATE USER [$AppLogin] FOR LOGIN [$AppLogin];
EXEC sp_addrolemember N'db_owner', N'$AppLogin';
"@

  Run-Sql $userSql

  Write-Host "Database setup completed. $AppDb is ready and user '$AppLogin' has db_owner rights."
} catch {
  Write-Error "Error during DB setup: $_"
  exit 1
}
