-- Run this ONCE in SSMS. Creates the SafeX database and tables.

IF DB_ID('SafeX') IS NULL
BEGIN
    CREATE DATABASE SafeX;
END
GO

USE SafeX;
GO

IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        Name         NVARCHAR(80)  NOT NULL UNIQUE,
        Slug         NVARCHAR(80)  NOT NULL UNIQUE,
        CreatedAt    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.Videos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Videos (
        Id               INT IDENTITY(1,1) PRIMARY KEY,
        YouTubeId        NVARCHAR(32)   NOT NULL UNIQUE,
        Title            NVARCHAR(300)  NOT NULL,
        Description      NVARCHAR(MAX)  NULL,
        ChannelTitle     NVARCHAR(200)  NULL,
        ThumbnailUrl     NVARCHAR(500)  NULL,
        DurationSeconds  INT            NOT NULL DEFAULT 0,
        ViewCount        BIGINT         NOT NULL DEFAULT 0,
        Language         NVARCHAR(10)   NULL,
        Audience         NVARCHAR(20)   NOT NULL DEFAULT 'general',   -- 'kids' | 'general'
        Status           NVARCHAR(20)   NOT NULL DEFAULT 'Pending',   -- Pending | Approved | Published | Rejected
        CategoryId       INT            NULL REFERENCES dbo.Categories(Id),
        IsDeleted        BIT            NOT NULL DEFAULT 0,
        ReviewNotes      NVARCHAR(MAX)  NULL,
        CreatedAt        DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt        DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_Videos_Status ON dbo.Videos(Status);
    CREATE INDEX IX_Videos_IsDeleted ON dbo.Videos(IsDeleted);
END
GO
PRINT 'SafeX database ready.';
