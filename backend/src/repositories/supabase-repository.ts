import { SupabaseServiceClient } from '@config/supabase';
import { generateId } from '@utils/ids';
import {
  BillingUsage,
  Campaign,
  CampaignKpiRow,
  Event,
  Integration,
  Lead,
  Membership,
  TenantKpiRow,
  Tenant,
  TenantPage,
  UUID
} from '@types/database';
import { ApplicationError, NotFoundError } from '@core/errors';

function handleSupabaseError(error: unknown) {
  if (!error) return;
  throw new ApplicationError('Supabase error', 500, { error });
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  category?: string;
  address?: Record<string, unknown>;
  phone?: string;
  ownerUserId: UUID;
}

export interface UpdateTenantInput {
  tenantId: UUID;
  name?: string;
  category?: string;
  address?: Record<string, unknown>;
  phone?: string;
  brandColor?: string;
}

export interface MarketplaceFilters {
  category?: string;
  city?: string;
}

export class SupabaseRepository {
  constructor(private readonly client: SupabaseServiceClient) {}

  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    const tenantId = generateId();
    const membershipId = generateId();

    const { data: tenant, error } = await this.client
      .from('tenants')
      .insert({
        id: tenantId,
        slug: input.slug,
        name: input.name,
        category: input.category ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null
      })
      .select()
      .single();

    handleSupabaseError(error);

    const { error: membershipError } = await this.client.from('memberships').insert({
      id: membershipId,
      tenant_id: tenantId,
      user_id: input.ownerUserId,
      role: 'owner'
    });

    handleSupabaseError(membershipError);

