import Redis from 'ioredis';
import { AppEnv } from './env';

export type RedisClient = Redis;

export function createRedisClient(env: AppEnv): RedisClient {
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });

  redis.on('error', (err) => {
    console.error('Redis error', err);
  });

  return redis;
}
