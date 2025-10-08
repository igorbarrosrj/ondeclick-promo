import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth, assertRole } from '@modules/auth/auth-hooks';

export async function registerAdminRoutes(app: FastifyInstance) {
  const adminService = app.container.resolve(TOKENS.adminService);

  app.get('/api/admin/tenants', { preHandler: requireAuth }, async (request, reply) => {
    assertRole(request, ['owner', 'admin']);
    const data = await adminService.getTenantSummaries();
    reply.send({ data });
  });

  app.get('/api/admin/support-messages', { preHandler: requireAuth }, async (request, reply) => {
    assertRole(request, ['owner', 'admin']);
    const querySchema = z.object({ tenantId: z.string().uuid().optional(), status: z.string().optional() });
    const filters = querySchema.parse(request.query ?? {});
    const messages = await adminService.listSupportMessages(filters);
    reply.send({ data: messages });
  });

  app.post('/api/admin/support-messages', { preHandler: requireAuth }, async (request, reply) => {
    assertRole(request, ['owner', 'admin']);
    const bodySchema = z.object({
      id: z.string().uuid().optional(),
      tenantId: z.string().uuid(),
      userId: z.string().uuid().optional(),
      subject: z.string().optional(),
      body: z.string(),
      status: z.enum(['open', 'pending', 'closed']).optional()
    });
    const body = bodySchema.parse(request.body ?? {});
    const message = await adminService.replyToSupportMessage({
      id: body.id,
      tenant_id: body.tenantId,
      user_id: body.userId,
      subject: body.subject,
      body: body.body,
      status: body.status ?? 'open',
      sender_type: 'admin'
    } as any);
    reply.status(201).send(message);
  });
}
