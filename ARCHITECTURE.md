# Zorvyn Finance Backend - Architecture

## 1) System Overview

```text
Client (Web/Mobile)
    |
    v
Express API (TypeScript)
    |-- Routes + Middlewares (auth, validation, errors)
    |-- Controllers (HTTP orchestration)
    |-- Services (business logic)
    |-- Utils (JWT, Redis, logging, metrics, swagger)
    |
    +--> PostgreSQL (Neon) via Prisma
    +--> Redis (Upstash) for cache + refresh sessions
    +--> Prometheus metrics endpoint (/metrics)
    +--> Swagger/OpenAPI endpoints (/docs, /api-docs)
```

## 2) Layered Design

### Routes
- Define endpoint paths and attach middleware chain.
- Keep route files focused on protocol-level behavior.

### Middlewares
- `auth.middleware.ts`: verifies bearer token and role checks.
- `validate.middleware.ts`: Zod request validation.
- `error.middleware.ts`: centralized error formatting + logging.

### Controllers
- Parse request context and call service methods.
- Return HTTP response status and payload.
- No direct business-heavy logic.

### Services
- Core business logic and security rules.
- Access Prisma for data persistence.
- Manage caching and refresh-session lifecycle.

### Data and Infra
- Prisma for SQL data operations.
- Upstash Redis for caching summary and refresh token sessions.
- Prometheus metrics + Winston logs for operability.

## 3) Request Lifecycle

```text
Request -> CORS -> JSON parser -> cookies -> metrics -> route -> auth/validation
        -> controller -> service -> prisma/redis -> response -> error middleware
```

## 4) Authentication Flow

```text
POST /api/auth/login
  -> validate body (email/password)
  -> find user + compare hash
  -> issue access token (short TTL)
  -> issue refresh token (long TTL)
  -> store refresh token in Redis key: refresh_token:{userId}
  -> send tokens (response + cookies)

POST /api/auth/refresh
  -> verify refresh token
  -> compare with Redis stored token
  -> rotate tokens and update Redis
  -> return new access token (+ refresh token)
```

## 5) Caching Strategy
- Key: `dashboard_summary`
- Read path: `GET /api/dashboard/summary` checks Redis first.
- Invalidate on mutations:
  - `POST /api/records`
  - `PUT /api/records/:id`
  - `DELETE /api/records/:id`

## 6) Data Model (Logical)

### User
- `id`, `email`, `password`
- `role`: `VIEWER | ANALYST | ADMIN`
- `status`: `ACTIVE | INACTIVE`
- timestamps

### Record
- `id`, `amount`, `type` (`INCOME | EXPENSE`), `category`
- `date`, `notes`, `userId`
- timestamps

## 7) Deployment Architecture (Vercel)

```text
Vercel route /(.*) -> api/index.ts -> Express app
                      |
                      +--> Neon Postgres (DATABASE_URL)
                      +--> Upstash Redis (REDIS_URL rediss://...)
```

Required Vercel env vars:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `REFRESH_SECRET`
- `CLIENT_URL`
- `API_URL`
- `NODE_ENV=production`

## 8) Observability
- Metrics: `/metrics` (Prometheus format)
- API docs: `/docs` and `/api-docs`
- Logs: Winston console/file transports

## 9) Security Controls
- JWT bearer auth
- Role-based authorization
- Input validation with Zod
- Password hashing with bcrypt
- HttpOnly cookies for tokens
- CORS restrictions

## ??? Project File Structure

