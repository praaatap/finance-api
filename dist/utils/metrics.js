"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDefaultMetrics = exports.metricsMiddleware = exports.restResponseTimeHistogram = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.restResponseTimeHistogram = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});
const metricsMiddleware = (req, res, next) => {
    const end = exports.restResponseTimeHistogram.startTimer();
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode,
        });
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
exports.collectDefaultMetrics = prom_client_1.default.collectDefaultMetrics;
