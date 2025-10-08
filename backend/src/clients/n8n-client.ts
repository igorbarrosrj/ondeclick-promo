import { AppEnv } from '@config/env';
import { withRetry } from '@utils/retry';

export interface N8nWebhookPayload {
  tenantId: string;
  campaignId?: string;
  channel: string;
  message: Record<string, unknown>;
  audience?: Array<Record<string, unknown>>;
  traceId?: string;
}

export class N8nClient {
  constructor(private readonly env: AppEnv) {}

  async sendCampaign(payload: N8nWebhookPayload) {
    return this.post(this.env.N8N_WEBHOOK_CAMPAIGN_SEND, payload);
  }

  async notifyWhatsAppReply(payload: Record<string, unknown>) {
    return this.post(this.env.N8N_WEBHOOK_WHATSAPP_REPLY, payload);
  }

  async notifyBilling(payload: Record<string, unknown>) {
    if (!this.env.N8N_WEBHOOK_BILLING) return;
    await this.post(this.env.N8N_WEBHOOK_BILLING, payload);
  }

  async healthcheck() {
    const response = await fetch(this.env.N8N_WEBHOOK_HEALTH, { method: 'GET' });
    return response.ok;
  }

  async sendWebhook(url: string, payload: Record<string, unknown>) {
    return this.post(url, payload);
  }

  private async post(url: string, body: unknown) {
    return withRetry(
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`n8n webhook failed ${response.status}`);
        }
      },
      { retries: 3 }
    );
  }
}
