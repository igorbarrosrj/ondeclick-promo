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
  role text check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
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
