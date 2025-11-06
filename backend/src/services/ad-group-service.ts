import { AppEnv } from '@config/env';
import { PostgresRepository } from '@repositories/postgres-repository';
import { N8nClient } from '@clients/n8n-client';
import { ApplicationError } from '@core/errors';

export class AdGroupService {
  constructor(
    private readonly env: AppEnv,
    private readonly repository: PostgresRepository,
    private readonly n8nClient: N8nClient
  ) {}

  /**
   * Cria um grupo de anúncio automaticamente ao criar uma campanha
   * Dispara webhook N8N para criar o grupo no WhatsApp
   */
  async createAdGroupForCampaign(params: {
    tenantId: string;
    campaignId: string;
    campaignName: string;
  }): Promise<{
    adGroupId: string;
    status: 'creating' | 'error';
  }> {
    // Buscar informações do tenant para pegar o WhatsApp
    const tenant = await this.repository.getTenantById(params.tenantId);

    if (!tenant) {
      throw new ApplicationError('Tenant not found', 404);
    }

    if (!tenant.whatsapp_number) {
      throw new ApplicationError('Tenant does not have WhatsApp configured', 400);
    }

    // Criar registro do grupo de anúncio
    const adGroup = await this.repository.createAdGroup({
      tenant_id: params.tenantId,
      campaign_id: params.campaignId,
      name: `Grupo - ${params.campaignName}`,
      description: `Grupo de anúncios automático para a campanha: ${params.campaignName}`,
    });

    // Disparar webhook N8N para criar grupo no WhatsApp
    if (this.env.N8N_WEBHOOK_CREATE_AD_GROUP) {
      try {
        await this.n8nClient.sendWebhook(this.env.N8N_WEBHOOK_CREATE_AD_GROUP, {
          ad_group_id: adGroup.id,
          tenant_id: params.tenantId,
          campaign_id: params.campaignId,
          campaign_name: params.campaignName,
          whatsapp_number: tenant.whatsapp_number,
          tenant_name: tenant.name,
        });
      } catch (error) {
        // Se falhar ao chamar N8N, marcar como erro
        await this.repository.updateAdGroup(adGroup.id, { status: 'creating' });
        console.error('Failed to trigger ad group creation webhook:', error);
      }
    }

    return {
      adGroupId: adGroup.id,
      status: 'creating',
    };
  }

  /**
   * Webhook chamado pelo N8N quando o grupo é criado no WhatsApp
   */
  async handleGroupCreated(params: {
    adGroupId: string;
    whatsappGroupId: string;
    inviteLink: string;
  }): Promise<void> {
    await this.repository.updateAdGroup(params.adGroupId, {
      whatsapp_group_id: params.whatsappGroupId,
      whatsapp_group_invite_link: params.inviteLink,
      status: 'active',
    });
  }

  /**
   * Adiciona um cliente ao grupo de anúncio via WhatsApp
   */
  async addCustomerToGroup(params: {
    tenantId: string;
    adGroupId: string;
    customerWhatsApp: string;
    customerName?: string;
  }): Promise<void> {
    // Buscar informações do grupo
    const adGroup = await this.repository.getAdGroup(params.tenantId, params.adGroupId);

    if (!adGroup || !adGroup.whatsapp_group_id) {
      throw new ApplicationError('Ad group not found or not active', 404);
    }

    // Enviar para N8N adicionar ao grupo
    if (this.env.N8N_WEBHOOK_CREATE_AD_GROUP) {
      await this.n8nClient.sendWebhook(this.env.N8N_WEBHOOK_CREATE_AD_GROUP, {
        action: 'add_participant',
        whatsapp_group_id: adGroup.whatsapp_group_id,
        participant_number: params.customerWhatsApp,
        participant_name: params.customerName,
      });
    }
  }

  /**
   * Lista grupos de anúncio de uma campanha
   */
  async getAdGroupsByCampaign(campaignId: string): Promise<any[]> {
    return await this.repository.getAdGroupsByCampaign(campaignId);
  }

  /**
   * Obtém link de convite do grupo
   */
  async getGroupInviteLink(tenantId: string, adGroupId: string): Promise<string | null> {
    const adGroup = await this.repository.getAdGroup(tenantId, adGroupId);
    return adGroup?.whatsapp_group_invite_link || null;
  }
}
