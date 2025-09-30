import { config as loadDotenv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    N8N_BASE_URL: z.string().url(),
    N8N_WEBHOOK_CAMPAIGN_SEND: z.string().url(),
    N8N_WEBHOOK_WHATSAPP_REPLY: z.string().url(),
    N8N_WEBHOOK_BILLING: z.string().url().optional(),
    N8N_WEBHOOK_HEALTH: z.string().url(),
    META_APP_ID: z.string().min(1),
    META_APP_SECRET: z.string().min(1),
    META_REDIRECT_URI: z.string().url(),
    META_LONG_LIVED_TOKEN_SECRET: z.string().min(32, 'Expected strong encryption secret'),
    WHATSAPP_BASE_URL: z.string().url(),
    WHATSAPP_TOKEN: z.string().min(1),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
    STRIPE_PUBLIC_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    WEBHOOK_SECRET_STRIPE: z.string().min(1),
    REDIS_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    JWT_SIGNING_KEY: z.string().min(32, 'JWT signing key must be 32+ chars'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    QUEUE_PREFIX: z.string().optional(),
    FEATURE_TIKTOK_ENABLED: z.coerce.boolean().default(false),
    RATE_LIMIT_MAX: z.coerce.number().positive().optional(),
    RATE_LIMIT_TIME_WINDOW_MS: z.coerce.number().positive().optional()
  })
  .transform((env) => ({
    ...env,
    featureFlags: {
      tiktok: env.FEATURE_TIKTOK_ENABLED
    },
    rateLimit: {
      max: env.RATE_LIMIT_MAX ?? 100,
      timeWindowMs: env.RATE_LIMIT_TIME_WINDOW_MS ?? 60_000
    }
  }));

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function loadEnv(overrides: Record<string, string | undefined> = {}): AppEnv {
  if (cachedEnv && Object.keys(overrides).length === 0) {
    return cachedEnv;
  }

  const nodeEnv = process.env.NODE_ENV ?? overrides.NODE_ENV ?? 'development';
  const envFile = path.resolve(process.cwd(), `.env.${nodeEnv}`);

  if (fs.existsSync(envFile)) {
    loadDotenv({ path: envFile });
  }

  loadDotenv();

  const input = {
    ...process.env,
    ...overrides,
    NODE_ENV: (overrides.NODE_ENV ?? process.env.NODE_ENV ?? 'development').toLowerCase()
  };

  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    console.error('❌ Invalid environment configuration', formatted);
    throw new Error('Invalid environment variables');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
