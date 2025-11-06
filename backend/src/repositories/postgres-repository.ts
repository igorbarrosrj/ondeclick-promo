import { Pool, PoolClient } from 'pg';
import { AppEnv } from '@config/env';
import { v4 as uuid } from 'uuid';
import type {
  UUID,
  Campaign,
  CampaignStatus,
  Lead,
  LeadStatus,
  EventType
} from '../types/database';

// Alias for backward compatibility
export type SupabaseRepository = PostgresRepository;

export class PostgresRepository {
  private pool: Pool;

  constructor(env: AppEnv) {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }

  // Tenant methods
  async getTenantBySlug(slug: string) {
    const client = await this.getClient();
    try {
      const result = await client.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getTenantById(id: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query('SELECT * FROM tenants WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async insertTenant(data: {
    id: string;
    slug: string;
    name: string;
    category: string;
    address: Record<string, unknown>;
    phone: string;
  }) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO tenants (id, slug, name, category, address, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.id, data.slug, data.name, data.category, JSON.stringify(data.address), data.phone]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async insertMembership(data: {
    id: string;
    tenant_id: string;
    user_id: string;
    role: string;
  }) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `INSERT INTO memberships (id, tenant_id, user_id, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.id, data.tenant_id, data.user_id, data.role]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateTenant(tenantId: UUID, data: Partial<{
    name: string;
    category: string;
    address: Record<string, unknown>;
    phone: string;
    brand_color: string;
  }>) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(tenantId);

      const result = await client.query(
        `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Campaign methods
  async listCampaigns(tenantId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM campaigns WHERE tenant_id = $1 ORDER BY created_at DESC',
        [tenantId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getCampaignById(tenantId: UUID, campaignId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM campaigns WHERE id = $1 AND tenant_id = $2',
        [campaignId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async insertCampaign(data: Partial<Campaign> & { tenant_id: UUID; name: string; channels: string[] }) {
    const client = await this.getClient();
    try {
      const id = data.id || uuid();
      const result = await client.query(
        `INSERT INTO campaigns (id, tenant_id, name, channels, status, offer, geo, budget_daily, schedule)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.name,
          data.channels,
          data.status || 'draft',
          JSON.stringify(data.offer || {}),
          JSON.stringify(data.geo || null),
          data.budget_daily || null,
          JSON.stringify(data.schedule || null)
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateCampaign(campaignId: UUID, tenantId: UUID, data: Partial<Campaign>) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(campaignId, tenantId);

      const result = await client.query(
        `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Copy Variant methods
  async insertCopyVariant(data: {
    tenant_id: UUID;
    campaign_id: UUID;
    tone?: string;
    content: string;
    score?: number | null;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO copy_variants (id, tenant_id, campaign_id, tone, content, score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, data.tenant_id, data.campaign_id, data.tone || null, data.content, data.score || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getCopyVariants(tenantId: UUID, campaignId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM copy_variants WHERE tenant_id = $1 AND campaign_id = $2',
        [tenantId, campaignId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Asset methods
  async insertAsset(data: {
    tenant_id: UUID;
    campaign_id: UUID;
    type: 'image' | 'video';
    source: 'ai' | 'upload';
    url: string;
    meta: Record<string, unknown>;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO assets (id, tenant_id, campaign_id, type, source, url, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, data.tenant_id, data.campaign_id, data.type, data.source, data.url, JSON.stringify(data.meta)]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getAssets(tenantId: UUID, campaignId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM assets WHERE tenant_id = $1 AND campaign_id = $2',
        [tenantId, campaignId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Lead methods
  async insertLead(data: Partial<Lead> & { tenant_id: UUID; status: LeadStatus }) {
    const client = await this.getClient();
    try {
      const id = data.id || uuid();
      const result = await client.query(
        `INSERT INTO leads (id, tenant_id, name, contact, channel, source_campaign_id, status, tags, last_interaction_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tenant_id, contact) DO UPDATE SET
           name = EXCLUDED.name,
           last_interaction_at = EXCLUDED.last_interaction_at
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.name || null,
          data.contact || null,
          data.channel || null,
          data.source_campaign_id || null,
          data.status,
          data.tags || [],
          data.last_interaction_at || new Date().toISOString()
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getLeadById(tenantId: UUID, leadId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
        [leadId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getLeadByContact(tenantId: UUID, contact: string) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM leads WHERE tenant_id = $1 AND contact = $2',
        [tenantId, contact]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async listLeads(tenantId: UUID, filters?: Record<string, unknown>) {
    const client = await this.getClient();
    try {
      let query = 'SELECT * FROM leads WHERE tenant_id = $1';
      const values: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.channel) {
        query += ` AND channel = $${paramIndex}`;
        values.push(filters.channel);
        paramIndex++;
      }

      if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        values.push(filters.status);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateLead(leadId: UUID, tenantId: UUID, data: Partial<Lead>) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      values.push(leadId, tenantId);

      const result = await client.query(
        `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Event methods
  async insertEvent(data: {
    tenant_id: UUID;
    lead_id?: UUID | null;
    campaign_id?: UUID | null;
    affiliate_campaign_id?: UUID | null;
    affiliate_id?: UUID | null;
    channel?: string | null;
    type: EventType;
    payload?: Record<string, unknown> | null;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO events (id, tenant_id, lead_id, campaign_id, affiliate_campaign_id, affiliate_id, channel, type, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.lead_id || null,
          data.campaign_id || null,
          data.affiliate_campaign_id || null,
          data.affiliate_id || null,
          data.channel || null,
          data.type,
          JSON.stringify(data.payload || null)
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Integration methods
  async getIntegration(tenantId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM integrations WHERE tenant_id = $1',
        [tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async upsertIntegration(data: {
    tenant_id: UUID;
    meta_connected?: boolean;
    meta_payload?: Record<string, unknown> | null;
    meta_access_token_enc?: string | null;
    whatsapp_connected?: boolean;
    whatsapp_payload?: Record<string, unknown> | null;
    tiktok_connected?: boolean;
    tiktok_payload?: Record<string, unknown> | null;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO integrations (id, tenant_id, meta_connected, meta_payload, meta_access_token_enc, whatsapp_connected, whatsapp_payload, tiktok_connected, tiktok_payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tenant_id) DO UPDATE SET
           meta_connected = EXCLUDED.meta_connected,
           meta_payload = EXCLUDED.meta_payload,
           meta_access_token_enc = EXCLUDED.meta_access_token_enc,
           whatsapp_connected = EXCLUDED.whatsapp_connected,
           whatsapp_payload = EXCLUDED.whatsapp_payload,
           tiktok_connected = EXCLUDED.tiktok_connected,
           tiktok_payload = EXCLUDED.tiktok_payload,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.meta_connected || false,
          JSON.stringify(data.meta_payload || null),
          data.meta_access_token_enc || null,
          data.whatsapp_connected || false,
          JSON.stringify(data.whatsapp_payload || null),
          data.tiktok_connected || false,
          JSON.stringify(data.tiktok_payload || null)
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Billing methods
  async recordUsage(data: {
    tenant_id: UUID;
    metric: string;
    value: number;
    period_start: string;
    period_end: string;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO billing_usage (id, tenant_id, metric, value, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (tenant_id, metric, period_start) DO UPDATE SET
           value = billing_usage.value + EXCLUDED.value
         RETURNING *`,
        [id, data.tenant_id, data.metric, data.value, data.period_start, data.period_end]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getPlanSubscription(tenantId: UUID) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM plan_subscriptions WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1',
        [tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async createPlanSubscription(data: {
    tenant_id: string;
    plan_code: string;
    plan_name: string;
    status: string;
    payment_provider: string;
    payment_provider_id: string;
    payment_provider_data?: Record<string, any>;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO plan_subscriptions (id, tenant_id, plan_code, plan_name, status, payment_provider, payment_provider_id, payment_provider_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.plan_code,
          data.plan_name,
          data.status,
          data.payment_provider,
          data.payment_provider_id,
          JSON.stringify(data.payment_provider_data || {})
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updatePlanSubscription(subscriptionId: string, data: {
    status?: string;
    payment_provider_data?: Record<string, any>;
    current_period_end?: string;
  }) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(subscriptionId);

      const result = await client.query(
        `UPDATE plan_subscriptions SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // WhatsApp Auth methods
  async updateTenantWhatsAppAuth(tenantId: string, data: {
    whatsapp_verified?: boolean;
    whatsapp_verification_token?: string;
  }) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(tenantId);

      const result = await client.query(
        `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Ad Group methods
  async createAdGroup(data: {
    tenant_id: string;
    campaign_id: string;
    name: string;
    description?: string;
    whatsapp_group_id?: string;
    whatsapp_group_invite_link?: string;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO ad_groups (id, tenant_id, campaign_id, name, description, whatsapp_group_id, whatsapp_group_invite_link)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.campaign_id,
          data.name,
          data.description || null,
          data.whatsapp_group_id || null,
          data.whatsapp_group_invite_link || null
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getAdGroup(tenantId: string, adGroupId: string) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM ad_groups WHERE id = $1 AND tenant_id = $2',
        [adGroupId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateAdGroup(adGroupId: string, tenantId: string, data: {
    whatsapp_group_id?: string;
    whatsapp_group_invite_link?: string;
    status?: string;
  }) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(adGroupId, tenantId);

      const result = await client.query(
        `UPDATE ad_groups SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAdGroupsByCampaign(campaignId: string) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM ad_groups WHERE campaign_id = $1 ORDER BY created_at DESC',
        [campaignId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getTenantByWhatsApp(whatsappNumber: string) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM tenants WHERE whatsapp_number = $1',
        [whatsappNumber]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateTenantWhatsApp(tenantId: string, data: { whatsapp_verification_token: string }) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        `UPDATE tenants SET whatsapp_verification_token = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [data.whatsapp_verification_token, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async createSubscription(data: {
    tenant_id: string;
    plan_code: string;
    plan_name: string;
    status: string;
  }) {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query(
        `INSERT INTO plan_subscriptions (id, tenant_id, plan_code, plan_name, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, data.tenant_id, data.plan_code, data.plan_name, data.status]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

  // Stub methods - TODO: implement properly  
  async getAdminTenantSummaries() { return []; }
  async listSupportMessages() { return []; }
  async upsertSupportMessage(data: any) { return null; }
  async getAffiliateProfileByUser(userId: string) { return null; }
  async upsertAffiliateProfile(data: any) { return null; }
  async getAffiliateSubscription(affiliateId: string) { return null; }
  async upsertPlanSubscription(data: any) { return null; }
  async createAffiliateCampaign(data: any) { return null; }
  async listAffiliateCampaigns(affiliateId: string) { return []; }
  async updateAffiliateCampaign(id: string, affiliateId: string, data: any) { return null; }
  async listAffiliateAssets(campaignId: string) { return []; }
  async getAffiliateCampaign(affiliateId: string, campaignId: string) { return null; }
  async insertAffiliateAsset(data: any) { return null; }
  async incrementUsage(tenantId: string, metric: string, value: number) { return null; }
  async getTenantKpis(tenantId: string) { return null; }
  async getCampaignKpis(tenantId: string, campaignId: string) { return null; }
  async recordLead(tenantId: string, data: any) { return this.insertLead({ ...data, tenant_id: tenantId, status: 'new' }); }
  async updateSubscriptionByTenantId(tenantId: string, data: any) { return null; }
  async createTenant(data: any) { return this.insertTenant(data); }
  async getTenantPage(tenantId: string) { return null; }
  async upsertTenantPage(data: any) { return null; }
  async listMarketplaceTenants() { return []; }
}
