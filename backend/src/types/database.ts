export type UUID = string;

export interface Tenant {
  id: UUID;
  slug: string;
  name: string;
  category: string | null;
  address: Record<string, unknown> | null;
  phone: string | null;
  brand_color: string;
  created_at: string;
}

export type Role = 'owner' | 'admin' | 'member' | 'affiliate';

export interface Membership {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  role: Role;
  created_at: string;
}

export interface TenantPage {
  id: UUID;
  tenant_id: UUID;
  headline: string | null;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  sections: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: UUID;
  tenant_id: UUID;
  meta_connected: boolean;
  meta_payload: Record<string, unknown> | null;
  meta_access_token_enc: string | null;
  whatsapp_connected: boolean;
  whatsapp_payload: Record<string, unknown> | null;
  tiktok_connected: boolean;
  tiktok_payload: Record<string, unknown> | null;
  n8n_base_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';

export interface Campaign {
  id: UUID;
  tenant_id: UUID;
  name: string;
  channels: string[];
  status: CampaignStatus;
  offer: Record<string, unknown> | null;
  geo: Record<string, unknown> | null;
  budget_daily: number | null;
  schedule: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'image' | 'video';
export type AssetSource = 'ai' | 'upload';

export interface Asset {
  id: UUID;
  tenant_id: UUID;
  campaign_id: UUID;
  type: AssetType;
  source: AssetSource;
  url: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface CopyVariant {
  id: UUID;
  tenant_id: UUID;
  campaign_id: UUID;
  tone: string | null;
  content: string;
  score: number | null;
  created_at: string;
}

export type LeadStatus = 'new' | 'responded' | 'purchased' | 'ignored';

export interface Lead {
  id: UUID;
  tenant_id: UUID;
  name: string | null;
  contact: string | null;
  channel: string | null;
  source_campaign_id: UUID | null;
  status: LeadStatus;
  tags: string[] | null;
  last_interaction_at: string | null;
  created_at: string;
}

export type EventType = 'click' | 'view' | 'reply' | 'visit' | 'purchase';

export interface Event {
  id: UUID;
  tenant_id: UUID;
  lead_id: UUID | null;
  campaign_id: UUID | null;
  affiliate_campaign_id?: UUID | null;
  affiliate_id?: UUID | null;
  channel: string | null;
  type: EventType;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface BillingUsage {
  id: UUID;
  tenant_id: UUID;
  metric: string;
  value: number;
  period_start: string;
  period_end: string;
}

export interface CampaignKpiRow {
  campaign_id: UUID;
  channel: string;
  metric: string;
  value: number;
  window_start: string;
  window_end: string;
}

export interface TenantKpiRow {
  tenant_id: UUID;
  metric: string;
  value: number;
  window_start: string;
  window_end: string;
}

export interface Database {
  tenants: Tenant;
  memberships: Membership;
  tenant_pages: TenantPage;
  integrations: Integration;
  campaigns: Campaign;
  assets: Asset;
  copy_variants: CopyVariant;
  leads: Lead;
  events: Event;
  billing_usage: BillingUsage;
  affiliate_profiles: AffiliateProfile;
  affiliate_campaigns: AffiliateCampaign;
  affiliate_assets: AffiliateAsset;
  support_messages: SupportMessage;
  plan_subscriptions: PlanSubscription;
}

export interface AffiliateProfile {
  id: UUID;
  user_id: UUID;
  display_name: string | null;
  payout_method: string | null;
  payout_details: Record<string, unknown> | null;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateCampaign {
  id: UUID;
  affiliate_id: UUID;
  tenant_id: UUID | null;
  name: string;
  description: string | null;
  status: CampaignStatus;
  offer: Record<string, unknown> | null;
  channels: string[];
  budget: number | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateAsset {
  id: UUID;
  affiliate_campaign_id: UUID;
  type: string;
  url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SupportMessage {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID | null;
  sender_type: 'tenant' | 'admin';
  subject: string | null;
  body: string;
  status: 'open' | 'pending' | 'closed';
  created_at: string;
}

export interface PlanSubscription {
  id: UUID;
  affiliate_id: UUID;
  plan_code: string;
  status: 'active' | 'past_due' | 'canceled';
  started_at: string;
  current_period_end: string | null;
  metadata: Record<string, unknown> | null;
}
