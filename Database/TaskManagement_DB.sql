-- =============================================================================
-- PROJECT      : Task Management System
-- FILE         : TaskManagement_DB.sql
-- DESCRIPTION  : Full database creation script for the Task Management System.
--                Includes tables, constraints, indexes, seed data, and
--                example queries for JSON handling.
-- =============================================================================

-- =============================================================================
-- SECTION 0 — DATABASE SETUP
-- Creates the database if it does not already exist and switches context to it.
-- =============================================================================

USE master;
GO

IF NOT EXISTS (
    SELECT name
    FROM sys.databases
    WHERE name = N'TaskManagementDB'
)
BEGIN
    CREATE DATABASE TaskManagementDB
        COLLATE SQL_Latin1_General_CP1_CI_AS; 
    PRINT 'Database TaskManagementDB created.';
END
ELSE
BEGIN
    PRINT 'Database TaskManagementDB already exists. Skipping creation.';
END
GO

USE TaskManagementDB;
GO

-- =============================================================================
-- SECTION 1 — TRANSACTIONAL SETUP  (Sections 1 – 6)
-- All schema DDL and seed data run inside a single named transaction.
-- =============================================================================

-- Automatically roll back the whole transaction on any runtime error.
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION SchemaSetup;
GO

-- =============================================================================
-- SECTION 1a — DROP EXISTING OBJECTS (safe re-run support)
-- =============================================================================

-- Drop FK constraints before dropping tables
IF OBJECT_ID('dbo.FK_Tasks_Users','F') IS NOT NULL
    ALTER TABLE dbo.Tasks DROP CONSTRAINT FK_Tasks_Users;

IF OBJECT_ID('dbo.FK_Tasks_TaskStatus','F') IS NOT NULL
    ALTER TABLE dbo.Tasks DROP CONSTRAINT FK_Tasks_TaskStatus;

-- Drop tables
IF OBJECT_ID('dbo.Tasks','U') IS NOT NULL 
    DROP TABLE dbo.Tasks;

IF OBJECT_ID('dbo.Users','U') IS NOT NULL 
    DROP TABLE dbo.Users;

IF OBJECT_ID('dbo.TaskStatus','U') IS NOT NULL 
    DROP TABLE dbo.TaskStatus;

PRINT 'Existing objects dropped.';
GO

-- =============================================================================
-- SECTION 2 — TABLE: TaskStatus
-- =============================================================================

CREATE TABLE dbo.[TaskStatus]
(
    [Id]          INT          NOT NULL IDENTITY(1, 1),
    [Name]        NVARCHAR(20) NOT NULL,
    [Description] NVARCHAR(100) NULL,
    [SortOrder]   INT          NOT NULL,

    -- -------------------------------------------------------------------------
    -- Constraints
    -- -------------------------------------------------------------------------
    CONSTRAINT PK_TaskStatus
        PRIMARY KEY CLUSTERED ([Id] ASC),

    CONSTRAINT UQ_TaskStatus_Name
        UNIQUE ([Name]),

    CONSTRAINT CK_TaskStatus_SortOrder
        CHECK ([SortOrder] >= 1)
);
GO

PRINT 'Table dbo.TaskStatus created.';
GO

-- =============================================================================
-- SECTION 3 — TABLE: Users
-- =============================================================================

CREATE TABLE dbo.[Users]
(
    [Id]        INT           NOT NULL IDENTITY(1, 1),
    [Name]      NVARCHAR(100) NOT NULL,
    [Email]     NVARCHAR(150) NOT NULL,
    [CreatedAt] DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

    -- -------------------------------------------------------------------------
    -- Constraints
    -- -------------------------------------------------------------------------
    CONSTRAINT PK_Users
        PRIMARY KEY CLUSTERED ([Id] ASC),

    CONSTRAINT UQ_Users_Email
        UNIQUE ([Email]),

    CONSTRAINT CK_Users_Email
        CHECK ([Email] LIKE '%@%.%')
);
GO

