import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  address: z.record(z.any()).optional(),
  phone: z.string().optional()
});

const updateTenantSchema = createTenantSchema.partial().extend({
  brandColor: z.string().optional()
});

export async function registerTenantRoutes(app: FastifyInstance) {
  const tenantService = app.container.resolve(TOKENS.tenantService);

  app.get('/api/tenants/:slug/public', async (request, reply) => {
    const paramsSchema = z.object({ slug: z.string() });
    const { slug } = paramsSchema.parse(request.params);

    const profile = await tenantService.getPublicProfileBySlug(slug);
    reply.send(profile);
  });

  app.post('/api/tenants', { preHandler: requireAuth }, async (request, reply) => {
    const body = createTenantSchema.parse(request.body);
    const auth = request.auth!;

    const tenant = await tenantService.createTenant(body, auth.userId);
    reply.code(201).send(tenant);
  });

  app.patch('/api/tenants/:tenantId', { preHandler: requireAuth }, async (request, reply) => {
    const paramsSchema = z.object({ tenantId: z.string().uuid() });
    const { tenantId } = paramsSchema.parse(request.params);
    const body = updateTenantSchema.parse(request.body ?? {});

    const tenant = await tenantService.updateTenant(tenantId, body);
    reply.send(tenant);
  });

  app.get('/api/marketplace', async (request, reply) => {
    const querySchema = z.object({
      category: z.string().optional(),
      city: z.string().optional()
    });

    const filters = querySchema.parse(request.query);
    const tenants = await tenantService.listMarketplaceTenants(filters);
    reply.send({ data: tenants });
  });
}
