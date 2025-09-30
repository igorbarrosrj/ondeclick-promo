import { buildApp } from './app';
import { getBackendContainer } from '@adapters/next/container';
import { TOKENS } from '@core/tokens';
import { startTelemetry, stopTelemetry } from '@config/index';

async function bootstrap() {
  const container = getBackendContainer();
  const env = container.resolve(TOKENS.env);
  const redis = container.resolve(TOKENS.redis);

  await startTelemetry(env);

  const app = await buildApp(container);

  const close = async () => {
    await app.close();
    await redis.quit();
    await stopTelemetry();
    process.exit(0);
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
