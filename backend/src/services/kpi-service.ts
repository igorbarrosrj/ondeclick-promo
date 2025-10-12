import { SupabaseRepository } from '@repositories/supabase-repository';
import { UUID } from 'database';

export class KpiService {
  constructor(private readonly repository: SupabaseRepository) {}

  getTenantKpis(tenantId: UUID) {
    return this.repository.getTenantKpis(tenantId);
  }

  getCampaignKpis(campaignId: UUID) {
    return this.repository.getCampaignKpis(campaignId);
  }
}
