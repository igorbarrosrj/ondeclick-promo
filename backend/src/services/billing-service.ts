import Stripe from 'stripe';
import { AppEnv } from '@config/env';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { N8nClient } from '@clients/n8n-client';
import { ApplicationError } from '@core/errors';

export class BillingService {
  private readonly stripe: Stripe;

  constructor(private readonly env: AppEnv, private readonly repository: SupabaseRepository, private readonly n8nClient: N8nClient) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    });
  }

  async createCheckoutSession(params: {
    tenantId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      metadata: {
        tenantId: params.tenantId
      }
    });

    return session.url;
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    const portal = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return portal.url;
  }

  async handleWebhook(signature: string | undefined, payload: Buffer) {
    if (!signature) {
      throw new ApplicationError('Missing Stripe signature', 400);
    }

    const event = this.stripe.webhooks.constructEvent(payload, signature, this.env.WEBHOOK_SECRET_STRIPE);

    switch (event.type) {
      case 'invoice.paid':
      case 'customer.subscription.updated':
        await this.n8nClient.notifyBilling({ event: event.type, data: event.data.object });
        break;
      case 'usage_record.summary.updated':
        // no-op for now
        break;
      default:
        break;
    }

    return { received: true };
  }

  async recordUsage(params: {
    tenantId: string;
    metric: string;
    value: number;
    periodStart: string;
    periodEnd: string;
  }) {
    await this.repository.incrementUsage({
      tenant_id: params.tenantId,
      metric: params.metric,
      value: params.value,
      period_start: params.periodStart,
      period_end: params.periodEnd
    });
  }
}
