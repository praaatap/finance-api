# Zorvyn Finance Backend - Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL or Neon
- Redis

### Setup
1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   ```bash
   cp .env.example .env
   ```

3. Set up database
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start development server
   ```bash
   npm run dev
   ```

## Vercel Deployment

### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Using GitHub Integration
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (e.g., Neon)
- `REDIS_URL` - Redis instance URL
- `JWT_SECRET` - Secret key for JWT signing
- `REFRESH_SECRET` - Secret for refresh tokens
- `CLIENT_URL` - Frontend URL (for CORS)
- `API_URL` - API base URL

### Database on Neon
1. Create account on [neon.tech](https://neon.tech)
2. Create a PostgreSQL project
3. Copy connection string to `DATABASE_URL`

### Redis on Upstash or Heroku
1. Create Redis instance
2. Copy connection URL to `REDIS_URL`

## API Documentation
After deployment, access API docs at:
- **Swagger UI**: `https://your-api.vercel.app/docs`
- **OpenAPI JSON**: `https://your-api.vercel.app/api-docs`
- **Prometheus Metrics**: `https://your-api.vercel.app/metrics`

## Monitoring
- Use Grafana to visualize Prometheus metrics
- Logs are stored in Winston and available in Vercel dashboard
