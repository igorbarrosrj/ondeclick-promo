import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from './errors';
import { AuthenticatedRequestContext } from './context';

export function extractAuthContext(request: FastifyRequest): AuthenticatedRequestContext {
  const userId = request.headers['x-user-id'] as string | undefined;
  const tenantId = request.headers['x-tenant-id'] as string | undefined;
  const rolesHeader = (request.headers['x-roles'] as string | undefined) ?? '';

  if (!userId || !tenantId) {
    throw new UnauthorizedError('Missing authentication headers');
  }

  const roles = rolesHeader.split(',').map((role) => role.trim()).filter(Boolean);

  const requestId = request.id ?? 'unknown';

  return {
    requestId,
    userId,
    tenantId,
    roles
  };
}
