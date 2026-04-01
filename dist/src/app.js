"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./utils/swagger");
const error_middleware_1 = require("./middlewares/error.middleware");
const metrics_1 = require("./utils/metrics");
const prom_client_1 = __importDefault(require("prom-client"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const record_routes_1 = __importDefault(require("./routes/record.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ credentials: true, origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(metrics_1.metricsMiddleware);
(0, metrics_1.collectDefaultMetrics)();
app.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set('Content-Type', prom_client_1.default.register.contentType);
    res.send(yield prom_client_1.default.register.metrics());
}));
// Swagger API Documentation
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, { swaggerOptions: { url: '/api-docs' } }));
app.get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
// Default Route
app.get('/', (req, res) => {
    res.json({ message: 'Zorvyn Finance API is running', docs: '/docs' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/records', record_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Error Handling Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
