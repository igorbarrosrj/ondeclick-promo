-- Core tables
create extension if not exists "uuid-ossp";

create table if not exists tenants (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  category text,
  address jsonb,
  phone text,
  brand_color text default '#D62598',
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid not null,
  role text check (role in ('owner','admin','member','affiliate')),
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);

create table if not exists affiliate_profiles (
  id uuid primary key,
  user_id uuid not null unique,
  display_name text,
  payout_method text,
  payout_details jsonb,
  plan text default 'basic',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists affiliate_campaigns (
  id uuid primary key,
  affiliate_id uuid references affiliate_profiles(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  name text not null,
  description text,
  status text check (status in ('draft','scheduled','active','paused','ended')) default 'draft',
  offer jsonb,
  channels jsonb default '[]'::jsonb,
  budget numeric,
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists affiliate_assets (
  id uuid primary key,
  affiliate_campaign_id uuid references affiliate_campaigns(id) on delete cascade,
  type text check (type in ('image','video','banner','link')),
  url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists support_messages (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid,
  sender_type text check (sender_type in ('tenant','admin')),
  subject text,
  body text not null,
  status text check (status in ('open','pending','closed')) default 'open',
  created_at timestamptz default now()
);

create table if not exists plan_subscriptions (
  id uuid primary key,
  affiliate_id uuid references affiliate_profiles(id) on delete cascade,
  plan_code text not null,
  status text check (status in ('active','past_due','canceled')) default 'active',
  started_at timestamptz default now(),
  current_period_end timestamptz,
  metadata jsonb
);

create table if not exists tenant_pages (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  headline text,
  description text,
  logo_url text,
  hero_image_url text,
  sections jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists integrations (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  meta_connected boolean default false,
  meta_payload jsonb,
  meta_access_token_enc text,
  whatsapp_connected boolean default false,
  whatsapp_payload jsonb,
  tiktok_connected boolean default false,
  tiktok_payload jsonb,
  n8n_base_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  channels jsonb not null,
  status text check (status in ('draft','scheduled','active','paused','ended')) default 'draft',
  offer jsonb,
  geo jsonb,
  budget_daily numeric,
  schedule jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists assets (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  type text check (type in ('image','video')),
  source text check (source in ('ai','upload')),
  url text not null,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists copy_variants (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  tone text,
  content text not null,
  score numeric,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  name text,
  contact text,
  channel text,
  source_campaign_id uuid references campaigns(id),
  status text check (status in ('new','responded','purchased','ignored')) default 'new',
  tags text[],
  last_interaction_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  lead_id uuid references leads(id),
  campaign_id uuid references campaigns(id),
  affiliate_campaign_id uuid references affiliate_campaigns(id),
  affiliate_id uuid references affiliate_profiles(id),
  channel text,
  type text check (type in ('click','view','reply','visit','purchase')),
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists billing_usage (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  metric text,
  value bigint,
  period_start timestamptz,
  period_end timestamptz
);

create index if not exists idx_tenants_created_at on tenants(created_at);
create index if not exists idx_campaigns_tenant_created_at on campaigns(tenant_id, created_at);
create index if not exists idx_events_campaign_created_at on events(campaign_id, created_at);
create index if not exists idx_leads_tenant_created_at on leads(tenant_id, created_at);
create index if not exists idx_leads_tags_gin on leads using gin(tags);

create view if not exists campaign_kpis_view as
select
  campaign_id,
  channel,
  jsonb_object_keys(payload) as metric,
  cast(payload ->> jsonb_object_keys(payload) as numeric) as value,
  (now() - interval '30 days') as window_start,
  now() as window_end
from events;

create view if not exists tenant_kpis_view as
select
  tenant_id,
  type as metric,
  count(*) as value,
  (now() - interval '30 days') as window_start,
  now() as window_end
from events
group by tenant_id, type;

create view if not exists admin_tenant_summary_view as
select
  t.id as tenant_id,
  t.name,
  t.slug,
  count(distinct c.id) as campaign_count,
  count(distinct l.id) as lead_count,
  coalesce(sum((events.payload ->> 'amount')::numeric), 0) as total_revenue,
  coalesce(sum(case when events.type = 'click' then 1 else 0 end), 0) as clicks,
  coalesce(sum(case when events.type = 'purchase' then 1 else 0 end), 0) as purchases
from tenants t
left join campaigns c on c.tenant_id = t.id
left join leads l on l.tenant_id = t.id
left join events on events.tenant_id = t.id
group by t.id;
