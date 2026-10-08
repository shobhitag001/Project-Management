# API contract

Base URL: `http://localhost:4000`. JSON endpoints use the `/api` prefix.
Protected endpoints require `Authorization: Bearer <token>`. Success responses
use `{ "data": ... }`; list responses use
`{ "data": [...], "pagination": { ... } }`. Errors use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": {} } }
```

Dates may be `YYYY-MM-DD` values or ISO 8601 date-times with a timezone, for
example `2026-10-08` or `2026-10-08T10:00:00.000Z`. Unknown body/query keys are rejected. Optional text
may be omitted or set to `null`, but cannot be an empty/whitespace-only string.

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Liveness response `{ "data": { "status": "ok" } }` |

## Authentication

| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/api/auth/register` | `fullName`, `email`, `password` | `201`, user and JWT |
| POST | `/api/auth/login` | `email`, `password` | `200`, user and JWT |
| POST | `/api/auth/logout` | none | `204`; current JWT is revoked |
| GET | `/api/auth/me` | none | Current user |

Passwords are 8–72 characters and require an uppercase letter, lowercase
letter, and number. Register/login are rate limited. Emails are normalized to
lowercase. User payloads never contain `passwordHash`.

## Projects

Project fields:

- Response shape: `id`, `name`, `description`, `status`, `startDate`,
  `endDate`, `createdAt`, `updatedAt`, and optional `_count: { tasks }`.
- `name` (required, max 150)
- `description` (nullable, max 2000)
- `status`: `NOT_STARTED | IN_PROGRESS | COMPLETED`
- `startDate`, `endDate` (nullable); end cannot precede start

| Method | Path | Description |
|---|---|---|
| GET | `/api/projects` | Owned project list |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Owned project |
| PATCH/PUT | `/api/projects/:id` | Partial update (at least one field) |
| DELETE | `/api/projects/:id` | Delete project and its tasks (`204`) |

List query parameters:

- `search` (case-insensitive name/description)
- `status`
- `page` (default 1), `limit` (default 20, maximum 100)
- `sortBy`: `name | status | startDate | endDate | createdAt | updatedAt`
- `sortOrder`: `asc | desc`

## Tasks

Task fields:

- Response shape: `id`, `projectId`, `name`, `description`, `priority`,
  `status`, `dueDate`, `createdAt`, `updatedAt`, and optional
  `project: { id, name }`. Task list responses include `project`.
- `name` (required, max 200)
- `description` (nullable, max 4000)
- `projectId` (required UUID of an owned project)
- `status`: `PENDING | IN_PROGRESS | COMPLETED`
- `priority`: `LOW | MEDIUM | HIGH`
- `dueDate` (nullable)

| Method | Path | Description |
|---|---|---|
| GET | `/api/tasks` | Owned task list |
| POST | `/api/tasks` | Create task in an owned project |
| GET | `/api/tasks/:id` | Owned task |
| PATCH/PUT | `/api/tasks/:id` | Partial update or move to another owned project |
| DELETE | `/api/tasks/:id` | Delete owned task (`204`) |

List query parameters:

- `search` (case-insensitive name/description)
- `status`, `priority`, `projectId`
- `dueFrom`, `dueTo`
- `page`, `limit`
- `sortBy`: `name | status | priority | dueDate | createdAt | updatedAt`
- `sortOrder`: `asc | desc`

The `pagination` object contains `page`, `limit`, `total`, `totalPages`,
`hasNextPage`, and `hasPreviousPage`.

All field names are camelCase. Date-time fields in JSON responses are ISO 8601
strings. Authentication register/login responses have
`{ "data": { "token": "...", "user": { ... } } }`; `/api/auth/me` has
`{ "data": { ...userFields } }`.

## Dashboard

`GET /api/dashboard` returns owned project counts by status, task counts by
status and priority, overdue count, due-within-seven-days count, five recently
updated projects, and ten recently updated tasks. All aggregates and nested
relations are ownership scoped.
