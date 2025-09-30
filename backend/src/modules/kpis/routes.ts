import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '@modules/auth/auth-hooks';
import { TOKENS } from '@core/tokens';

export async function registerKpiRoutes(app: FastifyInstance) {
  const kpiService = app.container.resolve(TOKENS.kpiService);

  app.get('/api/kpis/tenant', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const data = await kpiService.getTenantKpis(auth.tenantId);
    reply.send({ data });
  });

  app.get('/api/kpis/campaign/:campaignId', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const data = await kpiService.getCampaignKpis(params.campaignId);
    reply.send({ data });
  });
}
