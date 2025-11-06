import { Pool, PoolClient } from 'pg';
import { AppEnv } from '@config/env';
import { v4 as uuid } from 'uuid';
import type {
  UUID,
  Campaign,
  Lead,
  LeadStatus,
  EventType,
  Tenant,
  TenantPage,
  Integration,
  PlanSubscription,
  AffiliateProfile,
  AffiliateCampaign,
  AffiliateAsset,
  AdGroup,
  CampaignKpiRow,
  TenantKpiRow,
  SupportMessage,
  Asset,
  CopyVariant,
  Event,
  Membership,
} from '../types/database';

type TenantWhatsAppPayload = Partial<
  Pick<Tenant, 'whatsapp_number' | 'whatsapp_verified' | 'whatsapp_verification_token'>
>;

type LeadFilters = {
  status?: string;
  channel?: string;
  campaignId?: string;
};

type MarketplaceFilters = {
  category?: string;
  city?: string;
};

type SupportFilters = {
  tenantId?: UUID;
  status?: string;
};

function buildUpdateSet(
  data: Record<string, unknown>,
  options: { columnMap?: Record<string, string>; jsonColumns?: Set<string>; startIndex?: number } = {}
) {
  const updates: string[] = [];
  const values: unknown[] = [];
  let index = options.startIndex ?? 1;

  for (const [key, rawValue] of Object.entries(data)) {
    if (rawValue === undefined) continue;

    const column = options.columnMap?.[key] ?? key;
    const needsJson = options.jsonColumns?.has(key) ?? false;
    const value =
      needsJson && rawValue !== null
        ? JSON.stringify(rawValue)
        : rawValue;

    updates.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  }

  return { updates, values, nextIndex: index };
}

