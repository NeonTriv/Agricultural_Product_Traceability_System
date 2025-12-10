# This script orchestrates the initial development setup.
# It checks if the database exists and only runs the setup scripts if needed.

param(
    [string]$SqlServer = "localhost,1433",
    [string]$AppDb = "Traceability",
    [string]$SaUser = "test"
)

# Function to check if the database exists using sqlcmd
function Test-DatabaseExists {
    param(
        [string]$Server,
        [string]$Database,
        [string]$User,
        [string]$Password
    )
    
    $query = "SET NOCOUNT ON; SELECT DB_ID('$Database')"
    $sqlCmdArgs = @("-S", $Server, "-Q", $query, "-h-1", "-W", "-b")

    if ([string]::IsNullOrWhiteSpace($Password)) {
        # Use Windows Integrated Authentication
        $sqlCmdArgs += "-E"
    } else {
        # Use SQL Server Authentication
        $sqlCmdArgs += @("-U", $User, "-P", $Password)
    }

    # Execute sqlcmd and capture the output
    $result = & sqlcmd @sqlCmdArgs
    
    # Check sqlcmd exit code
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Could not connect to SQL Server to check for database. Assuming it doesn't exist."
        return $false
    }

    # If the database exists, DB_ID returns a positive integer; otherwise NULL/empty
    $trimmed = if ($null -ne $result) { $result.Trim() } else { "" }
    if ([string]::IsNullOrWhiteSpace($trimmed)) { return $false }
    if ($trimmed -eq "NULL") { return $false }
    $idVal = 0
    if ([int]::TryParse($trimmed, [ref]$idVal) -and $idVal -gt 0) { return $true } else { return $false }
}

# --- Main Execution ---

Write-Host "--------------------------------------------------"
Write-Host "Starting Automated Development Environment Setup"
Write-Host "--------------------------------------------------"

# Prompt for the SA password once, can be left blank for Windows Auth
$SaPassword = Read-Host -Prompt "Enter SQL Server SA password (or press Enter for Windows Authentication)"

Write-Host "Checking for database '$AppDb' on server '$SqlServer'..."

if (Test-DatabaseExists -Server $SqlServer -Database $AppDb -User $SaUser -Password $SaPassword) {
    Write-Host "[OK] Database '$AppDb' already exists. Skipping setup scripts." -ForegroundColor Green
} else {
    Write-Host "[INFO] Database '$AppDb' not found. Starting one-time setup..." -ForegroundColor Yellow
    
    # Allow user to choose a different database name
    $newDbName = Read-Host -Prompt "Enter NEW database name (or press Enter to keep '$AppDb')"
    if (-not [string]::IsNullOrWhiteSpace($newDbName)) { $AppDb = $newDbName.Trim() }

    # Export settings so backend setup uses the same values
    $env:INIT_SQLSERVER = $SqlServer
    $env:INIT_APPDB = $AppDb
    $env:INIT_SAUSER = $SaUser
    $env:INIT_SAPASSWORD = $SaPassword  # may be empty -> Windows Auth in setup-db

    # 1. Run the database setup script
    Write-Host "[STEP 1/2] Creating database, schema, and user..."
    npm --workspace ./backend run setup-db
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Database setup failed. Please check the logs."
        exit 1
    }
    Write-Host "[SUCCESS] Database created." -ForegroundColor Green

    # 2. Run the baseline migration
    Write-Host "[STEP 2/2] Applying baseline migration..."
    npm --workspace ./backend run migration:run
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Migration run failed. Please check the logs."
        exit 1
    }
    Write-Host "[SUCCESS] Baseline migration applied." -ForegroundColor Green
}

Write-Host "--------------------------------------------------"
Write-Host "Setup complete! You can now start the servers."
Write-Host "Run 'npm run dev:backend' and 'npm run dev:frontend' in separate terminals."
Write-Host "--------------------------------------------------"
