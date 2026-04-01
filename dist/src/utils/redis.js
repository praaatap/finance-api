"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("./logger"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new ioredis_1.default(redisUrl);
redis.on('connect', () => {
    logger_1.default.info('Connected to Redis');
});
redis.on('error', (err) => {
    logger_1.default.error(`Redis Error: ${err.message}`);
});
exports.default = redis;
