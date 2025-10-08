-- Migration: Adicionar suporte a WhatsApp Auth e Ad Groups
-- Data: 2025-10-08

-- 1. Adicionar campos WhatsApp na tabela tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_verification_token text;

-- Criar constraint de unicidade
ALTER TABLE tenants
  ADD CONSTRAINT tenants_whatsapp_number_key UNIQUE (whatsapp_number);

-- 2. Atualizar tabela plan_subscriptions
ALTER TABLE plan_subscriptions
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS plan_name text,
  ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'mercadopago',
  ADD COLUMN IF NOT EXISTS payment_provider_id text,
  ADD COLUMN IF NOT EXISTS payment_provider_data jsonb;

-- Adicionar constraint de check
ALTER TABLE plan_subscriptions
  DROP CONSTRAINT IF EXISTS plan_subscriptions_payment_provider_check;

ALTER TABLE plan_subscriptions
  ADD CONSTRAINT plan_subscriptions_payment_provider_check
  CHECK (payment_provider IN ('mercadopago', 'stripe'));

-- Atualizar constraint de status para incluir 'pending'
ALTER TABLE plan_subscriptions
  DROP CONSTRAINT IF EXISTS plan_subscriptions_status_check;

ALTER TABLE plan_subscriptions
  ADD CONSTRAINT plan_subscriptions_status_check
  CHECK (status IN ('active', 'past_due', 'canceled', 'pending'));

-- 3. Criar tabela ad_groups (grupos de anúncio)
CREATE TABLE IF NOT EXISTS ad_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  whatsapp_group_id text,
  whatsapp_group_invite_link text,
  name text NOT NULL,
  description text,
  status text DEFAULT 'creating',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar constraint de check para status
ALTER TABLE ad_groups
  DROP CONSTRAINT IF EXISTS ad_groups_status_check;

ALTER TABLE ad_groups
  ADD CONSTRAINT ad_groups_status_check
  CHECK (status IN ('creating', 'active', 'paused', 'archived'));

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_tenants_whatsapp
  ON tenants(whatsapp_number)
  WHERE whatsapp_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ad_groups_tenant
  ON ad_groups(tenant_id);

CREATE INDEX IF NOT EXISTS idx_ad_groups_campaign
  ON ad_groups(campaign_id);

-- 5. Comentários para documentação
COMMENT ON COLUMN tenants.whatsapp_number IS 'Número do WhatsApp para autenticação (formato: 5511999999999)';
COMMENT ON COLUMN tenants.whatsapp_verified IS 'Se o número foi verificado via código';
COMMENT ON COLUMN tenants.whatsapp_verification_token IS 'Token de 6 dígitos para verificação';

COMMENT ON TABLE ad_groups IS 'Grupos de WhatsApp criados automaticamente para campanhas';
COMMENT ON COLUMN ad_groups.whatsapp_group_id IS 'ID do grupo no WhatsApp Business API';
COMMENT ON COLUMN ad_groups.whatsapp_group_invite_link IS 'Link de convite do grupo (https://chat.whatsapp.com/xxx)';
