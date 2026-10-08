# ProjectFlow — Project Management System

ProjectFlow is a full-stack project and task manager with a responsive React
web application and an Expo React Native Android application. Both clients use
the same secured Express API and MySQL database, so changes are visible
across devices after refresh.

## Architecture

| Package | Technology | Purpose |
| --- | --- | --- |
| `backend/` | Express, TypeScript, Prisma, MySQL | Shared REST API, authentication, authorization and persistence |
| `web/` | React, Vite, React Router | Responsive browser client |
| `mobile/` | Expo, React Native, TypeScript | Android/iOS client with secure credential storage |

The API uses short-lived JWT bearer tokens. Passwords are hashed with bcrypt,
protected routes verify token revocation and resource ownership, and all
incoming data is validated before it reaches Prisma.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop, or a local MySQL 8+ server
- For mobile: Android Studio/emulator, or an Android phone with Expo Go

## Quick start

### 1. Start MySQL

```bash
docker compose up -d mysql
```

The development database is available on `localhost:3306` with the credentials
declared in `docker-compose.yml`. These are development-only credentials.

### 2. Configure environment variables

Copy each example file:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
```

On Windows PowerShell, use `Copy-Item` instead of `cp` if preferred. Generate a
strong JWT secret rather than retaining any example value.

### 3. Install and initialize

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

### 4. Run the API and web app

Use separate terminals:

```bash
npm run dev:backend
npm run dev:web
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

### 5. Run mobile

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to a URL the phone or emulator can
reach:

- Android emulator: `http://10.0.2.2:4000/api`
- Physical device: `http://<computer-LAN-IP>:4000/api`
- Deployed API: `https://api.example.com/api`

Then run:

```bash
npm run dev:mobile
```

Press `a` for an Android emulator or scan the Expo QR code on a physical phone.
The API must allow the web origin through its `CORS_ORIGINS` setting. Native
mobile requests are not governed by browser CORS.

## Environment variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection URL |
| `JWT_SECRET` | Yes | Strong secret used to sign access tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime, for example `1h` |
| `PORT` | No | API port; defaults to `4000` |
| `CORS_ORIGINS` | Yes | Comma-separated allowed web origins |
| `LOG_LEVEL` | No | Pino log level |

See `backend/.env.example` for the canonical list.

### Web

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Shared API base URL ending in `/api` |

### Mobile

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Yes | Shared API base URL reachable from the device |

Do not put secrets in either client environment file. Values prefixed with
`VITE_` and `EXPO_PUBLIC_` are embedded in client bundles.

## Commands

```bash
npm run build       # Backend and production web build
npm run typecheck   # Type-check every workspace
npm test            # Run available tests
```

Backend-specific database and test commands are documented in
[`backend/README.md`](backend/README.md).

## API and data model

- API documentation: [`backend/API.md`](backend/API.md)
- ER diagram: [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md)
- Prisma schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

All protected endpoints require `Authorization: Bearer <token>`. Successful
responses use `{ "data": ... }`; validation and runtime errors use
`{ "error": { "code": "...", "message": "...", "details": ... } }`.

## Security notes

- Use test data only.
- Mobile tokens are stored with Expo SecureStore (Android Keystore/iOS
  Keychain), never AsyncStorage.
- Browser tokens are kept only for this demonstration. For a production browser
  deployment, prefer same-site, secure, HTTP-only cookies plus CSRF protection.
- Authentication endpoints are rate limited by source IP.
- Prisma parameterizes database access; raw user input is not interpolated into
  SQL.
- Every project/task query is scoped to the authenticated owner.
- Logout revokes the current JWT until it expires.

## Deployment

### Railway: MySQL and API

1. Create a Railway project from this GitHub repository and add a MySQL
   database service.
2. Add an API service from the same repository. Keep its root directory at the
   repository root so `railway.json` can build the npm workspace.
3. Configure the API variables:
   - `DATABASE_URL=${{MySQL.MYSQL_URL}}`
   - `NODE_ENV=production`
   - `JWT_SECRET` with at least 32 random characters
   - `JWT_EXPIRES_IN=1h`
   - `JWT_ISSUER=project-management-api`
   - `JWT_AUDIENCE=project-management-client`
   - `CORS_ORIGINS` with the deployed Vercel origin
   - `LOG_LEVEL=info`
   - `AUTH_RATE_LIMIT_WINDOW_MS=900000`
   - `AUTH_RATE_LIMIT_MAX=20`
4. Generate a public Railway domain for the API. The checked-in deployment
   configuration builds the backend, runs `prisma migrate deploy`, starts the
   API, and checks `/health`.

### Vercel: web

1. Import this GitHub repository into Vercel and keep the project root at the
   repository root.
2. Set `VITE_API_URL` to the public Railway API URL ending in `/api`.
3. Deploy. `vercel.json` builds the web workspace, serves `web/dist`, and
   rewrites client-side routes to `index.html`.
4. Copy the production Vercel origin to the Railway API's `CORS_ORIGINS`
   variable and redeploy the API.

### Android distribution

Set the same deployed API URL in `mobile/.env`, then use EAS:

```bash
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
```

The resulting EAS URL can be shared as the Android submission. Deployment URLs,
the public repository URL, APK/EAS link and screen recording are release
artifacts and are intentionally not hard-coded in source.
