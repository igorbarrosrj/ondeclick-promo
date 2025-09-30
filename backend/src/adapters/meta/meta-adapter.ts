import { CircuitBreaker } from '@utils/circuit-breaker';
import { withRetry } from '@utils/retry';
import { AppEnv } from '@config/env';

export interface MetaOAuthTokens {
  accessToken: string;
  userId: string;
  expiresIn: number;
}

export interface MetaCampaignPayload {
  tenantId: string;
  campaignId: string;
  name: string;
  objective: 'OUTCOME_TRAFFIC' | 'OUTCOME_MESSAGES';
  dailyBudget?: number;
  pageId?: string;
  adAccountId: string;
  creative: {
    primaryText: string;
    headline: string;
    imageUrl?: string;
  };
  targeting?: Record<string, unknown>;
}

export interface MetaPublishResult {
  campaignId: string;
  adSetId: string;
  creativeId: string;
  adId: string;
}

const GRAPH_API_VERSION = 'v21.0';

export class MetaAdapter {
  private readonly baseUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
  private readonly circuitBreaker = new CircuitBreaker();

  constructor(private readonly env: AppEnv) {}

  getOAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: this.env.META_APP_ID,
      redirect_uri: this.env.META_REDIRECT_URI,
      state,
      scope: 'pages_read_engagement,pages_manage_metadata,ads_management,pages_messaging'
    });

    return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<MetaOAuthTokens> {
    const params = new URLSearchParams({
      client_id: this.env.META_APP_ID,
      redirect_uri: this.env.META_REDIRECT_URI,
      client_secret: this.env.META_APP_SECRET,
      code
    });

    const response = await withRetry(() => fetch(`${this.baseUrl}/oauth/access_token?${params.toString()}`));

    if (!response.ok) {
      throw new Error('Failed to exchange Meta authorization code');
    }

    const json = (await response.json()) as {
      access_token: string;
      user_id: string;
      expires_in: number;
    };

    return {
      accessToken: json.access_token,
      userId: json.user_id,
      expiresIn: json.expires_in
    };
  }

  async debugToken(accessToken: string) {
    const params = new URLSearchParams({
      input_token: accessToken,
      access_token: `${this.env.META_APP_ID}|${this.env.META_APP_SECRET}`
    });

    const response = await fetch(`${this.baseUrl}/debug_token?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to validate Meta token');
    }

    return response.json();
  }

  async publishCampaign(payload: MetaCampaignPayload, accessToken: string): Promise<MetaPublishResult> {
    return this.circuitBreaker.exec(async () => {
      const campaignId = await this.createCampaign(payload, accessToken);
      const adSetId = await this.createAdSet(payload, campaignId, accessToken);
      const creativeId = await this.createCreative(payload, accessToken);
      const adId = await this.createAd(payload, campaignId, adSetId, creativeId, accessToken);

      return {
        campaignId,
        adSetId,
        creativeId,
        adId
      };
    });
  }

  private async createCampaign(payload: MetaCampaignPayload, accessToken: string) {
    const url = `${this.baseUrl}/act_${payload.adAccountId}/campaigns`;
    const body = new URLSearchParams({
      name: payload.name,
      objective: payload.objective,
      status: 'PAUSED',
      special_ad_categories: 'NONE'
    });

    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Meta campaign creation failed: ${error}`);
    }

    const json = (await response.json()) as { id: string };
    return json.id;
  }

  private async createAdSet(payload: MetaCampaignPayload, campaignId: string, accessToken: string) {
    const url = `${this.baseUrl}/act_${payload.adAccountId}/adsets`;
    const body = new URLSearchParams({
      name: `${payload.name} - AdSet`,
      campaign_id: campaignId,
      daily_budget: Math.round((payload.dailyBudget ?? 20) * 100).toString(),
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      billing_event: 'IMPRESSIONS',
      optimization_goal: payload.objective === 'OUTCOME_MESSAGES' ? 'IMPRESSIONS' : 'LINK_CLICKS',
      status: 'PAUSED'
    });

    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Meta ad set creation failed: ${await response.text()}`);
    }

    const json = (await response.json()) as { id: string };
    return json.id;
  }

  private async createCreative(payload: MetaCampaignPayload, accessToken: string) {
    const url = `${this.baseUrl}/act_${payload.adAccountId}/adcreatives`;

    const creativeData = {
      name: `${payload.name} Creative`,
      object_story_spec: JSON.stringify({
        page_id: payload.pageId,
        link_data: {
          image_hash: undefined,
          message: payload.creative.primaryText,
          link: payload.creative.imageUrl ?? this.env.NEXT_PUBLIC_APP_URL,
          call_to_action: {
            type: 'LEARN_MORE',
            value: {
              link: this.env.NEXT_PUBLIC_APP_URL
            }
          }
        }
      })
    };

    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams(creativeData),
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Meta creative creation failed: ${await response.text()}`);
    }

    const json = (await response.json()) as { id: string };
    return json.id;
  }

  private async createAd(payload: MetaCampaignPayload, campaignId: string, adSetId: string, creativeId: string, accessToken: string) {
    const url = `${this.baseUrl}/act_${payload.adAccountId}/ads`;
    const body = new URLSearchParams({
      name: `${payload.name} - Ad`,
      adset_id: adSetId,
      creative: JSON.stringify({ creative_id: creativeId }),
      status: 'PAUSED',
      campaign_id: campaignId
    });

    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Meta ad creation failed: ${await response.text()}`);
    }

    const json = (await response.json()) as { id: string };
    return json.id;
  }
}
