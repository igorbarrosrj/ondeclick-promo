import { Container } from '@core/container';
import { TOKENS } from '@core/tokens';
import {
  loadEnv,
  createLogger,
  createSupabaseClient,
  createRedisClient
} from '@config/index';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { TenantService } from '@services/tenant-service';
import { CampaignService } from '@services/campaign-service';
import { LeadService } from '@services/lead-service';
import { IntegrationService } from '@services/integration-service';
import { KpiService } from '@services/kpi-service';
import { BillingService } from '@services/billing-service';
import { OpenAIService } from '@services/openai-service';
import { QueueService } from '@queues/queue-service';
import { N8nClient } from '@clients/n8n-client';
import { MetaAdapter } from '@adapters/meta/meta-adapter';
import { WhatsAppAdapter } from '@adapters/whatsapp/whatsapp-adapter';
import { createQueue } from '@queues/queue-factory';
import {
  QUEUE_AI_GENERATE,
  QUEUE_META_PUBLISH,
  QUEUE_REENGAGE,
  QUEUE_WHATSAPP_SEND
} from '@queues/queue-names';
import { AdminService } from '@services/admin-service';
import { AffiliateService } from '@services/affiliate-service';
import { MercadoPagoService } from '@services/mercadopago-service';
import { WhatsAppAuthService } from '@services/whatsapp-auth-service';
import { AdGroupService } from '@services/ad-group-service';

let cachedContainer: Container | null = null;

export function getBackendContainer() {
  if (cachedContainer) {
    return cachedContainer;
  }

  const env = loadEnv();
  const logger = createLogger(env);
  const supabase = createSupabaseClient(env);
  const redis = createRedisClient(env);
  const repository = new SupabaseRepository(supabase);
  const openAiService = new OpenAIService(env.OPENAI_API_KEY);
  const n8nClient = new N8nClient(env);
  const metaAdapter = new MetaAdapter(env);
  const whatsappAdapter = new WhatsAppAdapter(env, n8nClient);

  const connection = { url: env.REDIS_URL } as const;
  const metaQueue = createQueue({ name: QUEUE_META_PUBLISH, connection, prefix: env.QUEUE_PREFIX }).queue;
  const whatsappQueue = createQueue({ name: QUEUE_WHATSAPP_SEND, connection, prefix: env.QUEUE_PREFIX }).queue;
  const aiQueue = createQueue({ name: QUEUE_AI_GENERATE, connection, prefix: env.QUEUE_PREFIX }).queue;
  const reengageQueue = createQueue({ name: QUEUE_REENGAGE, connection, prefix: env.QUEUE_PREFIX }).queue;

  const queueService = new QueueService(metaQueue, whatsappQueue, aiQueue, reengageQueue);

  const container = new Container();
  container.registerValue(TOKENS.env, env);
  container.registerValue(TOKENS.logger, logger);
  container.registerValue(TOKENS.supabaseClient, supabase);
  container.registerValue(TOKENS.redis, redis);
  container.registerValue(TOKENS.supabaseRepository, repository);
  container.registerValue(TOKENS.openAiService, openAiService);
  container.registerValue(TOKENS.n8nClient, n8nClient);
  container.registerValue(TOKENS.metaAdapter, metaAdapter);
  container.registerValue(TOKENS.whatsappAdapter, whatsappAdapter);
  container.registerValue(TOKENS.queueService, queueService);

  const tenantService = new TenantService(repository);
  const campaignService = new CampaignService(repository, queueService, openAiService);
  const leadService = new LeadService(repository, queueService);
  const integrationService = new IntegrationService(repository, metaAdapter, whatsappAdapter, n8nClient, env);
  const kpiService = new KpiService(repository);
  const billingService = new BillingService(env, repository, n8nClient);
  const adminService = new AdminService(repository);
  const affiliateService = new AffiliateService(repository, queueService, openAiService);
  const mercadoPagoService = new MercadoPagoService(env, repository, n8nClient);
  const whatsappAuthService = new WhatsAppAuthService(env, repository, n8nClient);
  const adGroupService = new AdGroupService(env, repository, n8nClient);

  container.registerValue(TOKENS.tenantService, tenantService);
  container.registerValue(TOKENS.campaignService, campaignService);
  container.registerValue(TOKENS.leadService, leadService);
  container.registerValue(TOKENS.integrationService, integrationService);
  container.registerValue(TOKENS.kpiService, kpiService);
  container.registerValue(TOKENS.billingService, billingService);
  container.registerValue(TOKENS.adminService, adminService);
  container.registerValue(TOKENS.affiliateService, affiliateService);
  container.registerValue(TOKENS.mercadoPagoService, mercadoPagoService);
  container.registerValue(TOKENS.whatsappAuthService, whatsappAuthService);
  container.registerValue(TOKENS.adGroupService, adGroupService);

  cachedContainer = container;
  return container;
}
