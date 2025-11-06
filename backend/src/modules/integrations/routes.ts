import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

export async function registerIntegrationRoutes(app: FastifyInstance) {
  const integrationService = app.container.resolve(TOKENS.integrationService);
  const openAiService = app.container.resolve(TOKENS.openAiService);

  app.get('/api/integrations/meta/oauth-url', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const state = `${auth.tenantId}:${Date.now()}`;
    const url = integrationService.getMetaOAuthUrl(state);
    reply.send({ url, state });
  });

  app.get('/api/integrations/meta/callback', async (request, reply) => {
    const query = z.object({ code: z.string(), state: z.string() }).parse(request.query);
    const [tenantId] = query.state.split(':');

    const result = await integrationService.handleMetaCallback(tenantId, query.code);
    reply.send({ ok: true, integration: result });
  });

  app.get('/api/integrations/meta/status', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const status = await integrationService.getMetaStatus(auth.tenantId);
    reply.send(status);
  });

  app.post('/api/integrations/meta/test', { preHandler: requireAuth }, async (_request, reply) => {
    reply.send({ ok: true });
  });

  app.post('/api/integrations/whatsapp/connect', { preHandler: requireAuth }, async (request, reply) => {
    const body = z.record(z.any()).parse(request.body ?? {});
    const auth = request.auth!;
    const integration = await integrationService.connectWhatsApp(auth.tenantId, body);
    reply.send(integration);
  });

  app.get('/api/integrations/whatsapp/status', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const status = await integrationService.getWhatsAppStatus(auth.tenantId);
    reply.send(status);
  });

  app.post('/api/integrations/whatsapp/test-message', { preHandler: requireAuth }, async (request, reply) => {
    const body = z
      .object({
        audience: z.array(
          z.object({
            name: z.string().optional(),
            phone: z.string(),
            leadId: z.string().optional()
          })
        ),
        message: z.string()
      })
      .parse(request.body ?? {});

    const auth = request.auth!;
    await integrationService.sendWhatsAppTest(auth.tenantId, { audience: body.audience, message: body.message });
    reply.send({ ok: true });
  });

  app.get('/api/integrations/n8n/status', { preHandler: requireAuth }, async (_request, reply) => {
    const ok = await integrationService.healthcheck();
    reply.send({ ok });
  });

  app.post('/api/integrations/openai/test', { preHandler: requireAuth }, async (request, reply) => {
    const body = z
      .object({
        tenantName: z.string(),
        offer: z.record(z.any()),
        tone: z.enum(['direct', 'friendly', 'promotional']).optional()
      })
      .parse(request.body ?? {});

    const copy = await openAiService.generateCampaignCopy(body);
    reply.send(copy);
  });
}
