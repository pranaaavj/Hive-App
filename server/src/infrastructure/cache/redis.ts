// src/infrastructure/cache/redis.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export class RedisClient {
  public client: Redis | null;

  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });

      this.client.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.client = null;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });
    } catch (err) {
      console.error('Failed to initialize Redis:', err);
      this.client = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      console.warn('Redis unavailable, skipping get operation');
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  async setEx(key: string, value: string, ttl: number): Promise<void> {
    if (!this.client) {
      console.warn('Redis unavailable, skipping setEx operation');
      return;
    }
    try {
      await this.client.setex(key, ttl, value);
    } catch (err) {
      console.error('Redis setEx error:', err);
    }
  }
}
