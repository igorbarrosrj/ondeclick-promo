import { createToken } from './container';
import { AppEnv } from '@config/env';
import { PostgresRepository } from '@repositories/postgres-repository';
import { TenantService } from '@services/tenant-service';
import { CampaignService } from '@services/campaign-service';
import { LeadService } from '@services/lead-service';
import { IntegrationService } from '@services/integration-service';
import { KpiService } from '@services/kpi-service';
import { BillingService } from '@services/billing-service';
import { OpenAIService } from '@services/openai-service';
import { QueueService } from '@queues/queue-service';
import { MetaAdapter } from '@adapters/meta/meta-adapter';
import { WhatsAppAdapter } from '@adapters/whatsapp/whatsapp-adapter';
import { N8nClient } from '@clients/n8n-client';
import { Pool } from 'pg';
import { RedisClient } from '@config/redis';
import { Logger } from 'pino';
import { AdminService } from '@services/admin-service';
import { AffiliateService } from '@services/affiliate-service';
import { MercadoPagoService } from '@services/mercadopago-service';
import { WhatsAppAuthService } from '@services/whatsapp-auth-service';
import { AdGroupService } from '@services/ad-group-service';

export const TOKENS = {
  env: createToken<AppEnv>('env'),
  logger: createToken<Logger>('logger'),
  postgresPool: createToken<Pool>('postgresPool'),
  redis: createToken<RedisClient>('redis'),
  repository: createToken<PostgresRepository>('repository'),
  tenantService: createToken<TenantService>('tenantService'),
  campaignService: createToken<CampaignService>('campaignService'),
  leadService: createToken<LeadService>('leadService'),
  integrationService: createToken<IntegrationService>('integrationService'),
  kpiService: createToken<KpiService>('kpiService'),
  billingService: createToken<BillingService>('billingService'),
  adminService: createToken<AdminService>('adminService'),
  affiliateService: createToken<AffiliateService>('affiliateService'),
  mercadoPagoService: createToken<MercadoPagoService>('mercadoPagoService'),
  whatsappAuthService: createToken<WhatsAppAuthService>('whatsappAuthService'),
  adGroupService: createToken<AdGroupService>('adGroupService'),
  openAiService: createToken<OpenAIService>('openAiService'),
  queueService: createToken<QueueService>('queueService'),
  metaAdapter: createToken<MetaAdapter>('metaAdapter'),
  whatsappAdapter: createToken<WhatsAppAdapter>('whatsappAdapter'),
  n8nClient: createToken<N8nClient>('n8nClient')
} as const;