// Alias para compatibilidade retroativa
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

  // ======================
  // 🔹 Métodos de Tenant
  // ======================
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Tenant>('SELECT * FROM tenants WHERE slug = $1', [slug]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getTenantById(id: UUID): Promise<Tenant | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Tenant>('SELECT * FROM tenants WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getTenantByWhatsApp(whatsappNumber: string): Promise<Tenant | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Tenant>('SELECT * FROM tenants WHERE whatsapp_number = $1', [
        whatsappNumber,
      ]);
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
    whatsappNumber?: string;
  }): Promise<Tenant> {
    const client = await this.getClient();
    try {
      const result = await client.query<Tenant>(
        `INSERT INTO tenants (id, slug, name, category, address, phone, whatsapp_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.id,
          data.slug,
          data.name,
          data.category,
          JSON.stringify(data.address),
          data.phone,
          data.whatsappNumber ?? data.phone ?? null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createTenant(params: {
    name: string;
    slug: string;
    category?: string;
    address?: Record<string, unknown>;
    phone?: string;
    ownerUserId: UUID;
    brandColor?: string;
  }): Promise<Tenant> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const tenantId = uuid();
      const tenantResult = await client.query<Tenant>(
        `INSERT INTO tenants (id, slug, name, category, address, phone, brand_color)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, '#D62598'))
         RETURNING *`,
        [
          tenantId,
          params.slug,
          params.name,
          params.category ?? null,
          params.address ? JSON.stringify(params.address) : null,
          params.phone ?? null,
          params.brandColor ?? null,
        ]
      );

      await client.query(
        `INSERT INTO memberships (id, tenant_id, user_id, role)
         VALUES ($1, $2, $3, 'owner')
         ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [uuid(), tenantId, params.ownerUserId]
      );

      await client.query('COMMIT');
      return tenantResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMembershipsByUser(userId: UUID): Promise<Membership[]> {
    const client = await this.getClient();
    try {
      const result = await client.query<Membership>(
        'SELECT * FROM memberships WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateTenant(params: {
    tenantId: UUID;
    name?: string;
    slug?: string;
    category?: string;
    address?: Record<string, unknown>;
    phone?: string;
    brandColor?: string;
  }): Promise<Tenant | null> {
    const { tenantId, brandColor, ...rest } = params;
    const client = await this.getClient();
    try {
      const updatePayload: Record<string, unknown> = { ...rest };
      if (brandColor !== undefined) {
        updatePayload.brand_color = brandColor;
      }
      const { updates, values } = buildUpdateSet(updatePayload, {
        jsonColumns: new Set(['address']),
      });

      if (!updates.length) {
        const current = await client.query<Tenant>('SELECT * FROM tenants WHERE id = $1', [tenantId]);
        return current.rows[0] || null;
      }

      const result = await client.query<Tenant>(
        `UPDATE tenants
         SET ${updates.join(', ')}
         WHERE id = $${values.length + 1}
         RETURNING *`,
        [...values, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  private async updateTenantWhatsAppInternal(
    tenantId: UUID,
    payload: TenantWhatsAppPayload
  ): Promise<Tenant | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(payload);
      if (!updates.length) {
        const current = await client.query<Tenant>('SELECT * FROM tenants WHERE id = $1', [tenantId]);
        return current.rows[0] || null;
      }

      const result = await client.query<Tenant>(
        `UPDATE tenants
         SET ${updates.join(', ')}
         WHERE id = $${values.length + 1}
         RETURNING *`,
        [...values, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  updateTenantWhatsApp(tenantId: UUID, payload: TenantWhatsAppPayload) {
    return this.updateTenantWhatsAppInternal(tenantId, payload);
  }

  updateTenantWhatsAppAuth(tenantId: UUID, payload: TenantWhatsAppPayload) {
    return this.updateTenantWhatsAppInternal(tenantId, payload);
  }

  async getTenantPage(tenantId: UUID): Promise<TenantPage | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<TenantPage>('SELECT * FROM tenant_pages WHERE tenant_id = $1', [
        tenantId,
      ]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async upsertTenantPage(tenantId: UUID, payload: Partial<TenantPage>): Promise<TenantPage> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const existing = await client.query<TenantPage>('SELECT * FROM tenant_pages WHERE tenant_id = $1', [
        tenantId,
      ]);

      if (existing.rowCount) {
        const { updates, values } = buildUpdateSet(payload, {
          jsonColumns: new Set(['sections']),
        });

        const updateClauses = updates.length ? `${updates.join(', ')}, ` : '';
        const result = await client.query<TenantPage>(
          `UPDATE tenant_pages
           SET ${updateClauses}updated_at = now()
           WHERE tenant_id = $${values.length + 1}
           RETURNING *`,
          [...values, tenantId]
        );

        await client.query('COMMIT');
        return result.rows[0];
      }

      const pageId = uuid();
      const result = await client.query<TenantPage>(
        `INSERT INTO tenant_pages (id, tenant_id, headline, description, logo_url, hero_image_url, sections)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          pageId,
          tenantId,
          payload.headline ?? null,
          payload.description ?? null,
          payload.logo_url ?? null,
          payload.hero_image_url ?? null,
          payload.sections ? JSON.stringify(payload.sections) : null,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listMarketplaceTenants(filters: MarketplaceFilters): Promise<
    Array<
      Tenant & {
        headline: string | null;
        hero_image_url: string | null;
        city: string | null;
      }
    >
  > {
    const client = await this.getClient();
    try {
      const clauses = ['t.whatsapp_verified = true'];
      const values: unknown[] = [];
      let index = 1;

      if (filters.category) {
        clauses.push(`t.category = $${index++}`);
        values.push(filters.category);
      }

    if (filters.city) {
        clauses.push(`COALESCE(t.address->>'city', '') ILIKE $${index++}`);
        values.push(`%${filters.city}%`);
      }

      const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const result = await client.query<
        Tenant & { headline: string | null; hero_image_url: string | null; city: string | null }
      >(
        `SELECT
           t.*,
           tp.headline,
           tp.hero_image_url,
           COALESCE(t.address->>'city', NULL) AS city
         FROM tenants t
         LEFT JOIN tenant_pages tp ON tp.tenant_id = t.id
         ${whereClause}
         ORDER BY t.created_at DESC
         LIMIT 50`,
        values
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getAdminTenantSummaries(): Promise<
    Array<
      Tenant & {
        campaign_count: number;
        lead_count: number;
        subscription_status: string | null;
      }
    >
  > {
    const client = await this.getClient();
    try {
      const result = await client.query<
        Tenant & { campaign_count: number; lead_count: number; subscription_status: string | null }
      >(
        `SELECT
           t.*,
           COALESCE(c.campaign_count, 0) AS campaign_count,
           COALESCE(l.lead_count, 0) AS lead_count,
           ps.subscription_status
         FROM tenants t
         LEFT JOIN (
           SELECT tenant_id, COUNT(*)::int AS campaign_count
           FROM campaigns
           GROUP BY tenant_id
         ) c ON c.tenant_id = t.id
         LEFT JOIN (
           SELECT tenant_id, COUNT(*)::int AS lead_count
           FROM leads
           GROUP BY tenant_id
         ) l ON l.tenant_id = t.id
         LEFT JOIN (
           SELECT tenant_id, MAX(status) AS subscription_status
           FROM plan_subscriptions
           GROUP BY tenant_id
         ) ps ON ps.tenant_id = t.id
         ORDER BY t.created_at DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Campaign Methods
  // ======================
  async listCampaigns(tenantId: UUID): Promise<Campaign[]> {
    const client = await this.getClient();
    try {
      const result = await client.query<Campaign>(
        'SELECT * FROM campaigns WHERE tenant_id = $1 ORDER BY created_at DESC',
        [tenantId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getCampaignById(tenantId: UUID, campaignId: UUID): Promise<Campaign | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Campaign>(
        'SELECT * FROM campaigns WHERE id = $1 AND tenant_id = $2',
        [campaignId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async insertCampaign(
    data: Partial<Campaign> & { tenant_id: UUID; name: string; channels: string[] }
  ): Promise<Campaign> {
    const client = await this.getClient();
    try {
      const id = data.id || uuid();
      const result = await client.query<Campaign>(
        `INSERT INTO campaigns (id, tenant_id, name, channels, status, offer, geo, budget_daily, schedule)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.name,
          data.channels,
          data.status || 'draft',
          data.offer ? JSON.stringify(data.offer) : null,
          data.geo ? JSON.stringify(data.geo) : null,
          data.budget_daily || null,
          data.schedule ? JSON.stringify(data.schedule) : null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateCampaign(
    campaignId: UUID,
    tenantId: UUID,
    patch: Partial<Campaign>
  ): Promise<Campaign | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(patch, {
        jsonColumns: new Set(['offer', 'geo', 'schedule', 'channels']),
      });

      if (!updates.length) {
        const current = await client.query<Campaign>(
          'SELECT * FROM campaigns WHERE id = $1 AND tenant_id = $2',
          [campaignId, tenantId]
        );
        return current.rows[0] || null;
      }

      const result = await client.query<Campaign>(
        `UPDATE campaigns
         SET ${updates.join(', ')}, updated_at = now()
         WHERE id = $${values.length + 1} AND tenant_id = $${values.length + 2}
         RETURNING *`,
        [...values, campaignId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async insertAsset(data: {
    tenant_id: UUID;
    campaign_id: UUID;
    type: Asset['type'];
    source: Asset['source'];
    url: string;
    meta?: Record<string, unknown> | null;
  }): Promise<Asset> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<Asset>(
        `INSERT INTO assets (id, tenant_id, campaign_id, type, source, url, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.campaign_id,
          data.type,
          data.source,
          data.url,
          data.meta ? JSON.stringify(data.meta) : null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async insertCopyVariant(data: {
    tenant_id: UUID;
    campaign_id: UUID;
    tone: string | null;
    content: string;
    score: number | null;
  }): Promise<CopyVariant> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<CopyVariant>(
        `INSERT INTO copy_variants (id, tenant_id, campaign_id, tone, content, score)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, data.tenant_id, data.campaign_id, data.tone, data.content, data.score]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Ad Group Methods
  // ======================
  async createAdGroup(data: {
    tenant_id: UUID;
    campaign_id: UUID;
    name: string;
    description?: string | null;
  }): Promise<AdGroup> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<AdGroup>(
        `INSERT INTO ad_groups (id, tenant_id, campaign_id, name, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, data.tenant_id, data.campaign_id, data.name, data.description ?? null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateAdGroup(adGroupId: UUID, patch: Partial<AdGroup>): Promise<AdGroup | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(patch, {
        columnMap: { whatsapp_group_invite_link: 'whatsapp_group_invite_link' },
      });

      if (!updates.length) {
        const current = await client.query<AdGroup>('SELECT * FROM ad_groups WHERE id = $1', [
          adGroupId,
        ]);
        return current.rows[0] || null;
      }

      const result = await client.query<AdGroup>(
        `UPDATE ad_groups
         SET ${updates.join(', ')}, updated_at = now()
         WHERE id = $${values.length + 1}
         RETURNING *`,
        [...values, adGroupId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAdGroup(tenantId: UUID, adGroupId: UUID): Promise<AdGroup | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<AdGroup>(
        'SELECT * FROM ad_groups WHERE id = $1 AND tenant_id = $2',
        [adGroupId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAdGroupsByCampaign(campaignId: UUID): Promise<AdGroup[]> {
    const client = await this.getClient();
    try {
      const result = await client.query<AdGroup>(
        'SELECT * FROM ad_groups WHERE campaign_id = $1 ORDER BY created_at DESC',
        [campaignId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Lead Methods
  // ======================
  async insertLead(data: Partial<Lead> & { tenant_id: UUID; status: LeadStatus }): Promise<Lead> {
    const client = await this.getClient();
    try {
      const id = data.id || uuid();
      const result = await client.query<Lead>(
        `INSERT INTO leads (id, tenant_id, name, contact, channel, source_campaign_id, status, tags, last_interaction_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (tenant_id, contact) DO UPDATE SET
           name = EXCLUDED.name,
           status = EXCLUDED.status,
           tags = EXCLUDED.tags,
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
          data.tags || null,
          data.last_interaction_at || new Date().toISOString(),
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getLeadById(tenantId: UUID, leadId: UUID): Promise<Lead | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Lead>(
        'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
        [leadId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateLead(tenantId: UUID, leadId: UUID, data: Partial<Lead>): Promise<Lead | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(data, {
        jsonColumns: new Set(),
      });

      if (!updates.length) return null;

      const result = await client.query<Lead>(
        `UPDATE leads SET ${updates.join(', ')}
         WHERE id = $${values.length + 1} AND tenant_id = $${values.length + 2}
         RETURNING *`,
        [...values, leadId, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async listLeads(tenantId: UUID, filters: LeadFilters): Promise<Lead[]> {
    const client = await this.getClient();
    try {
      const clauses = ['tenant_id = $1'];
      const values: unknown[] = [tenantId];
      let index = 2;

      if (filters.status) {
        clauses.push(`status = $${index++}`);
        values.push(filters.status);
      }

      if (filters.channel) {
        clauses.push(`channel = $${index++}`);
        values.push(filters.channel);
      }

      if (filters.campaignId) {
        clauses.push(`source_campaign_id = $${index++}`);
        values.push(filters.campaignId);
      }

      const result = await client.query<Lead>(
        `SELECT * FROM leads WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
        values
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  recordLead(data: {
    tenant_id: UUID;
    contact: string;
    name?: string | null;
    channel?: string | null;
    status?: LeadStatus;
    tags?: string[] | null;
    source_campaign_id?: UUID | null;
  }): Promise<Lead> {
    return this.insertLead({
      tenant_id: data.tenant_id,
      contact: data.contact,
      name: data.name ?? null,
      channel: data.channel ?? 'whatsapp',
      status: data.status ?? 'new',
      tags: data.tags ?? null,
      source_campaign_id: data.source_campaign_id ?? null,
    });
  }

  // ======================
  // 🔹 Event Methods
  // ======================
  async insertEvent(data: {
    tenant_id: UUID;
    lead_id?: UUID | null;
    campaign_id?: UUID | null;
    affiliate_campaign_id?: UUID | null;
    affiliate_id?: UUID | null;
    channel?: string | null;
    type: EventType;
    payload?: Record<string, unknown> | null;
  }): Promise<Event> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<Event>(
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
          data.payload ? JSON.stringify(data.payload) : null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Integration Methods
  // ======================
  async getIntegration(tenantId: UUID): Promise<Integration | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<Integration>(
        'SELECT * FROM integrations WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1',
        [tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async upsertIntegration(
    tenantId: UUID,
    payload: Partial<Integration> & { id?: UUID; tenant_id: UUID }
  ): Promise<Integration> {
    const client = await this.getClient();
    try {
      if (payload.id) {
        const { updates, values } = buildUpdateSet(payload, {
          jsonColumns: new Set(['meta_payload', 'whatsapp_payload', 'tiktok_payload']),
        });

        const result = await client.query<Integration>(
          `UPDATE integrations
           SET ${updates.join(', ')}, updated_at = now()
           WHERE id = $${values.length + 1} AND tenant_id = $${values.length + 2}
           RETURNING *`,
          [...values, payload.id, tenantId]
        );
        return result.rows[0];
      }

      const id = uuid();
      const result = await client.query<Integration>(
        `INSERT INTO integrations (
           id,
           tenant_id,
           meta_connected,
           meta_payload,
           meta_access_token_enc,
           whatsapp_connected,
           whatsapp_payload,
           tiktok_connected,
           tiktok_payload,
           n8n_base_url
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          id,
          tenantId,
          payload.meta_connected ?? false,
          payload.meta_payload ? JSON.stringify(payload.meta_payload) : null,
          payload.meta_access_token_enc ?? null,
          payload.whatsapp_connected ?? false,
          payload.whatsapp_payload ? JSON.stringify(payload.whatsapp_payload) : null,
          payload.tiktok_connected ?? false,
          payload.tiktok_payload ? JSON.stringify(payload.tiktok_payload) : null,
          payload.n8n_base_url ?? null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Affiliate Methods
  // ======================
  async getAffiliateProfileByUser(userId: UUID): Promise<AffiliateProfile | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<AffiliateProfile>(
        'SELECT * FROM affiliate_profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async upsertAffiliateProfile(
    data: Partial<AffiliateProfile> & { user_id: UUID }
  ): Promise<AffiliateProfile> {
    const client = await this.getClient();
    try {
      const existing = await client.query<AffiliateProfile>(
        'SELECT * FROM affiliate_profiles WHERE user_id = $1',
        [data.user_id]
      );

      if (existing.rowCount) {
        const { updates, values } = buildUpdateSet(data, {
          jsonColumns: new Set(['payout_details']),
        });
        const result = await client.query<AffiliateProfile>(
          `UPDATE affiliate_profiles
           SET ${updates.join(', ')}, updated_at = now()
           WHERE id = $${values.length + 1}
           RETURNING *`,
          [...values, existing.rows[0].id]
        );
        return result.rows[0];
      }

      const id = uuid();
      const result = await client.query<AffiliateProfile>(
        `INSERT INTO affiliate_profiles (id, user_id, display_name, payout_method, payout_details, plan)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          id,
          data.user_id,
          data.display_name ?? null,
          data.payout_method ?? null,
          data.payout_details ? JSON.stringify(data.payout_details) : null,
          data.plan ?? 'basic',
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getAffiliateSubscription(affiliateId: UUID): Promise<PlanSubscription | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<PlanSubscription>(
        `SELECT * FROM plan_subscriptions
         WHERE affiliate_id = $1
         ORDER BY started_at DESC
         LIMIT 1`,
        [affiliateId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async upsertPlanSubscription(
    data: Partial<PlanSubscription> & { affiliate_id: UUID }
  ): Promise<PlanSubscription> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      const existing = await client.query<PlanSubscription>(
        `SELECT * FROM plan_subscriptions
         WHERE affiliate_id = $1
         ORDER BY started_at DESC
         LIMIT 1`,
        [data.affiliate_id]
      );

      if (existing.rowCount) {
        const updateData: Record<string, unknown> = { ...data };
        delete updateData.affiliate_id;

        const { updates, values } = buildUpdateSet(updateData, {
          jsonColumns: new Set(['metadata', 'payment_provider_data']),
        });

        if (!updates.length) {
          await client.query('COMMIT');
          return existing.rows[0];
        }

        const result = await client.query<PlanSubscription>(
          `UPDATE plan_subscriptions
           SET ${updates.join(', ')}
           WHERE id = $${values.length + 1}
           RETURNING *`,
          [...values, existing.rows[0].id]
        );

        await client.query('COMMIT');
        return result.rows[0];
      }

      const id = uuid();
      const result = await client.query<PlanSubscription>(
        `INSERT INTO plan_subscriptions (
           id,
           tenant_id,
           affiliate_id,
           plan_code,
           plan_name,
           status,
           payment_provider,
           payment_provider_id,
           payment_provider_data,
           started_at,
           current_period_end,
           metadata
         )
         VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()), $10, $11)
         RETURNING *`,
        [
          id,
          data.affiliate_id,
          data.plan_code ?? 'basic',
          data.plan_name ?? null,
          data.status ?? 'pending',
          data.payment_provider ?? 'mercadopago',
          data.payment_provider_id ?? null,
          data.payment_provider_data ? JSON.stringify(data.payment_provider_data) : null,
          data.started_at ?? null,
          data.current_period_end ?? null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createAffiliateCampaign(
    data: Partial<AffiliateCampaign> & { affiliate_id: UUID; name: string }
  ): Promise<AffiliateCampaign> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<AffiliateCampaign>(
        `INSERT INTO affiliate_campaigns (
           id,
           affiliate_id,
           tenant_id,
           name,
           description,
           status,
           offer,
           channels,
           budget,
           scheduled_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          id,
          data.affiliate_id,
          data.tenant_id ?? null,
          data.name,
          data.description ?? null,
          data.status ?? 'draft',
          data.offer ? JSON.stringify(data.offer) : null,
          data.channels ?? [],
          data.budget ?? null,
          data.scheduled_at ?? null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async listAffiliateCampaigns(affiliateId: UUID): Promise<AffiliateCampaign[]> {
    const client = await this.getClient();
    try {
      const result = await client.query<AffiliateCampaign>(
        `SELECT * FROM affiliate_campaigns
         WHERE affiliate_id = $1
         ORDER BY created_at DESC`,
        [affiliateId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateAffiliateCampaign(
    campaignId: UUID,
    affiliateId: UUID,
    patch: Partial<AffiliateCampaign>
  ): Promise<AffiliateCampaign | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(patch, {
        jsonColumns: new Set(['offer', 'channels']),
      });

      if (!updates.length) {
        const current = await client.query<AffiliateCampaign>(
          'SELECT * FROM affiliate_campaigns WHERE id = $1 AND affiliate_id = $2',
          [campaignId, affiliateId]
        );
        return current.rows[0] || null;
      }

      const result = await client.query<AffiliateCampaign>(
        `UPDATE affiliate_campaigns
         SET ${updates.join(', ')}, updated_at = now()
         WHERE id = $${values.length + 1} AND affiliate_id = $${values.length + 2}
         RETURNING *`,
        [...values, campaignId, affiliateId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAffiliateCampaign(campaignId: UUID, affiliateId: UUID): Promise<AffiliateCampaign | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<AffiliateCampaign>(
        'SELECT * FROM affiliate_campaigns WHERE id = $1 AND affiliate_id = $2',
        [campaignId, affiliateId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async listAffiliateAssets(campaignId: UUID): Promise<AffiliateAsset[]> {
    const client = await this.getClient();
    try {
      const result = await client.query<AffiliateAsset>(
        'SELECT * FROM affiliate_assets WHERE affiliate_campaign_id = $1 ORDER BY created_at DESC',
        [campaignId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async insertAffiliateAsset(data: {
    affiliate_campaign_id: UUID;
    type: AffiliateAsset['type'];
    url: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<AffiliateAsset> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<AffiliateAsset>(
        `INSERT INTO affiliate_assets (id, affiliate_campaign_id, type, url, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          id,
          data.affiliate_campaign_id,
          data.type,
          data.url ?? null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Billing & Usage Methods
  // ======================
  async incrementUsage(data: {
    tenant_id: UUID;
    metric: string;
    value: number;
    period_start: string;
    period_end: string;
  }): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(
        `INSERT INTO billing_usage (id, tenant_id, metric, value, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuid(), data.tenant_id, data.metric, data.value, data.period_start, data.period_end]
      );
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 KPI Methods
  // ======================
  async getTenantKpis(tenantId: UUID): Promise<TenantKpiRow[]> {
    const client = await this.getClient();
    try {
      const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const windowEnd = new Date().toISOString();

      const result = await client.query<TenantKpiRow>(
        `SELECT * FROM (
           SELECT
             $1::uuid AS tenant_id,
             'leads_total' AS metric,
             COUNT(*)::bigint AS value,
             $2::timestamptz AS window_start,
             $3::timestamptz AS window_end
           FROM leads WHERE tenant_id = $1
           UNION ALL
           SELECT
             $1::uuid AS tenant_id,
             'events_total' AS metric,
             COUNT(*)::bigint AS value,
             $2::timestamptz AS window_start,
             $3::timestamptz AS window_end
           FROM events WHERE tenant_id = $1
         ) AS stats`,
        [tenantId, windowStart, windowEnd]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getCampaignKpis(campaignId: UUID): Promise<CampaignKpiRow[]> {
    const client = await this.getClient();
    try {
      const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const windowEnd = new Date().toISOString();

      const result = await client.query<CampaignKpiRow>(
        `SELECT
           campaign_id,
           channel,
           metric,
           value,
           window_start,
           window_end
         FROM (
           SELECT
             $1::uuid AS campaign_id,
             COALESCE(channel, 'unknown') AS channel,
             'events_total' AS metric,
             COUNT(*)::bigint AS value,
             $2::timestamptz AS window_start,
             $3::timestamptz AS window_end
           FROM events
           WHERE campaign_id = $1
           GROUP BY channel
         ) AS stats`,
        [campaignId, windowStart, windowEnd]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Subscription Methods
  // ======================
  async createSubscription(
    data: Partial<PlanSubscription> & { tenant_id: UUID; plan_code: string }
  ): Promise<PlanSubscription> {
    const client = await this.getClient();
    try {
      const id = uuid();
      const result = await client.query<PlanSubscription>(
        `INSERT INTO plan_subscriptions (
           id,
           tenant_id,
           affiliate_id,
           plan_code,
           plan_name,
           status,
           payment_provider,
           payment_provider_id,
           payment_provider_data,
           started_at,
           current_period_end,
           metadata
         )
         VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, COALESCE($9, now()), $10, $11)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.plan_code,
          data.plan_name ?? null,
          data.status ?? 'pending',
          data.payment_provider ?? 'mercadopago',
          data.payment_provider_id ?? null,
          data.payment_provider_data ? JSON.stringify(data.payment_provider_data) : null,
          data.started_at ?? null,
          data.current_period_end ?? null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getPlanSubscription(tenantId: UUID): Promise<PlanSubscription | null> {
    const client = await this.getClient();
    try {
      const result = await client.query<PlanSubscription>(
        `SELECT * FROM plan_subscriptions
         WHERE tenant_id = $1
         ORDER BY started_at DESC
         LIMIT 1`,
        [tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateSubscriptionByTenantId(
    tenantId: UUID,
    patch: Partial<PlanSubscription>
  ): Promise<PlanSubscription | null> {
    const client = await this.getClient();
    try {
      const { updates, values } = buildUpdateSet(patch, {
        jsonColumns: new Set(['metadata', 'payment_provider_data']),
      });

      if (!updates.length) {
        const current = await client.query<PlanSubscription>(
          `SELECT * FROM plan_subscriptions
           WHERE tenant_id = $1
           ORDER BY started_at DESC
           LIMIT 1`,
          [tenantId]
        );
        return current.rows[0] || null;
      }

      const result = await client.query<PlanSubscription>(
        `UPDATE plan_subscriptions
         SET ${updates.join(', ')}
         WHERE id = (
           SELECT id FROM plan_subscriptions
           WHERE tenant_id = $${values.length + 1}
           ORDER BY started_at DESC
           LIMIT 1
         )
         RETURNING *`,
        [...values, tenantId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Support Methods
  // ======================
  async listSupportMessages(filters: SupportFilters): Promise<SupportMessage[]> {
    const client = await this.getClient();
    try {
      const clauses: string[] = [];
      const values: unknown[] = [];
      let index = 1;

      if (filters.tenantId) {
        clauses.push(`tenant_id = $${index++}`);
        values.push(filters.tenantId);
      }

      if (filters.status) {
        clauses.push(`status = $${index++}`);
        values.push(filters.status);
      }

      const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const result = await client.query<SupportMessage>(
        `SELECT * FROM support_messages
         ${whereClause}
         ORDER BY created_at DESC`,
        values
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async upsertSupportMessage(
    data: Partial<Omit<SupportMessage, 'created_at'>> & {
      tenant_id: UUID;
      sender_type: SupportMessage['sender_type'];
      body: string;
      status?: SupportMessage['status'];
      created_at?: string;
    }
  ): Promise<SupportMessage> {
    const client = await this.getClient();
    try {
      if (data.id) {
        const updatePayload = { ...data };
        delete updatePayload.id;

        const { updates, values } = buildUpdateSet(updatePayload);
        if (!updates.length) {
          const current = await client.query<SupportMessage>('SELECT * FROM support_messages WHERE id = $1', [
            data.id,
          ]);
          return current.rows[0];
        }
        const result = await client.query<SupportMessage>(
          `UPDATE support_messages
           SET ${updates.join(', ')}
           WHERE id = $${values.length + 1}
           RETURNING *`,
          [...values, data.id]
        );
        return result.rows[0];
      }

      const id = uuid();
      const result = await client.query<SupportMessage>(
        `INSERT INTO support_messages (id, tenant_id, user_id, sender_type, subject, body, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id,
          data.tenant_id,
          data.user_id ?? null,
          data.sender_type,
          data.subject ?? null,
          data.body,
          data.status ?? 'open',
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
