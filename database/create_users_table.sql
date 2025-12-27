-- Create Users table for application authentication
-- Run as part of setup-db.ps1 after schema & master data import

IF NOT EXISTS (
    SELECT 1 FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Users' AND s.name = 'dbo'
)
BEGIN
    CREATE TABLE dbo.Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(200) NOT NULL,
        Role NVARCHAR(20) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END

-- Example: to insert an admin user, generate a bcrypt hash in Node and paste here
-- Node example:
--   node -e "const b=require('bcryptjs');b.hash('admin123',10).then(h=>console.log(h));"
-- Then insert (replace <BCRYPT_HASH>):
-- INSERT INTO dbo.Users (Username, PasswordHash, Role, CreatedAt)
-- VALUES ('admin','<BCRYPT_HASH>','admin', GETDATE());
