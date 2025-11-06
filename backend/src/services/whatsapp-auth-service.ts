import { AppEnv } from '@config/env';
import { PostgresRepository } from '@repositories/postgres-repository';
import { N8nClient } from '@clients/n8n-client';
import { ApplicationError } from '@core/errors';
import { generateId } from '@utils/ids';
import crypto from 'node:crypto';

export class WhatsAppAuthService {
  constructor(
    private readonly env: AppEnv,
    private readonly repository: PostgresRepository,
    private readonly n8nClient: N8nClient
  ) {}

  /**
   * Inicia processo de autenticação via WhatsApp
   * Gera token de verificação e retorna URL do WhatsApp
   */
  async initiateAuth(params: { whatsappNumber: string; planCode: string; planName: string }): Promise<{
    verificationToken: string;
    whatsappUrl: string;
  }> {
    const verificationToken = this.generateVerificationToken();
    const cleanNumber = this.cleanPhoneNumber(params.whatsappNumber);

    // Verificar se já existe tenant com este número
    const existingTenant = await this.repository.getTenantByWhatsApp(cleanNumber);

    if (existingTenant) {
      // Se já existe e está verificado, retornar erro
      if (existingTenant.whatsapp_verified) {
        throw new ApplicationError('WhatsApp number already registered and verified', 400);
      }

      // Se existe mas não verificado, atualizar token
      await this.repository.updateTenantWhatsApp(existingTenant.id, {
        whatsapp_verification_token: verificationToken,
      });
    } else {
      // Criar novo tenant pendente
      const slug = `user-${cleanNumber.slice(-8)}`;
      const tenantId = generateId();

      await this.repository.insertTenant({
        id: tenantId,
        slug,
        name: `User ${cleanNumber}`,
        category: 'commerce',
        address: {},
        phone: cleanNumber,
        whatsappNumber: cleanNumber
      });

      await this.repository.updateTenantWhatsAppAuth(tenantId, {
        whatsapp_number: cleanNumber,
        whatsapp_verified: false,
        whatsapp_verification_token: verificationToken
      });

      // Criar subscription pendente
      await this.repository.createSubscription({
        tenant_id: tenantId,
        plan_code: params.planCode,
        plan_name: params.planName,
        status: 'pending',
        payment_provider: 'mercadopago',
        payment_provider_id: '',
      });
    }

    const message = `🔐 *Código de Verificação*\n\nSeu código: *${verificationToken}*\n\nPlano: ${params.planName}\n\nResponda esta mensagem com seu código para confirmar.`;

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    return {
      verificationToken,
      whatsappUrl,
    };
  }

  /**
   * Webhook chamado quando usuário responde no WhatsApp
   * Valida o token e ativa a conta
   */
  async handleWhatsAppReply(params: { whatsappNumber: string; message: string }): Promise<{
    success: boolean;
    tenantId?: string;
    error?: string;
  }> {
    const cleanNumber = this.cleanPhoneNumber(params.whatsappNumber);
    const tenant = await this.repository.getTenantByWhatsApp(cleanNumber);

    if (!tenant) {
      return {
        success: false,
        error: 'Number not found. Please start authentication process first.',
      };
    }

    if (tenant.whatsapp_verified) {
      return {
        success: false,
        error: 'Number already verified.',
      };
    }

    // Extrair código da mensagem (aceita apenas números e remove espaços)
    const codeInMessage = params.message.replace(/\D/g, '');

    if (codeInMessage === tenant.whatsapp_verification_token) {
      // Token válido - ativar conta
      await this.repository.updateTenantWhatsApp(tenant.id, {
        whatsapp_verified: true,
        whatsapp_verification_token: null,
      });

      // Notificar N8N para enviar mensagem de boas-vindas
      if (this.env.N8N_WEBHOOK_WHATSAPP_AUTH) {
        await this.n8nClient.sendWebhook(this.env.N8N_WEBHOOK_WHATSAPP_AUTH, {
          event: 'whatsapp_verified',
          tenant_id: tenant.id,
          whatsapp_number: cleanNumber,
        });
      }

      return {
        success: true,
        tenantId: tenant.id,
      };
    }

    return {
      success: false,
      error: 'Invalid verification code.',
    };
  }

  /**
   * Verifica se um número WhatsApp já está autenticado
   */
  async checkAuth(whatsappNumber: string): Promise<{
    authenticated: boolean;
    tenantId?: string;
    hasActiveSubscription?: boolean;
  }> {
    const cleanNumber = this.cleanPhoneNumber(whatsappNumber);
    const tenant = await this.repository.getTenantByWhatsApp(cleanNumber);

    if (!tenant || !tenant.whatsapp_verified) {
      return { authenticated: false };
    }

    // Verificar subscription ativa
    const subscription = await this.repository.getPlanSubscription(tenant.id);

    return {
      authenticated: true,
      tenantId: tenant.id,
      hasActiveSubscription: !!subscription && subscription.status === 'active',
    };
  }

  private generateVerificationToken(): string {
    // Gera código de 6 dígitos
    return crypto.randomInt(100000, 999999).toString();
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Se começa com 55 (Brasil), manter
    // Senão, adicionar 55
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }
}
