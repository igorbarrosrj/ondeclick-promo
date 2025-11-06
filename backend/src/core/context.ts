import { UUID } from '../types/database';

export interface RequestContext {
  requestId: string;
  userId?: UUID;
  tenantId?: UUID;
  roles?: string[];
}

export interface AuthenticatedRequestContext extends RequestContext {
  userId: UUID;
  tenantId: UUID;
  roles: string[];
}
