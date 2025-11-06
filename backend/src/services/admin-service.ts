import { PostgresRepository } from '@repositories/postgres-repository';
import type { UUID, SupportMessage } from '../types/database';

export class AdminService {
  constructor(private readonly repository: PostgresRepository) {}

  getTenantSummaries() {
    return this.repository.getAdminTenantSummaries();
  }

  listSupportMessages(filters: { tenantId?: UUID; status?: string }) {
    return this.repository.listSupportMessages(filters);
  }

  async replyToSupportMessage(payload: Omit<SupportMessage, 'id' | 'created_at'> & { id?: UUID }) {
    return this.repository.upsertSupportMessage(payload);
  }
}
