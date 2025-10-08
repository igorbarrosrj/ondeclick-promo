import { FastifyReply, FastifyRequest } from 'fastify';
import { extractAuthContext } from '@core/auth';
import { ApplicationError } from '@core/errors';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    request.auth = extractAuthContext(request);
  } catch (error) {
    const err = error as ApplicationError;
    await reply.status(err.statusCode ?? 401).send({ message: err.message });
    return reply;
  }
}

export function assertRole(request: FastifyRequest, roles: string[]) {
  const auth = request.auth;
  if (!auth) {
    throw new ApplicationError('Unauthorized', 401);
  }

  const hasRole = auth.roles?.some((role) => roles.includes(role));
  if (!hasRole) {
    throw new ApplicationError('Forbidden', 403);
  }
}
