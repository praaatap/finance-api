import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import logger from './logger';

type SetMode = 'EX';

interface IRedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: SetMode, ttlSeconds?: number): Promise<unknown>;
    del(key: string): Promise<number>;
}

class UpstashRedisAdapter implements IRedisClient {
    private client: UpstashRedis;

    constructor(url: string, token: string) {
        this.client = new UpstashRedis({ url, token });
    }

    async get(key: string): Promise<string | null> {
        const value = await this.client.get<string>(key);
        if (value === null || value === undefined) return null;
        return typeof value === 'string' ? value : JSON.stringify(value);
    }

    async set(key: string, value: string, mode?: SetMode, ttlSeconds?: number): Promise<unknown> {
        if (mode === 'EX' && typeof ttlSeconds === 'number') {
            return this.client.set(key, value, { ex: ttlSeconds });
        }

        return this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }
}

const createRedisClient = (): IRedisClient => {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (restUrl && restToken) {
        logger.info('Using Upstash Redis REST client');
        return new UpstashRedisAdapter(restUrl, restToken);
    }

    // Local dev fallback uses a standard Redis URL.
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const redis = new Redis(redisUrl, {
        // Keep app resilient during temporary network issues.
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 100, 2000),
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    redis.on('connect', () => {
        logger.info('Connected to Redis');
    });

    redis.on('error', (err) => {
        logger.error(`Redis Error: ${err.message}`);
    });

    return redis as unknown as IRedisClient;
};

const redis = createRedisClient();

export default redis;
