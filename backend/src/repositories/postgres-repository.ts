import { Pool, PoolClient } from 'pg';
import { AppEnv } from '@config/env';
import { v4 as uuid } from 'uuid';
import type {
  UUID,
  Campaign,
  Lead,
  LeadStatus,
  EventType,
} from '../types/database';

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
  async getTenantBySlug(slug: string) {
    const client = await this.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM tenants WHERE slug = $1',
        [slug]
      );
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

  // ======================
  // 🔹 Campaign Methods
  // ======================
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
          JSON.stringify(data.schedule || null),
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ======================
  // 🔹 Lead Methods
  // ======================
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
          data.last_interaction_at || new Date().toISOString(),
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

  async updateLead(leadId: UUID, tenantId: UUID, data: Partial<Lead>) {
    const client = await this.getClient();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(
            Array.isArray(value) || (typeof value === 'object' && value !== null)
              ? JSON.stringify(value)
              : value
          );
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
          JSON.stringify(data.payload || null),
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

