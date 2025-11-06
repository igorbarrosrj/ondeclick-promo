import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

export async function registerLeadRoutes(app: FastifyInstance) {
  const leadService = app.container.resolve(TOKENS.leadService);

  app.get('/api/leads', { preHandler: requireAuth }, async (request, reply) => {
    const querySchema = z.object({
      status: z.string().optional(),
      channel: z.string().optional(),
      campaignId: z.string().uuid().optional()
    });
    const filters = querySchema.parse(request.query);
    const auth = request.auth!;

    const leads = await leadService.list(auth.tenantId, filters);
    reply.send({ data: leads });
  });

  app.patch('/api/leads/:leadId', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ leadId: z.string().uuid() }).parse(request.params);
    const body = z.object({
      status: z.enum(['new', 'responded', 'purchased', 'ignored']).optional(),
      tags: z.array(z.string()).optional()
    }).parse(request.body ?? {});

    const auth = request.auth!;
    const lead = await leadService.updateLead(auth.tenantId, params.leadId, body);
    reply.send(lead);
  });

  app.post('/api/leads/reengage', { preHandler: requireAuth }, async (request, reply) => {
    const body = z
      .object({
        campaignId: z.string().uuid().optional(),
        tags: z.array(z.string()).optional()
      })
      .parse(request.body ?? {});

    const auth = request.auth!;
    await leadService.reengage(auth.tenantId, body);
    reply.send({ status: 'queued' });
  });
}
