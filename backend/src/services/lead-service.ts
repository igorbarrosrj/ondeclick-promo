import { QueueService } from '@queues/queue-service';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { NotFoundError } from '@core/errors';
import { Lead, UUID } from 'database';

export interface LeadFilters {
  status?: string;
  channel?: string;
  campaignId?: string;
}

export class LeadService {
  constructor(private readonly repository: SupabaseRepository, private readonly queues: QueueService) {}

  list(tenantId: UUID, filters: LeadFilters) {
    return this.repository.listLeads(tenantId, filters);
  }

  async updateLead(tenantId: UUID, leadId: UUID, patch: Partial<Lead>) {
    return this.repository.updateLead(tenantId, leadId, patch);
  }

  async recordInboundReply(tenantId: UUID, payload: Partial<Lead> & { contact: string }) {
    const lead = await this.repository.recordLead({
      tenant_id: tenantId,
      contact: payload.contact,
      name: payload.name,
      channel: payload.channel ?? 'whatsapp',
      status: 'responded',
      tags: payload.tags,
      source_campaign_id: payload.source_campaign_id ?? null
    });

    await this.repository.insertEvent({
      tenant_id: tenantId,
      lead_id: lead.id,
      campaign_id: payload.source_campaign_id ?? null,
      channel: lead.channel,
      type: 'reply',
      payload: { source: 'whatsapp-webhook' }
    });

    return lead;
  }

  async reengage(tenantId: UUID, filters: { tags?: string[]; campaignId?: string }) {
    await this.queues.enqueueReengage({
      tenantId,
      tags: filters.tags,
      campaignId: filters.campaignId
    });
  }
}
