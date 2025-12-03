# This script orchestrates the initial development setup.
# It checks if the database exists and only runs the setup scripts if needed.

param(
  [string]$SqlServer = "localhost,1433",
  [string]$AppDb = "Traceability",
  [string]$SaUser = "sa"
)

# Function to check if the database exists using sqlcmd
function Test-DatabaseExists {
    param(
        [string]$Server,
        [string]$Database,
        [string]$User,
        [string]$Password
    )
    
    $query = "SELECT DB_ID('$Database')"
    $sqlCmdArgs = @("-S", $Server, "-Q", $query, "-h-1")

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

    # If the database does not exist, sqlcmd returns "NULL" or an empty string.
    if ($result -and $result.Trim() -ne "NULL" -and $result.Trim() -ne "") {
        return $true
    } else {
        return $false
    }
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
