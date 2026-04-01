# Finance Data Processing and Access Control Backend

## Overview
This backend powers a finance dashboard with role-based access, financial record CRUD, dashboard analytics, caching, monitoring, and API documentation.

Stack used:
- TypeScript + Node.js + Express
- Prisma ORM + PostgreSQL (Neon supported)
- Redis (Upstash supported) for caching and refresh-session storage
- JWT access and refresh tokens
- Zod validation
- Winston logging
- Prometheus metrics for Grafana
- OpenAPI (Swagger)

## Core Features
- User registration and login
- Role-based authorization: `VIEWER`, `ANALYST`, `ADMIN`
- User state: `ACTIVE`, `INACTIVE`
- Financial records CRUD with filters (`type`, `category`, `startDate`, `endDate`)
- Dashboard summary with cached aggregation
- Refresh-token sessions backed by Redis
- Structured error handling and validation

## Architecture Summary
The app follows a layered architecture:

1. Routes layer: maps endpoints and guards.
2. Controllers layer: receives HTTP input/output.
3. Services layer: business logic and orchestration.
4. Data layer: Prisma -> PostgreSQL.
5. Cross-cutting utilities: Redis, logger, metrics, OpenAPI.

For the full architecture diagram and flow, see `ARCHITECTURE.md`.

## Project Structure
```text
src/
  app.ts
  server.ts
  controllers/
  routes/
  services/
  middlewares/
  utils/
  types/
prisma/
  schema.prisma
api/
  index.ts
```

## Environment Variables
Create `.env` using `.env.example`.

Required values:
- `PORT`: API port (default `5000`)
- `NODE_ENV`: `development` or `production`
- `JWT_SECRET`: secret for short-lived access token
- `REFRESH_SECRET`: secret for refresh token
- `DATABASE_URL`: PostgreSQL connection string (Neon recommended)
- Redis config: use either `REDIS_URL` or Upstash REST credentials
- `REDIS_URL`: standard Redis URL (local/dev or Upstash TLS URL `rediss://...`)
- `UPSTASH_REDIS_REST_URL`: Upstash REST endpoint (`https://...upstash.io`)
- `UPSTASH_REDIS_REST_TOKEN`: Upstash REST API token
- `CLIENT_URL`: frontend URL for CORS
- `API_URL`: public API base URL

Upstash format example:
```env
REDIS_URL="rediss://default:YOUR_UPSTASH_PASSWORD@YOUR_UPSTASH_HOST:6379"
```

## Local Run
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Build and Start
```bash
npm run build
npm start
```

## API Documentation
- Swagger UI: `/docs`
- OpenAPI JSON: `/api-docs`

## Monitoring
- Prometheus metrics endpoint: `/metrics`
- Import this endpoint into Prometheus/Grafana dashboards.

## Access Matrix
| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View dashboard summary | Yes | Yes | Yes |
| View records | No | Yes | Yes |
| Create records | No | No | Yes |
| Update records | No | No | Yes |
| Delete records | No | No | Yes |
| Manage users | No | No | Yes |

## Deployment (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add all env variables from `.env.example` in Vercel project settings.
4. Deploy.

Vercel routes all traffic to `api/index.ts`, which mounts the Express app.

## Quick Endpoint List
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users`
- `PUT /api/users/:id`
- `GET /api/records`
- `POST /api/records`
- `PUT /api/records/:id`
- `DELETE /api/records/:id`
- `GET /api/dashboard/summary`
- `GET /metrics`
- `GET /docs`
- `GET /api-docs`
