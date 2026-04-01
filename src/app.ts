import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { metricsMiddleware, collectDefaultMetrics } from './utils/metrics';
import client from 'prom-client';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import recordRoutes from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware);

collectDefaultMetrics();
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Swagger API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { url: '/api-docs' } }));
app.get('/api-docs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Default Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Zorvyn Finance API is running', docs: '/docs' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
