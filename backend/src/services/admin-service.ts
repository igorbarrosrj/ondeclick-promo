import { SupabaseRepository } from '@repositories/supabase-repository';
import { SupportMessage, UUID } from '@types/database';

export class AdminService {
  constructor(private readonly repository: SupabaseRepository) {}

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
