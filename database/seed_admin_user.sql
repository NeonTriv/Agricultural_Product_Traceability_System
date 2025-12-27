-- Seed admin user with plaintext password (fallback supported by backend)
USE [Traceability];

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin')
BEGIN
    INSERT INTO dbo.Users (Username, PasswordHash, Role, CreatedAt)
    VALUES ('admin', 'admin123', 'admin', GETDATE());
END
