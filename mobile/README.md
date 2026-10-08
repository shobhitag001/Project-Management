# Project Manager Mobile

Expo React Native client for the project-management API. It includes authentication, a dashboard, project/task browsing, task CRUD, quick status/priority updates, search/filtering, pull-to-refresh, offline errors, and expired-session handling.

## Prerequisites

- Node.js 20+
- npm
- Expo Go on a phone, or an Android/iOS simulator
- A running backend reachable from the device

## Setup and run

```powershell
cd mobile
Copy-Item .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL to the backend API base URL.
npm install
npm start
```

Then scan the QR code with Expo Go. For a physical phone, use the computer's LAN IP rather than `localhost`, and ensure both devices are on the same network. Use `npm run android` or `npm run ios` for a simulator.

Restart Expo after changing `.env`. The app intentionally refuses requests when `EXPO_PUBLIC_API_URL` is missing.

## Validation

```powershell
npm run typecheck
```

## API contract

All JSON requests use the configured base URL and authenticated calls send `Authorization: Bearer <JWT>`. Successful responses may return the value directly or under `data`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | `{ fullName, email, password }`; data is `{ token, user }` |
| POST | `/auth/login` | `{ email, password }`; data is `{ token, user }` |
| POST | `/auth/logout` | Revokes the current token |
| GET | `/auth/me` | Data is the authenticated user |
| GET | `/dashboard` | Returns the five required dashboard metrics |
| GET | `/projects` | Returns projects |
| GET | `/projects/:id` | Returns one project |
| GET | `/tasks?projectId=:id` | Returns tasks for a project |
| POST | `/tasks` | Creates a task with `projectId` |
| PATCH | `/tasks/:id` | Updates task fields |
| DELETE | `/tasks/:id` | Deletes a task |

Task wire values use statuses `PENDING`, `IN_PROGRESS`, and `COMPLETED`, and priorities `LOW`, `MEDIUM`, and `HIGH`. A `401` response deletes the JWT from Secure Store and returns the user to sign-in with an expiry message.

Responses use `{ "data": ... }`; list responses may additionally include `pagination`. Errors use `{ "error": { "code", "message", "details"? } }`. Fields are camelCase and date values are ISO strings.

Project resources contain `id`, `name`, `description`, `status`, `startDate`, `endDate`, `createdAt`, `updatedAt`, and optional `_count.tasks`. Task resources contain `id`, `projectId`, `name`, `description`, `priority`, `status`, `dueDate`, `createdAt`, `updatedAt`, and optional `project` (`id`, `name`).

## Android APK

The `preview` EAS profile produces an installable APK:

```powershell
npx eas login
npx eas build --platform android --profile preview
```

Set `EXPO_PUBLIC_API_URL` to the deployed HTTPS backend before building. EAS
returns a distribution URL after the build completes.
