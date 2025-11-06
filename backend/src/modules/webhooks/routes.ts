import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';

export async function registerWebhookRoutes(app: FastifyInstance) {
  const leadService = app.container.resolve(TOKENS.leadService);

  app.post('/api/webhooks/whatsapp/reply', async (request, reply) => {
    const body = z
      .object({
        tenantId: z.string().uuid(),
        lead: z
          .object({
            name: z.string().optional(),
            phone: z.string(),
            leadId: z.string().uuid().optional(),
            campaignId: z.string().uuid().optional()
          })
          .passthrough(),
        message: z.record(z.any()).optional()
      })
      .parse(request.body ?? {});

    await leadService.recordInboundReply(body.tenantId, {
      id: body.lead.leadId,
      contact: body.lead.phone,
      name: body.lead.name,
      source_campaign_id: body.lead.campaignId
    });

    reply.send({ ok: true });
  });
}
