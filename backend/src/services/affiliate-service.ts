import { ApplicationError, NotFoundError } from '@core/errors';
import { QueueService } from '@queues/queue-service';
import { QUEUE_META_PUBLISH, QUEUE_WHATSAPP_SEND } from '@queues/queue-names';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { OpenAIService } from '@services/openai-service';
import { AffiliateAsset, AffiliateCampaign, AffiliateProfile, PlanSubscription, UUID } from 'database';

export class AffiliateService {
  constructor(
    private readonly repository: SupabaseRepository,
    private readonly queues: QueueService,
    private readonly openAi: OpenAIService
  ) {}

  getProfile(userId: UUID): Promise<AffiliateProfile | null> {
    return this.repository.getAffiliateProfileByUser(userId);
  }

  upsertProfile(payload: Partial<AffiliateProfile> & { user_id: UUID }) {
    return this.repository.upsertAffiliateProfile(payload);
  }

  getSubscription(affiliateId: UUID): Promise<PlanSubscription | null> {
    return this.repository.getAffiliateSubscription(affiliateId);
  }

  upsertSubscription(payload: Partial<PlanSubscription> & { affiliate_id: UUID }) {
    return this.repository.upsertPlanSubscription(payload);
  }

  createCampaign(affiliateId: UUID, payload: { name: string; description?: string; offer?: Record<string, unknown>; channels?: string[]; budget?: number; scheduled_at?: string }) {
    return this.repository.createAffiliateCampaign({ affiliate_id: affiliateId, ...payload });
  }

  listCampaigns(affiliateId: UUID) {
    return this.repository.listAffiliateCampaigns(affiliateId);
  }

  async updateCampaign(affiliateId: UUID, campaignId: UUID, patch: Partial<AffiliateCampaign>) {
    return this.repository.updateAffiliateCampaign(campaignId, affiliateId, patch);
  }

  listAssets(campaignId: UUID): Promise<AffiliateAsset[]> {
    return this.repository.listAffiliateAssets(campaignId);
  }

  async generateBanner(affiliateId: UUID, campaignId: UUID, prompt: string) {
    const campaign = await this.repository.getAffiliateCampaign(campaignId, affiliateId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const imageUrl = await this.openAi.generateImage({ prompt, size: '1024x1024' });
    return this.repository.insertAffiliateAsset({ affiliate_campaign_id: campaignId, type: 'banner', url: imageUrl });
  }

  async enqueuePublish(affiliateId: UUID, campaignId: UUID, options: { channels: string[]; traceId?: string }) {
    const campaign = await this.repository.getAffiliateCampaign(campaignId, affiliateId);
    const subscription = await this.repository.getAffiliateSubscription(affiliateId);
    if (!subscription || subscription.status !== 'active') {
      throw new ApplicationError('Affiliate plan inactive. Upgrade to publish campaigns.', 402);
    }

    const channels = options.channels ?? campaign.channels ?? [];
    if (channels.includes('meta')) {
      await this.queues.enqueueMetaPublish({
        tenantId: campaign.tenant_id ?? affiliateId,
        campaignId,
        channels,
        affiliateId
      });
    }

    if (channels.includes('whatsapp')) {
      await this.queues.enqueueWhatsAppSend({
        tenantId: campaign.tenant_id ?? affiliateId,
        campaignId,
        audience: [],
        affiliateId
      });
    }

    return { queued: true };
  }
}
