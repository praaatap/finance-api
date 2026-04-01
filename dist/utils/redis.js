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
const ioredis_1 = __importDefault(require("ioredis"));
const redis_1 = require("@upstash/redis");
const logger_1 = __importDefault(require("./logger"));
class UpstashRedisAdapter {
    constructor(url, token) {
        this.client = new redis_1.Redis({ url, token });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.client.get(key);
            if (value === null || value === undefined)
                return null;
            return typeof value === 'string' ? value : JSON.stringify(value);
        });
    }
    set(key, value, mode, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mode === 'EX' && typeof ttlSeconds === 'number') {
                return this.client.set(key, value, { ex: ttlSeconds });
            }
            return this.client.set(key, value);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.del(key);
        });
    }
}
const createRedisClient = () => {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (restUrl && restToken) {
        logger_1.default.info('Using Upstash Redis REST client');
        return new UpstashRedisAdapter(restUrl, restToken);
    }
    // Local dev fallback uses a standard Redis URL.
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redis = new ioredis_1.default(redisUrl, {
        // Keep app resilient during temporary network issues.
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 100, 2000),
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });
    redis.on('connect', () => {
        logger_1.default.info('Connected to Redis');
    });
    redis.on('error', (err) => {
        logger_1.default.error(`Redis Error: ${err.message}`);
    });
    return redis;
};
const redis = createRedisClient();
exports.default = redis;
