# Project Management API

Production-oriented REST backend using TypeScript, Express, Prisma/MySQL,
JWT bearer authentication, persisted token revocation, Zod, Helmet, CORS,
rate limiting, bcrypt, and pino.

## Setup

Requirements: Node.js 20+ and MySQL 8+.

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

Set a cryptographically random `JWT_SECRET` of at least 32 characters. Configure
`CORS_ORIGINS` as a comma-separated allowlist. `*` is supported but should not
be used in production. The server fails fast when required configuration is
invalid.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server with reload |
| `npm run build` | Compile into `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | Type-check without output |
| `npm test` | Focused unit/HTTP tests (no live database) |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:deploy` | Apply checked-in migrations |
| `npm run prisma:studio` | Inspect the database |

## Design notes

- Every project and task query is scoped to the authenticated user. Task
  operations additionally verify the related project belongs to that user.
- JWTs have UUID `jti` claims. Logout persists the `jti` and expiry, and auth
  middleware rejects revoked tokens. Expired revocations are pruned on startup.
- `passwordHash` is selected only where password verification is required and
  is removed before any response.
- Project deletion cascades to its tasks. User deletion cascades to all owned
  data and revocations.
- List endpoints support search, filtering, pagination, and constrained sorting.

See [API.md](API.md) for the full HTTP contract.
