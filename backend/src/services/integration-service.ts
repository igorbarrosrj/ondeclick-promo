import { randomUUID } from 'node:crypto';
import { AppEnv } from '@config/env';
import { encrypt } from '@utils/crypto';
import { PostgresRepository } from '@repositories/postgres-repository';
import { MetaAdapter } from '@adapters/meta/meta-adapter';
import { WhatsAppAdapter, WhatsAppAudienceMember } from '@adapters/whatsapp/whatsapp-adapter';
import { N8nClient } from '@clients/n8n-client';
import { NotFoundError } from '@core/errors';
import type { UUID, Campaign, CampaignStatus, Lead, LeadStatus, EventType } from '../types/database';

export class IntegrationService {
  constructor(
    private readonly repository: PostgresRepository,
    private readonly metaAdapter: MetaAdapter,
    private readonly whatsappAdapter: WhatsAppAdapter,
    private readonly n8nClient: N8nClient,
    private readonly env: AppEnv
  ) {}

  getMetaOAuthUrl(state: string) {
    return this.metaAdapter.getOAuthUrl(state);
  }

  async handleMetaCallback(tenantId: UUID, code: string): Promise<Integration> {
    const tokens = await this.metaAdapter.exchangeCodeForToken(code);
    const encrypted = encrypt(this.env.META_LONG_LIVED_TOKEN_SECRET, JSON.stringify(tokens));

    const existing = await this.repository.getIntegration(tenantId);

    const integration = await this.repository.upsertIntegration(tenantId, {
      id: existing?.id,
      tenant_id: tenantId,
      meta_connected: true,
      meta_access_token_enc: JSON.stringify(encrypted),
      meta_payload: {
        userId: tokens.userId,
        updatedAt: new Date().toISOString()
      }
    });

    return integration;
  }

  async getMetaStatus(tenantId: UUID) {
    const integration = await this.repository.getIntegration(tenantId);
    if (!integration) {
      throw new NotFoundError('Integration setup not found');
    }

    return {
      connected: integration.meta_connected,
      payload: integration.meta_payload
    };
  }

  async connectWhatsApp(tenantId: UUID, payload: Record<string, unknown>) {
    const existing = await this.repository.getIntegration(tenantId);
    const integration = await this.repository.upsertIntegration(tenantId, {
      id: existing?.id,
      tenant_id: tenantId,
      whatsapp_connected: true,
      whatsapp_payload: payload
    });

    return integration;
  }

  async getWhatsAppStatus(tenantId: UUID) {
    const integration = await this.repository.getIntegration(tenantId);
    if (!integration) {
      throw new NotFoundError('Integration setup not found');
    }

    return {
      connected: integration.whatsapp_connected,
      payload: integration.whatsapp_payload
    };
  }

  async sendWhatsAppTest(tenantId: UUID, payload: { audience: WhatsAppAudienceMember[]; message: string }) {
    await this.whatsappAdapter.sendCampaignMessage({
      tenantId,
      campaignId: 'test',
      message: { text: payload.message },
      audience: payload.audience,
      traceId: randomUUID()
    });
  }

  async healthcheck() {
    return this.n8nClient.healthcheck();
  }
}
