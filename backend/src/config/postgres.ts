import { Pool } from 'pg';
import { AppEnv } from './env';

export function createPostgresPool(env: AppEnv): Pool {
  return new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}
