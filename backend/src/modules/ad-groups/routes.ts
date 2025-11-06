import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

export async function registerAdGroupRoutes(app: FastifyInstance) {
  // Criar grupo de anúncio para campanha
  app.post('/api/ad-groups/create', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const body = z
      .object({
        campaignId: z.string().uuid(),
        campaignName: z.string(),
      })
      .parse(request.body);

    const adGroupService = app.container.resolve(TOKENS.adGroupService);
    const result = await adGroupService.createAdGroupForCampaign({
      tenantId: auth.tenantId,
      campaignId: body.campaignId,
      campaignName: body.campaignName,
    });

    reply.send(result);
  });

  // Webhook: grupo criado no WhatsApp
  app.post('/api/ad-groups/webhook/created', async (request, reply) => {
    const body = z
      .object({
        adGroupId: z.string().uuid(),
        whatsappGroupId: z.string(),
        inviteLink: z.string().url(),
      })
      .parse(request.body);

    const adGroupService = app.container.resolve(TOKENS.adGroupService);
    await adGroupService.handleGroupCreated({
      adGroupId: body.adGroupId,
      whatsappGroupId: body.whatsappGroupId,
      inviteLink: body.inviteLink,
    });

    reply.send({ ok: true });
  });

  // Adicionar cliente ao grupo
  app.post('/api/ad-groups/:adGroupId/add-customer', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ adGroupId: z.string().uuid() }).parse(request.params);
    const body = z
      .object({
        customerWhatsApp: z.string(),
        customerName: z.string().optional(),
      })
      .parse(request.body);
    const auth = request.auth!;

    const adGroupService = app.container.resolve(TOKENS.adGroupService);
    await adGroupService.addCustomerToGroup({
      tenantId: auth.tenantId,
      adGroupId: params.adGroupId,
      customerWhatsApp: body.customerWhatsApp,
      customerName: body.customerName,
    });

    reply.send({ ok: true });
  });

  // Listar grupos de uma campanha
  app.get('/api/ad-groups/campaign/:campaignId', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ campaignId: z.string().uuid() }).parse(request.params);

    const adGroupService = app.container.resolve(TOKENS.adGroupService);
    const groups = await adGroupService.getAdGroupsByCampaign(params.campaignId);

    reply.send(groups);
  });

  // Obter link de convite do grupo
  app.get('/api/ad-groups/:adGroupId/invite-link', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({ adGroupId: z.string().uuid() }).parse(request.params);
    const auth = request.auth!;

    const adGroupService = app.container.resolve(TOKENS.adGroupService);
    const inviteLink = await adGroupService.getGroupInviteLink(auth.tenantId, params.adGroupId);

    reply.send({ inviteLink });
  });
}
