import { FastifyInstance } from 'fastify';
import { requireAuth } from './auth-hooks';
import { TOKENS } from '@core/tokens';

export async function registerAuthRoutes(app: FastifyInstance) {
  const repository = app.container.resolve(TOKENS.supabaseRepository);

  app.get('/api/me', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const memberships = await repository.getMembershipsByUser(auth.userId);
    reply.send({
      userId: auth.userId,
      memberships
    });
  });
}
