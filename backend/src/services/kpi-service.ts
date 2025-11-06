import { PostgresRepository } from '@repositories/postgres-repository';
import type { UUID, Campaign, CampaignStatus, Lead, LeadStatus, EventType } from '../types/database';

export class KpiService {
  constructor(private readonly repository: PostgresRepository) {}

  getTenantKpis(tenantId: UUID) {
    return this.repository.getTenantKpis(tenantId);
  }

  getCampaignKpis(campaignId: UUID) {
    return this.repository.getCampaignKpis(campaignId);
  }
}