PRINT 'Table dbo.Users created.';
GO

-- =============================================================================
-- SECTION 4 — TABLE: Tasks
-- =============================================================================

CREATE TABLE dbo.[Tasks]
(
    [Id]             INT            NOT NULL IDENTITY(1, 1),
    [Title]          NVARCHAR(200)  NOT NULL,
    [Description]    NVARCHAR(MAX)  NULL,
    [StatusId]       INT            NOT NULL,
    [UserId]         INT            NOT NULL,
    [AdditionalInfo] NVARCHAR(MAX)  NULL,
    [CreatedAt]      DATETIME2      CONSTRAINT DF_Tasks_CreatedAt NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]      DATETIME2      NULL,

    -- -------------------------------------------------------------------------
    -- Constraints
    -- -------------------------------------------------------------------------
    CONSTRAINT PK_Tasks
        PRIMARY KEY CLUSTERED ([Id] ASC),

    CONSTRAINT CK_Tasks_Title
        CHECK (LEN(LTRIM(RTRIM([Title]))) > 0),

    CONSTRAINT CK_Tasks_AdditionalInfo_IsJson
        CHECK ([AdditionalInfo] IS NULL OR ISJSON([AdditionalInfo]) = 1),

    CONSTRAINT CK_Tasks_UpdatedAt
        CHECK ([UpdatedAt] IS NULL OR [UpdatedAt] >= [CreatedAt]),

    -- -------------------------------------------------------------------------
    -- Foreign Keys
    -- -------------------------------------------------------------------------
    CONSTRAINT FK_Tasks_TaskStatus
        FOREIGN KEY ([StatusId])
        REFERENCES dbo.[TaskStatus] ([Id])
        ON DELETE NO ACTION,

    CONSTRAINT FK_Tasks_Users
        FOREIGN KEY ([UserId])
        REFERENCES dbo.[Users] ([Id])
        ON DELETE NO ACTION
);
GO

PRINT 'Table dbo.Tasks created.';
GO

-- =============================================================================
-- SECTION 5 — INDEXES
-- Non-clustered indexes to optimise the most frequent query patterns.
-- =============================================================================

-- Index: Tasks filtered or joined by assigned user (most common access pattern)
CREATE NONCLUSTERED INDEX IDX_Tasks_UserId
    ON dbo.[Tasks] ([UserId] ASC)
    INCLUDE ([Title], [StatusId], [CreatedAt]);
GO

PRINT 'Indexes created.';
GO

-- =============================================================================
-- SECTION 6 — SEED DATA
-- Inserts the three required status rows into TaskStatus.
-- =============================================================================

SET IDENTITY_INSERT dbo.TaskStatus ON;

INSERT INTO dbo.[TaskStatus] ([Id], [Name], [Description], [SortOrder])
VALUES
    (1, 'Pending',     'Task has been created and is waiting to be picked up.',   1),
    (2, 'In Progress', 'Task is currently being worked on by the assigned user.', 2),
    (3, 'Done',        'Task has been completed successfully.',                   3);

SET IDENTITY_INSERT dbo.TaskStatus OFF;
GO

PRINT 'Seed data inserted into dbo.TaskStatus.';
GO

-- All steps succeeded — persist all changes atomically.
COMMIT TRANSACTION SchemaSetup;
GO

PRINT 'Schema setup committed successfully.'
GO

-- =============================================================================
-- SECTION 7 — JSON QUERY EXAMPLES  (AdditionalInfo column)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 7.1  ISJSON
-- -----------------------------------------------------------------------------

--SELECT
--    [Id],
--    [Title],
--    [AdditionalInfo],
--    ISJSON([AdditionalInfo]) AS [IsValidJson]
--FROM dbo.[Tasks]
--WHERE [AdditionalInfo] IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 7.2  JSON_VALUE
-- -----------------------------------------------------------------------------

