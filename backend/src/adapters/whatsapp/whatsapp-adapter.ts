import { AppEnv } from '@config/env';
import { N8nClient } from '@clients/n8n-client';
import { withRetry } from '@utils/retry';

export interface WhatsAppAudienceMember extends Record<string, unknown> {
  name?: string;
  phone: string;
  leadId?: string;
}

export interface WhatsAppMessage extends Record<string, unknown> {
  text: string;
  buttons?: Array<{ label: string; payload: string }>;
  mediaUrl?: string;
}

export class WhatsAppAdapter {
  constructor(private readonly env: AppEnv, private readonly n8nClient: N8nClient) {}

  async sendCampaignMessage(options: {
    tenantId: string;
    campaignId: string;
    message: WhatsAppMessage;
    audience: WhatsAppAudienceMember[];
    traceId: string;
  }) {
    await withRetry(
      () =>
        this.n8nClient.sendCampaign({
          tenantId: options.tenantId,
          campaignId: options.campaignId,
          channel: 'whatsapp',
          message: options.message,
          audience: options.audience,
          traceId: options.traceId
        }),
      { retries: 3 }
    );
  }
}
