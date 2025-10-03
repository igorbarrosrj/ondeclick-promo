import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import underPressure from '@fastify/under-pressure';
import rawBody from 'fastify-raw-body';
import { Container } from '@core/container';
import { TOKENS } from '@core/tokens';
import { ApplicationError } from '@core/errors';
import { registerTenantRoutes } from '@modules/tenants/routes';
import { registerAuthRoutes } from '@modules/auth/routes';
import { registerCampaignRoutes } from '@modules/campaigns/routes';
import { registerLeadRoutes } from '@modules/leads/routes';
import { registerIntegrationRoutes } from '@modules/integrations/routes';
import { registerKpiRoutes } from '@modules/kpis/routes';
import { registerBillingRoutes } from '@modules/billing/routes';
import { registerWebhookRoutes } from '@modules/webhooks/routes';
import { registerAdminRoutes } from '@modules/admin/routes';
import { registerAffiliateRoutes } from '@modules/affiliates/routes';

export async function buildApp(container: Container) {
  const env = container.resolve(TOKENS.env);
  const logger = container.resolve(TOKENS.logger);

  const app = Fastify({
    logger,
    disableRequestLogging: env.NODE_ENV === 'production'
  });

  app.decorate('container', container);

  await app.register(rawBody, { field: 'rawBody', global: false, encoding: false, runFirst: true });
  await app.register(cors, {
    origin: env.NEXT_PUBLIC_APP_URL,
    credentials: true
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: env.rateLimit.max,
    timeWindow: env.rateLimit.timeWindowMs
  });
  await app.register(sensible);
  await app.register(underPressure, {
    maxEventLoopDelay: 2000,
    healthCheck: async () => ({ status: 'ok' })
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApplicationError) {
      request.log.warn({ err: error }, 'Application error');
      reply.status(error.statusCode).send({ message: error.message, details: error.details });
      return;
    }

    if (error.validation) {
      reply.status(422).send({ message: 'Validation error', details: error.validation });
      return;
    }

    request.log.error({ err: error }, 'Unhandled error');
    reply.status(500).send({ message: 'Internal server error' });
  });

  app.get('/api/health', async () => ({ status: 'ok' }));

  await app.register(registerAuthRoutes);
  await app.register(registerTenantRoutes);
  await app.register(registerCampaignRoutes);
  await app.register(registerLeadRoutes);
  await app.register(registerIntegrationRoutes);
  await app.register(registerKpiRoutes);
  await app.register(registerBillingRoutes);
  await app.register(registerWebhookRoutes);
  await app.register(registerAdminRoutes);
  await app.register(registerAffiliateRoutes);

  return app;
}
