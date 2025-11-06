import { AppEnv } from '@config/env';
import { PostgresRepository } from '@repositories/postgres-repository';
import { N8nClient } from '@clients/n8n-client';
import { ApplicationError } from '@core/errors';
import { fetch } from 'undici';

interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  metadata?: Record<string, any>;
  notification_url?: string;
}

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
  metadata?: Record<string, any>;
  transaction_amount: number;
  date_approved?: string;
  payer?: {
    email?: string;
    phone?: {
      number?: string;
    };
  };
}

export class MercadoPagoService {
  private readonly baseUrl = 'https://api.mercadopago.com';

  constructor(
    private readonly env: AppEnv,
    private readonly repository: PostgresRepository,
    private readonly n8nClient: N8nClient
  ) {}

  private get accessToken(): string {
    if (!this.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new ApplicationError('MercadoPago access token not configured', 500);
    }
    return this.env.MERCADOPAGO_ACCESS_TOKEN;
  }

  async createPreference(params: {
    tenantId: string;
    planCode: string;
    planName: string;
    price: number;
    successUrl: string;
    failureUrl: string;
    pendingUrl?: string;
  }): Promise<{ preferenceId: string; initPoint: string }> {
    const preference: MercadoPagoPreference = {
      items: [
        {
          title: params.planName,
          quantity: 1,
          unit_price: params.price,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: params.successUrl,
        failure: params.failureUrl,
        pending: params.pendingUrl || params.successUrl,
      },
      auto_return: 'approved',
      external_reference: params.tenantId,
      metadata: {
        tenant_id: params.tenantId,
        plan_code: params.planCode,
        plan_name: params.planName,
      },
      notification_url: this.env.N8N_WEBHOOK_MERCADOPAGO,
    };

    const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApplicationError(`MercadoPago API error: ${error}`, response.status);
    }

    const data = (await response.json()) as { id: string; init_point: string };

    // Criar subscription pendente
    await this.repository.createSubscription({
      tenant_id: params.tenantId,
      plan_code: params.planCode,
      plan_name: params.planName,
      status: 'pending',
      payment_provider: 'mercadopago',
      payment_provider_id: data.id,
      payment_provider_data: { preference_id: data.id },
    });

    return {
      preferenceId: data.id,
      initPoint: data.init_point,
    };
  }

  async handleWebhook(body: any): Promise<void> {
    // MercadoPago envia notificações em formato específico
    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await this.getPayment(paymentId);

      if (payment.status === 'approved') {
        const tenantId = payment.external_reference || payment.metadata?.tenant_id;

        if (!tenantId) {
          throw new ApplicationError('Payment without tenant reference', 400);
        }

        // Atualizar subscription para ativa
        await this.repository.updateSubscriptionByTenantId(tenantId, {
          status: 'active',
          payment_provider_data: {
            payment_id: payment.id,
            payer_email: payment.payer?.email,
            payer_phone: payment.payer?.phone?.number,
            approved_at: payment.date_approved,
          },
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        });

        // Notificar N8N
        if (this.env.N8N_WEBHOOK_BILLING) {
          await this.n8nClient.notifyBilling({
            event: 'payment.approved',
            data: {
              tenant_id: tenantId,
              payment_id: payment.id,
              amount: payment.transaction_amount,
              status: payment.status,
            },
          });
        }
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        const tenantId = payment.external_reference || payment.metadata?.tenant_id;

        if (tenantId) {
          await this.repository.updateSubscriptionByTenantId(tenantId, {
            status: 'canceled',
          });
        }
      }
    }
  }

  private async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApplicationError(`Failed to get payment: ${error}`, response.status);
    }

    return (await response.json()) as MercadoPagoPayment;
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
    // MercadoPago usa x-signature header
    // Implementar verificação se necessário
    // Por enquanto retorna true
    return true;
  }
}
