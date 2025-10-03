import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

export async function registerAffiliateRoutes(app: FastifyInstance) {
  const affiliateService = app.container.resolve(TOKENS.affiliateService);

  app.get('/api/affiliate/profile', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const profile = await affiliateService.getProfile(auth.userId);
    reply.send({ profile });
  });

  app.post('/api/affiliate/profile', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const body = z
      .object({
        displayName: z.string().optional(),
        payoutMethod: z.string().optional(),
        payoutDetails: z.record(z.any()).optional(),
        plan: z.string().optional()
      })
      .parse(request.body ?? {});

    const profile = await affiliateService.upsertProfile({
      user_id: auth.userId,
      display_name: body.displayName,
      payout_method: body.payoutMethod,
      payout_details: body.payoutDetails,
      plan: body.plan ?? 'basic'
    } as any);

    reply.send(profile);
  });

  app.get('/api/affiliate/campaigns', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const campaigns = await affiliateService.listCampaigns(auth.userId);
    reply.send({ data: campaigns });
  });

  app.post('/api/affiliate/campaigns', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const body = z
      .object({
        name: z.string().min(3),
        description: z.string().optional(),
        offer: z.record(z.any()).optional(),
        channels: z.array(z.string()).optional(),
        budget: z.number().optional(),
        scheduledAt: z.string().datetime().optional()
      })
      .parse(request.body ?? {});

    const campaign = await affiliateService.createCampaign(auth.userId, {
      name: body.name,
      description: body.description,
      offer: body.offer,
      channels: body.channels,
      budget: body.budget,
      scheduled_at: body.scheduledAt
    });

    reply.status(201).send(campaign);
  });

  app.patch('/api/affiliate/campaigns/:campaignId', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const body = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        offer: z.record(z.any()).optional(),
        status: z.string().optional(),
        channels: z.array(z.string()).optional()
      })
      .parse(request.body ?? {});

    const campaign = await affiliateService.updateCampaign(auth.userId, params.campaignId, body as any);
    reply.send(campaign);
  });

  app.post('/api/affiliate/campaigns/:campaignId/banner', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const body = z.object({ prompt: z.string() }).parse(request.body ?? {});
    const asset = await affiliateService.generateBanner(auth.userId, params.campaignId, body.prompt);
    reply.send(asset);
  });

  app.post('/api/affiliate/campaigns/:campaignId/publish', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);
    const body = z.object({ channels: z.array(z.string()).default([]), traceId: z.string().optional() }).parse(request.body ?? {});
    const result = await affiliateService.enqueuePublish(auth.userId, params.campaignId, body);
    reply.send(result);
  });
}
