import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

export const restResponseTimeHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = restResponseTimeHistogram.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });
  });
  next();
};

export const collectDefaultMetrics = client.collectDefaultMetrics;
