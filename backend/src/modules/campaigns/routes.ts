import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { NotFoundError } from '@core/errors';
import { requireAuth } from '@modules/auth/auth-hooks';

const campaignSchema = z.object({
  name: z.string().min(3),
  channels: z.array(z.enum(['meta', 'whatsapp', 'tiktok'])).nonempty(),
  offer: z.record(z.any()),
  geo: z.record(z.any()).optional(),
  budgetDaily: z.number().min(0).optional(),
  schedule: z
    .object({
      startAt: z.string().datetime().optional(),
      endAt: z.string().datetime().optional()
    })
    .optional()
});

export async function registerCampaignRoutes(app: FastifyInstance) {
  const campaignService = app.container.resolve(TOKENS.campaignService);

  app.get('/api/campaigns', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const campaigns = await campaignService.list(auth.tenantId);
    reply.send({ data: campaigns });
  });

  app.post('/api/campaigns', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const body = campaignSchema.parse(request.body);

    const campaign = await campaignService.create(auth.tenantId, body);
    reply.code(201).send(campaign);
  });

  app.get('/api/campaigns/:campaignId', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const auth = request.auth!;

    const campaign = await campaignService.get(auth.tenantId, params.campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    reply.send(campaign);
  });

  app.patch('/api/campaigns/:campaignId', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const body = campaignSchema.partial().parse(request.body ?? {});
    const auth = request.auth!;

    const campaign = await campaignService.update(auth.tenantId, params.campaignId, body);
    reply.send(campaign);
  });

  app.post('/api/campaigns/:campaignId/prepare', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const auth = request.auth!;

    const result = await campaignService.prepare(auth.tenantId, params.campaignId);
    reply.send(result);
  });

  app.post('/api/campaigns/:campaignId/publish', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const bodySchema = z.object({ accessToken: z.string().optional() });
    const body = bodySchema.parse(request.body ?? {});
    const auth = request.auth!;

    const result = await campaignService.publish(auth.tenantId, params.campaignId, body);
    reply.send(result);
  });

  app.post('/api/campaigns/:campaignId/pause', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const auth = request.auth!;

    await campaignService.pause(auth.tenantId, params.campaignId);
    reply.send({ status: 'paused' });
  });

  app.post('/api/campaigns/:campaignId/end', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const auth = request.auth!;

    await campaignService.end(auth.tenantId, params.campaignId);
    reply.send({ status: 'ended' });
  });
}