    return tenant as Tenant;
  }

  async updateTenant(input: UpdateTenantInput): Promise<Tenant> {
    const { data, error } = await this.client
      .from('tenants')
      .update({
        name: input.name,
        category: input.category,
        address: input.address,
        phone: input.phone,
        brand_color: input.brandColor
      })
      .eq('id', input.tenantId)
      .select()
      .single();

    handleSupabaseError(error);

    if (!data) {
      throw new NotFoundError('Tenant not found');
    }

    return data as Tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await this.client.from('tenants').select('*').eq('slug', slug).maybeSingle();
    handleSupabaseError(error);
    return (data as Tenant) ?? null;
  }

  async getTenantPage(tenantId: UUID): Promise<TenantPage | null> {
    const { data, error } = await this.client
      .from('tenant_pages')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    handleSupabaseError(error);
    return (data as TenantPage) ?? null;
  }

  async upsertTenantPage(tenantId: UUID, payload: Partial<TenantPage>): Promise<TenantPage> {
    const { data, error } = await this.client
      .from('tenant_pages')
      .upsert({
        tenant_id: tenantId,
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);

    if (!data) {
      throw new ApplicationError('Failed to upsert tenant page', 500);
    }

    return data as TenantPage;
  }

  async listMarketplaceTenants(filters: MarketplaceFilters = {}) {
    let query = this.client
      .from('tenants')
      .select('*, campaigns!inner(status, offer)')
      .eq('campaigns.status', 'active');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.city) {
      query = query.contains('campaigns.offer', { city: filters.city });
    }

    const { data, error } = await query;
    handleSupabaseError(error);
    return (data ?? []) as Tenant[];
  }

  async listCampaigns(tenantId: UUID): Promise<Campaign[]> {
    const { data, error } = await this.client
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return (data ?? []) as Campaign[];
  }

  async getCampaignById(tenantId: UUID, campaignId: UUID): Promise<Campaign | null> {
    const { data, error } = await this.client
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', campaignId)
      .maybeSingle();

    handleSupabaseError(error);
    return (data as Campaign) ?? null;
  }

  async insertCampaign(payload: Partial<Campaign> & { tenant_id: UUID; name: string; channels: string[] }): Promise<Campaign> {
    const { data, error } = await this.client
      .from('campaigns')
      .insert({
        id: generateId(),
        status: 'draft',
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data as Campaign;
  }

  async updateCampaign(
    campaignId: UUID,
    tenantId: UUID,
    patch: Partial<Campaign>
  ): Promise<Campaign> {
    const { data, error } = await this.client
      .from('campaigns')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', campaignId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    handleSupabaseError(error);

    if (!data) {
      throw new NotFoundError('Campaign not found');
    }

    return data as Campaign;
  }

  async insertCopyVariant(payload: {
    tenant_id: UUID;
    campaign_id: UUID;
    tone?: string;
    content: string;
    score?: number;
  }) {
    const { data, error } = await this.client
      .from('copy_variants')
      .insert({
        id: generateId(),
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  }

  async listCopyVariants(tenantId: UUID, campaignId: UUID) {
    const { data, error } = await this.client
      .from('copy_variants')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    handleSupabaseError(error);
    return data ?? [];
  }

  async insertAsset(payload: {
    tenant_id: UUID;
    campaign_id: UUID;
    type: 'image' | 'video';
    source: 'ai' | 'upload';
    url: string;
    meta?: Record<string, unknown>;
  }) {
    const { data, error } = await this.client
      .from('assets')
      .insert({
        id: generateId(),
        meta: payload.meta ?? null,
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data;
  }

  async recordLead(payload: Partial<Lead> & { tenant_id: UUID }): Promise<Lead> {
    const { data, error } = await this.client
      .from('leads')
      .upsert({
        id: payload.id ?? generateId(),
        status: payload.status ?? 'new',
        tags: payload.tags ?? [],
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data as Lead;
  }

  async listLeads(tenantId: UUID, filters: Record<string, unknown> = {}) {
    let query = this.client.from('leads').select('*').eq('tenant_id', tenantId);

    if (filters.status) {
      query = query.eq('status', filters.status as string);
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel as string);
    }

    if (filters.campaignId) {
      query = query.eq('source_campaign_id', filters.campaignId as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    handleSupabaseError(error);
    return (data ?? []) as Lead[];
  }

  async updateLead(tenantId: UUID, leadId: UUID, patch: Partial<Lead>) {
    const { data, error } = await this.client
      .from('leads')
      .update({ ...patch })
      .eq('tenant_id', tenantId)
      .eq('id', leadId)
      .select()
      .single();

    handleSupabaseError(error);
    if (!data) {
      throw new NotFoundError('Lead not found');
    }

    return data as Lead;
  }

  async insertEvent(payload: Partial<Event> & { tenant_id: UUID; type: string }): Promise<Event> {
    const { data, error } = await this.client
      .from('events')
      .insert({
        id: payload.id ?? generateId(),
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data as Event;
  }

  async incrementUsage(payload: Omit<BillingUsage, 'id'> & { id?: UUID }): Promise<BillingUsage> {
    const { data, error } = await this.client
      .from('billing_usage')
      .upsert({
        id: payload.id ?? generateId(),
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data as BillingUsage;
  }

  async getMembershipsByUser(userId: UUID): Promise<Membership[]> {
    const { data, error } = await this.client
      .from('memberships')
      .select('*, tenants(*)')
      .eq('user_id', userId);

    handleSupabaseError(error);
    return (data ?? []) as Membership[];
  }

  async getIntegration(tenantId: UUID): Promise<Integration | null> {
    const { data, error } = await this.client
      .from('integrations')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    handleSupabaseError(error);
    return (data as Integration) ?? null;
  }

  async upsertIntegration(tenantId: UUID, payload: Partial<Integration>) {
    const { data, error } = await this.client
      .from('integrations')
      .upsert({
        id: payload.id ?? generateId(),
        tenant_id: tenantId,
        ...payload
      })
      .select()
      .single();

    handleSupabaseError(error);
    return data as Integration;
  }

  async getTenantKpis(tenantId: UUID) {
    const { data, error } = await this.client
      .from('tenant_kpis_view')
      .select('*')
      .eq('tenant_id', tenantId);

    handleSupabaseError(error);
    return (data ?? []) as TenantKpiRow[];
  }

  async getCampaignKpis(campaignId: UUID) {
    const { data, error } = await this.client
      .from('campaign_kpis_view')
      .select('*')
      .eq('campaign_id', campaignId);

    handleSupabaseError(error);
    return (data ?? []) as CampaignKpiRow[];
  }
}