```
zorvyn-backend-assignment/
�
+-- ?? src/                           # Source code
�   +-- ?? controllers/               # Request handlers (thin layer)
�   �   +-- auth.controller.ts        # Auth endpoints (register, login, refresh)
�   �   +-- user.controller.ts        # User management endpoints
�   �   +-- record.controller.ts      # Record CRUD endpoints
�   �   +-- dashboard.controller.ts   # Dashboard summary endpoint
�   �
�   +-- ?? services/                  # Business logic (thick layer)
�   �   +-- auth.service.ts           # Auth logic + JWT + Redis
�   �   +-- user.service.ts           # User business rules
�   �   +-- record.service.ts         # Record CRUD logic + cache invalidation
�   �   +-- dashboard.service.ts      # Dashboard aggregation + caching
�   �   +-- index.ts                  # Service exports
�   �   +-- (Services handle Prisma queries)
�   �
�   +-- ?? routes/                    # API route definitions + Swagger docs
�   �   +-- auth.routes.ts            # /api/auth/* routes
�   �   +-- user.routes.ts            # /api/users/* routes
�   �   +-- record.routes.ts          # /api/records/* routes
�   �   +-- dashboard.routes.ts       # /api/dashboard/* routes
�   �
�   +-- ?? middlewares/               # Express middleware
�   �   +-- auth.middleware.ts        # JWT verification + role authorization
�   �   +-- validate.middleware.ts    # Zod schema validation
�   �   +-- error.middleware.ts       # Global error handler + logging
�   �
�   +-- ?? types/                     # TypeScript type definitions
�   �   +-- index.ts                  # All interfaces (IUser, IRecord, etc.)
�   �                                  # Single source of truth for types
�   �
�   +-- ?? utils/                     # Helper utilities
�   �   +-- prisma.ts                 # Prisma Client singleton
�   �   +-- redis.ts                  # Redis Client + connection
�   �   +-- jwt.ts                    # Token generation + Redis storage
�   �   +-- logger.ts                 # Winston Logger instance
�   �   +-- metrics.ts                # Prometheus middleware + setup
�   �   +-- schemas.ts                # Zod validation schemas
�   �   +-- swagger.ts                # Swagger/OpenAPI spec definition
�   �
�   +-- app.ts                        # Express app setup + middleware mounting
�   +-- server.ts                     # Entry point (listen + startup)
�
+-- ?? prisma/                        # Prisma ORM configuration
�   +-- schema.prisma                 # Database schema + migrations
�   +-- ?? migrations/               # Auto-generated SQL migration files
�
+-- ?? dist/                          # Compiled JavaScript (generated by tsc)
�   +-- (mirrors src/ structure)
�   +-- (created when you run: npm run build)
�
+-- ?? logs/                          # Winston log files (auto-created)
�   +-- error.log                     # Error logs only
�   +-- all.log                       # All logs
�
+-- ?? api/                           # Vercel serverless handler
�   +-- index.ts                      # Entry point for Vercel deployment
�
+-- ?? node_modules/                  # Dependencies (1000s of files)
�
+-- ?? package.json                   # Dependencies + scripts
+-- ?? package-lock.json              # Exact dependency versions
+-- ?? tsconfig.json                  # TypeScript compiler config
+-- ?? .env                           # Local environment variables (NOT in git)
+-- ?? .env.example                   # Template for .env
+-- ?? .gitignore                     # Files to ignore in git
+-- ?? vercel.json                    # Vercel deployment config
+-- ?? README.md                      # Main documentation
+-- ?? ARCHITECTURE.md                # This file
+-- ?? DEPLOYMENT.md                  # Deployment guide
+-- ?? prisma.config.ts              # Prisma configuration
```

## ?? Authentication & Authorization Flow

```
+---------------------------------------------------------------------+
� USER REGISTERS / LOGIN                                              �
+---------------------------------------------------------------------+
              �
              ?
    +---------------------+
    � authService.login() �
    � - Find user in DB   �
    � - Compare password  �
    � - Generate tokens   �
    +---------------------+
              �
              ?
    +------------------------------------------+
    � Create JWT accessToken (expires 15 min) �
    � Create JWT refreshToken (expires 30 day)�
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � Store refreshToken in Redis              �
    � Key: "refresh_token:{userId}"            �
    � Value: {refreshToken}                    �
    � TTL: 30 days                             �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � Return to client:                        �
    � - accessToken (in response body)         �
    � - refreshToken (in httpOnly cookie)      �
    � - User info { _id, email, role }         �
    +------------------------------------------+


+---------------------------------------------------------------------+
� SUBSEQUENT REQUESTS (with accessToken)                              �
+---------------------------------------------------------------------+
              �
              ?
    +------------------------------------------+
    � Client sends:                            �
    � Authorization: Bearer {accessToken}      �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � protect middleware:                      �
    � - Extract token from header              �
    � - Verify JWT signature                   �
    � - Decode payload { id, role }            �
    � - Query user from DB                     �
    � - Check if user is ACTIVE                �
    � - Attach user to req.user                �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � authorize middleware:                    �
    � - Check req.user.role                    �
    � - Verify against allowed roles           �
    � - Return 403 if unauthorized             �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � Controller executes                      �
    � Service layer has user context           �
    � Returns response                         �
    +------------------------------------------+


+---------------------------------------------------------------------+
� REFRESH TOKEN FLOW (when accessToken expires)                       �
+---------------------------------------------------------------------+
              �
              ?
    +------------------------------------------+
    � POST /api/auth/refresh                   �
    � { refreshToken }                         �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � authService.refreshAccessToken()         �
    � - Verify refresh token signature         �
    � - Check if token exists in Redis         �
    � - Verify stored token matches             �
    � - Check user still exists & is ACTIVE    �
    +------------------------------------------+
              �
              ?
    +------------------------------------------+
    � Create new accessToken + refreshToken    �
    � Update Redis with new refreshToken       �
    � Return both to client                    �
    +------------------------------------------+
```