--SELECT
--    t.[Id],
--    t.[Title],
--    ts.[Name]                                             AS [Status],
--    u.[Name]                                              AS [AssignedTo],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.priority')       AS [Priority],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.estimationdate') AS [EstimationDate],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.label')          AS [Label]
--FROM dbo.[Tasks] t
--JOIN dbo.[Users] u ON u.[Id] = t.[UserId]
--JOIN dbo.[TaskStatus] ts ON ts.[Id] = t.[StatusId]
--WHERE t.[AdditionalInfo] IS NOT NULL
--ORDER BY t.[CreatedAt] DESC;

-- -----------------------------------------------------------------------------
-- 7.3  JSON_QUERY
-- -----------------------------------------------------------------------------

--SELECT
--    [Id],
--    [Title],
--    JSON_QUERY([AdditionalInfo], '$.customFields') AS [AdditionalInfo]
--FROM dbo.[Tasks]
--WHERE [AdditionalInfo] IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 7.4  OPENJSON
-- -----------------------------------------------------------------------------

--SELECT DISTINCT
--    t.[Id],
--    t.[Title],
--    ts.[Name] AS [Status]
--FROM [dbo].[Tasks] t
--JOIN [dbo].[TaskStatus] ts ON ts.[Id] = t.[StatusId]
--CROSS APPLY OPENJSON(t.[AdditionalInfo], '$.customFields') AS priority
--WHERE [priority].[value] = 'High'
--  AND t.[AdditionalInfo] IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 7.5  Filter by a scalar JSON value
-- -----------------------------------------------------------------------------

--SELECT
--    t.[Id],
--    t.[Title],
--    u.[Name]                                              AS [AssignedTo],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.priority')       AS [Priority],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.estimationdate') AS [EstimationDate],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.label')          AS [Label]
--FROM dbo.[Tasks] t
--JOIN dbo.[Users] u ON u.[Id] = t.[UserId]
--WHERE JSON_VALUE(t.[AdditionalInfo], '$.customFields.priority') = 'High'
--ORDER BY t.[CreatedAt] DESC;

-- -----------------------------------------------------------------------------
-- 7.6 JSON_MODIFY
-- -----------------------------------------------------------------------------

--UPDATE dbo.[Tasks]
--SET
--    [AdditionalInfo] = JSON_MODIFY([AdditionalInfo], '$.customFields.priority', 'Low'),
--    [UpdatedAt]      = GETUTCDATE()
--WHERE [Id] = 14;

-- =============================================================================
-- SECTION 8 — REPORTING QUERIES
--   • Obtain tasks by user
--   • Filter by status
--   • Order by creation date
-- =============================================================================

--DECLARE @FilterUserId   INT            = NULL;   
--DECLARE @FilterStatus   INT            = NULL;  
--DECLARE @DateFrom       DATETIME2      = NULL;   
--DECLARE @DateTo         DATETIME2      = NULL;    

--SELECT
--    t.[Id],
--    t.[Title],
--    t.[Description],
--    ts.[Name]                                          AS [Status],
--    ts.[SortOrder]                                     AS [StatusOrder],
--    u.[Name]                                           AS [AssignedTo],
--    u.[Email]                                          AS [UserEmail],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.priority')       AS [Priority],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.estimationdate') AS [EstimationDate],
--    JSON_VALUE(t.[AdditionalInfo], '$.customFields.label')          AS [Label],
--    t.[CreatedAt],
--    t.[UpdatedAt]
--FROM dbo.[Tasks]      t
--JOIN dbo.[Users]      u  ON u.[Id]  = t.[UserId]
--JOIN dbo.[TaskStatus] ts ON ts.[Id] = t.[StatusId]
--WHERE (@FilterUserId IS NULL OR t.[UserId]    = @FilterUserId)
--  AND (@FilterStatus  IS NULL OR ts.[Id]      = @FilterStatus)
--  AND (@DateFrom      IS NULL OR t.[CreatedAt] >= @DateFrom)
--  AND (@DateTo        IS NULL OR t.[CreatedAt] <= @DateTo)
--ORDER BY t.[CreatedAt] DESC;
  
