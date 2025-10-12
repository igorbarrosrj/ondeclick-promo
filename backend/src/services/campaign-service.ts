import { QueueService } from '@queues/queue-service';
import { QUEUE_META_PUBLISH, QUEUE_WHATSAPP_SEND } from '@queues/queue-names';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { OpenAIService } from './openai-service';
import { ApplicationError, NotFoundError } from '@core/errors';
import { Campaign, CampaignStatus, UUID } from '@types/database';

export interface CreateCampaignDto {
  name: string;
  channels: string[];
  offer: Record<string, unknown>;
  geo?: Record<string, unknown>;
  budgetDaily?: number;
  schedule?: { startAt?: string; endAt?: string };
}

export class CampaignService {
  constructor(
    private readonly repository: SupabaseRepository,
    private readonly queues: QueueService,
    private readonly openai: OpenAIService
  ) {}

  list(tenantId: UUID) {
    return this.repository.listCampaigns(tenantId);
  }

  get(tenantId: UUID, campaignId: UUID) {
    return this.repository.getCampaignById(tenantId, campaignId);
  }

  async create(tenantId: UUID, input: CreateCampaignDto) {
    if (!input.channels.length) {
      throw new ApplicationError('At least one channel must be selected', 422);
    }

    return this.repository.insertCampaign({
      tenant_id: tenantId,
      name: input.name,
      channels: input.channels,
      offer: input.offer,
      geo: input.geo ?? null,
      budget_daily: input.budgetDaily ?? null,
      schedule: input.schedule ?? null
    });
  }

  async prepare(tenantId: UUID, campaignId: UUID) {
    const campaign = await this.repository.getCampaignById(tenantId, campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const copy = await this.openai.generateCampaignCopy({
      tenantName: 'Cliente',
      offer: campaign.offer ?? {},
      tone: 'promotional'
    });

    const variant = await this.repository.insertCopyVariant({
      tenant_id: tenantId,
      campaign_id: campaignId,
      tone: 'promotional',
      content: copy.primaryText,
      score: null
    });

    if (campaign.channels.includes('meta')) {
      const imageUrl = await this.openai.generateImage({
        prompt: `Imagem promocional da campanha ${campaign.name}`
      });
      await this.repository.insertAsset({
        tenant_id: tenantId,
        campaign_id: campaignId,
        type: 'image',
        source: 'ai',
        url: imageUrl,
        meta: { generatedAt: new Date().toISOString() }
      });
    }

    return {
      campaign,
      variant
    };
  }

  async publish(tenantId: UUID, campaignId: UUID, options: { accessToken?: string }) {
    const campaign = await this.repository.getCampaignById(tenantId, campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    await this.repository.updateCampaign(campaignId, tenantId, {
      status: (campaign.schedule?.startAt ?? null) ? 'scheduled' : 'active'
    });

    if (campaign.channels.includes('meta')) {
      if (!options.accessToken) {
        throw new ApplicationError('Meta access token is required', 422);
      }

      await this.queues.enqueueMetaPublish({
        tenantId,
        campaignId,
        channels: campaign.channels
      });
    }

    if (campaign.channels.includes('whatsapp')) {
      await this.queues.enqueueWhatsAppSend({
        tenantId,
        campaignId,
        audience: []
      });
    }

    return { status: 'enqueued' };
  }

  async pause(tenantId: UUID, campaignId: UUID) {
    await this.updateStatus(tenantId, campaignId, 'paused');
  }

  async end(tenantId: UUID, campaignId: UUID) {
    await this.updateStatus(tenantId, campaignId, 'ended');
  }

  async update(tenantId: UUID, campaignId: UUID, patch: Partial<CreateCampaignDto> & { status?: CampaignStatus }) {
    return this.repository.updateCampaign(campaignId, tenantId, {
      name: patch.name,
      channels: patch.channels,
      offer: patch.offer,
      geo: patch.geo,
      schedule: patch.schedule,
      budget_daily: patch.budgetDaily,
      status: patch.status
    } as Partial<Campaign>);
  }

  private async updateStatus(tenantId: UUID, campaignId: UUID, status: CampaignStatus) {
    const campaign = await this.repository.getCampaignById(tenantId, campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    await this.repository.updateCampaign(campaignId, tenantId, { status });
  }
}