## ?? Caching Strategy

```
+------------------------------------------------------------+
� REQUEST: GET /api/dashboard/summary                        �
+----------------------------------------------------------+
             �
             ?
     +--------------------------------------+
     � dashboardService.getSummary()        �
     +--------------------------------------+
                    �
                    ?
          +---------------------+
          � Check Redis cache   �
          � Key: "dashboard_    �
          � summary"            �
          +---------------------+
                     �
          +------------------------+
          �                        �
          ? HIT                   ? MISS
     +----------+          +-----------------+
     � Return   �          � Query Prisma:   �
     � cached   �          � - All records    �
     � data     �          � - Calculate sum �
     �          �          � - Group by cat. �
     �          �          � - Get recent    �
     +----------+          +-----------------+
                                    �
                                    ?
                            +------------------+
                            � Store in Redis   �
                            � TTL: 3600 sec    �
                            � (1 hour)         �
                            +------------------+
                                    �
                                    ?
                            +------------------+
                            � Return to client �
                            +------------------+


+------------------------------------------------------------+
� CACHE INVALIDATION                                         �
+----------------------------------------------------------+
             �
    +--------+---------------------+
    �        �        �            �
    ?        ?        ?            ?
POST       PUT      DELETE     Any Record
Create     Update    Delete     Mutation
Record     Record    Record
    �        �        �            �
    +--------+--------+------------+
             �
             ?
    +--------------------------+
    � recordService triggers:  �
    � redis.del(               �
    �   "dashboard_summary"    �
    � )                        �
    +--------------------------+
             �
             ?
    +--------------------------+
    � Next request for         �
    � dashboard will:          �
    � - Miss cache             �
    � - Recalculate from DB    �
    � - Cache new result       �
    +--------------------------+
```

## ?? API Response Examples

### Authentication
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

RESPONSE 201:
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "VIEWER",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Request
```json
GET /api/dashboard/summary
Headers: Authorization: Bearer {accessToken}

RESPONSE 200:
{
  "totalIncome": 15000.50,
  "totalExpenses": 5200.25,
  "netBalance": 9800.25,
  "categoryTotals": {
    "salary": 15000.50,
    "groceries": 1200.00,
    "utilities": 450.25
  },
  "recentActivity": [
    {
      "id": "uuid",
      "amount": 5000,
      "type": "INCOME",
      "category": "bonus",
      "date": "2026-04-01T10:30:00.000Z"
    }
  ]
}
```

## ??? Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express.js | Web server framework |
| **Language** | TypeScript | Type-safe JavaScript |
| **Database** | PostgreSQL | Primary data store |
| **Database Driver** | Prisma ORM | Type-safe database access |
| **Cache** | Redis | Session + dashboard cache |
| **Auth** | JWT + bcrypt | Authentication & hashing |
| **Validation** | Zod | Input validation |
| **Logging** | Winston | Structured logging |
| **Monitoring** | Prometheus | Metrics collection |
| **API Docs** | Swagger/OpenAPI | Interactive documentation |
| **Deployment** | Vercel | Serverless hosting |
| **Version Control** | Git | Code management |

## ?? Deployment Architecture

```
+------------------------------------------------------+
� DEVELOPMENT MACHINE                                  �
� - npm run dev                                        �
� - Port: 5000                                         �
� - Database: Local PostgreSQL or Neon Dev Branch     �
� - Redis: Local Docker or Upstash                    �
+------------------------------------------------------+
                     � git push
                     ?
+------------------------------------------------------+
� GITHUB REPOSITORY                                    �
� - Connected to Vercel                                �
� - Main branch deploys to production                  �
+------------------------------------------------------+
                     � Auto-deploy
                     ?
+------------------------------------------------------+
� VERCEL PLATFORMS (Build & Deploy)                    �
� - npm run build ? tsc compilation                   �
� - Output: dist/ folder                              �
� - Runtime: Node.js 18.x                             �
+------------------------------------------------------+
                     �
        +------------------------+
        �                        �
        ?                        ?
+---------------+        +---------------+
� Edge Network  �        � Compute Nodes �
� (CDN)         �        � (Serverless)  �
+---------------+        +---------------+
                                  �
                    +-------------+--------------+
                    �             �              �
                    ?             ?              ?
            +----------+  +----------+  +----------+
            � Neon PG  �  � Upstash  �  � Logs &   �
            � Database �  � Redis    �  � Metrics  �
            +----------+  +----------+  +----------+ 

API Accessible at: https://zorvyn-backend.vercel.app
```

