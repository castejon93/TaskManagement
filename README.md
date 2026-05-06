# Task Management System

A full-stack task management application built with **.NET 10**, **Angular 21**, and **SQL Server**.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Steps to Run the Project](#steps-to-run-the-project)
  - [1. Database](#1-database)
  - [2. API](#2-api)
  - [3. Frontend](#3-frontend)
- [Technical Decisions](#technical-decisions)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Database](#database)
- [Pending Functionalities](#pending-functionalities)
- [SQL JSON Query Examples](#sql-json-query-examples)

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0 |
| SQL Server | 2019 or later |
| Node.js | 20 or later |
| npm | 11 or later |
| Angular CLI | 21 |

---

## Steps to Run the Project

### 1. Database

1. Open **SQL Server Management Studio** (or any SQL client).
2. Execute the full script:
   ```
   Database/TaskManagement_DB.sql
   ```
   The script creates the `TaskManagementDB` database, all tables, indexes, constraints, seed data, and is safe to re-run (idempotent).

---

### 2. API

1. Navigate to the API folder:
   ```bash
   cd API
   ```

2. Open `TaskManagement.API/appsettings.Development.json` and verify the connection string matches your SQL Server instance:
   ```json
   {
     "ConnectionStrings": {
       "TaskManagementDB": "Server=localhost;Database=TaskManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

3. Run the API:
   ```bash
   dotnet run --project TaskManagement.API
   ```
   The API starts on `http://localhost:5205`.

4. Swagger UI is available at:
   ```
   http://localhost:5205/swagger
   ```

---

### 3. Frontend

1. Navigate to the Angular project:
   ```bash
   cd Frontend/task-management-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application opens at `http://localhost:4200` and calls the API at `http://localhost:5205/api`.

---

## Technical Decisions

### Backend

- **Clean Architecture** — the solution is split into four layers: `Domain`, `Application`, `Infrastructure`, and `API`. Each layer has a single responsibility and depends only on the layer below it.

- **.NET 10** — latest LTS release. Uses minimal hosting model (`WebApplication`) and top-level statements in `Program.cs`.

- **EF Core (code-first)** — entity configuration via `IEntityTypeConfiguration<T>`. Migrations are not used; the database is provisioned by `TaskManagement_DB.sql`.

- **Repository pattern** — the Application layer depends on `ITaskRepository`, `IUserRepository`, and `ITaskStatusRepository` interfaces. Infrastructure provides the SQL Server implementations, keeping the domain clean of persistence concerns.

- **FluentValidation** — all request validation is handled by `AbstractValidator<T>` classes registered via DI and invoked with `ValidateAndThrowAsync`. This keeps controller actions clean.

- **Serilog** — structured logging to console and rolling file (`logs/taskmanagement-YYYYMMDD.log`). Bootstrap logger captures startup failures before the host is fully built.

- **Global exception middleware** — a single `GlobalExceptionMiddleware` maps domain exceptions (`NotFoundException`, `InvalidStatusTransitionException`, `DomainException`, `ValidationException`) to the appropriate HTTP status codes (404, 422, 409, 400) and returns a consistent `{ status, error, path }` JSON envelope. `OperationCanceledException` from client disconnects is caught separately and logged at `Information` level (not as an error).

- **CancellationToken propagation** — all controller actions and service methods accept and forward a `CancellationToken`, allowing the framework to abort database queries when the client disconnects.

- **AdditionalInfo column** — stored as `NVARCHAR(MAX)` containing a JSON document (`{ "customFields": { "key": "value" } }`). Serialization and deserialization are handled by `metadata.utils.ts` on the frontend and by the `TaskService` on the backend, with no additional ORM mapping needed.

---

### Frontend

- **Angular 21 standalone components** — no NgModules. Every component declares its own `imports` array.

- **NgRx 21** — global state managed with `Store` + `Actions` + `Effects`. Feature state slices (`tasks`, `users`) are registered lazily via `provideState()` and `provideEffects()` in the route providers, so they are only loaded when the user navigates to the feature.

- **`concatMap` for loads, `exhaustMap` for mutations** — `concatMap` queues filter requests without cancelling in-flight HTTP calls (avoids `TaskCanceledException` on the API). `exhaustMap` ignores duplicate dispatches while a create/update request is in flight (prevents double-submit).

- **Signal inputs/outputs** — `input()` and `output()` replace `@Input()` / `@Output()` decorators for all shared components.

- **`toSignal()`** — `async` pipe is not used anywhere. All observables from the NgRx store are converted to signals with `toSignal()`, which integrates cleanly with Angular's signal-based change detection.

- **`takeUntilDestroyed()`** — used in form components to automatically unsubscribe from `Actions` streams when the component is destroyed, replacing manual `Subject`/`takeUntil` teardown.

- **Lazy-loaded routes** — `app.routes.ts` loads the `tasks` and `users` feature chunks on demand via `loadChildren`.

- **`startWith(null)` on the status filter** — triggers the initial `loadTasks` dispatch when the task-list mounts, without a separate `ngOnInit` dispatch in the parent shell component.

- **`SKIP_LOADING` token** — both `TasksApiService` and `UsersApiService` set this `HttpContextToken` to suppress the global loading interceptor. Loading state for those features is already tracked by NgRx selectors (`selectTasksLoading`, `selectUsersLoading`), so the page-shell spinner is the only indicator shown.

- **Angular Material M3 dark theme** — applied globally via `styles.scss`. No per-component theming overrides.

- **External template/style files** — all components use `templateUrl` and `styleUrl`. No inline `template` or `styles` in any `@Component` decorator.

---

### Database

- All identifiers are bracket-qualified (`[Id]`, `[Name]`, etc.) to avoid conflicts with reserved keywords.
- The schema setup runs inside a single named transaction (`BEGIN TRANSACTION SchemaSetup`) with `SET XACT_ABORT ON`, so any failure rolls back the entire script atomically.
- `AdditionalInfo` is stored as `NVARCHAR(MAX)` JSON. SQL Server's native JSON functions (`ISJSON`, `JSON_VALUE`, `JSON_QUERY`, `OPENJSON`) are used for validation and querying without a separate JSON column type.
- Status transitions are enforced at the application layer (`InvalidStatusTransitionException`) — only sequential promotion is allowed (Pending → In Progress → Done).

---

## Pending Functionalities

- **Authentication and authorization** — no user login or role-based access control is implemented. All endpoints are public.
- **Edit and delete tasks** — only create and status-advance are supported. Full CRUD for tasks is not implemented.
- **Edit and delete users** — only create and list are supported.
- **Pagination** — all task and user lists are returned without pagination. Large datasets would require server-side paging.
- **Task assignment change** — once a task is created, the assigned user cannot be changed through the UI.
- **Search / free-text filter** — tasks can only be filtered by status. Filtering by title, description, or assigned user is not implemented.
- **Unit tests for the Angular layer** — the `.NET` test suite covers services and controllers (30 tests), but no Angular unit or integration tests are written.
- **Production build configuration** — the Angular `environment.prod.ts` and API `appsettings.Production.json` are placeholders. No deployment pipeline is configured.

---

## SQL JSON Query Examples

The `AdditionalInfo` column stores task metadata as a JSON document with the following shape:

```json
{
  "customFields": {
    "priority": "High",
    "estimationdate": "2025-12-31",
    "label": "Backend"
  }
}
```

---

### ISJSON — Validate that the column contains well-formed JSON

```sql
SELECT
    [Id],
    [Title],
    [AdditionalInfo],
    ISJSON([AdditionalInfo]) AS [IsValidJson]
FROM dbo.[Tasks]
WHERE [AdditionalInfo] IS NOT NULL;
```

Returns `1` for every row where `AdditionalInfo` is valid JSON, `0` otherwise. Useful for data-quality checks after bulk inserts.

---

### JSON_VALUE — Extract a single scalar value from the JSON document

```sql
SELECT
    t.[Id],
    t.[Title],
    ts.[Name]                                                         AS [Status],
    u.[Name]                                                          AS [AssignedTo],
    JSON_VALUE(t.[AdditionalInfo], '$.customFields.priority')         AS [Priority],
    JSON_VALUE(t.[AdditionalInfo], '$.customFields.estimationdate')   AS [EstimationDate],
    JSON_VALUE(t.[AdditionalInfo], '$.customFields.label')            AS [Label]
FROM dbo.[Tasks] t
JOIN dbo.[Users]      u  ON u.[Id]  = t.[UserId]
JOIN dbo.[TaskStatus] ts ON ts.[Id] = t.[StatusId]
WHERE t.[AdditionalInfo] IS NOT NULL
ORDER BY t.[CreatedAt] DESC;
```

`JSON_VALUE` returns `NULL` if the path does not exist in the document, so rows without a specific custom field are still returned.

---

### JSON_QUERY — Extract an entire JSON sub-object or array

```sql
SELECT
    [Id],
    [Title],
    JSON_QUERY([AdditionalInfo], '$.customFields') AS [CustomFields]
FROM dbo.[Tasks]
WHERE [AdditionalInfo] IS NOT NULL;
```

Unlike `JSON_VALUE`, `JSON_QUERY` returns the raw JSON fragment (object or array) rather than a scalar string. Use it when you need to pass the sub-document to a client or a downstream function.

---

### OPENJSON — Shred a JSON object into a relational rowset

```sql
SELECT DISTINCT
    t.[Id],
    t.[Title],
    ts.[Name] AS [Status]
FROM dbo.[Tasks] t
JOIN dbo.[TaskStatus] ts ON ts.[Id] = t.[StatusId]
CROSS APPLY OPENJSON(t.[AdditionalInfo], '$.customFields') AS [cf]
WHERE [cf].[value] = 'High'
  AND t.[AdditionalInfo] IS NOT NULL;
```

`OPENJSON` expands the `customFields` object into rows of `(key, value, type)`. The `CROSS APPLY` means only tasks that have a `customFields` object are included. The `WHERE [cf].[value] = 'High'` filters to any task where at least one custom field equals `'High'` — regardless of which key it belongs to.

To filter on a specific key use `WHERE [cf].[key] = 'priority' AND [cf].[value] = 'High'`.
