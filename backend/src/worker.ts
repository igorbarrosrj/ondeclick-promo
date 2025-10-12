import { Worker } from 'bullmq';
import { getBackendContainer } from '@adapters/next/container';
import { TOKENS } from '@core/tokens';
import { startTelemetry, stopTelemetry } from '@config/index';
import {
  QUEUE_AI_GENERATE,
  QUEUE_META_PUBLISH,
  QUEUE_REENGAGE,
  QUEUE_WHATSAPP_SEND
} from '@queues/queue-names';
import { SupabaseRepository } from '@repositories/supabase-repository';
import { OpenAIService } from '@services/openai-service';
import { MetaAdapter } from '@adapters/meta/meta-adapter';
import { WhatsAppAdapter } from '@adapters/whatsapp/whatsapp-adapter';
import { N8nClient } from '@clients/n8n-client';
import { decrypt } from '@utils/crypto';

async function bootstrapWorkers() {
  const container = getBackendContainer();
  const env = container.resolve(TOKENS.env);
  const logger = container.resolve(TOKENS.logger);
  const redis = container.resolve(TOKENS.redis);
  const repository = container.resolve(TOKENS.supabaseRepository) as SupabaseRepository;
  const openAiService = container.resolve(TOKENS.openAiService) as OpenAIService;
  const metaAdapter = container.resolve(TOKENS.metaAdapter) as MetaAdapter;
  const whatsappAdapter = container.resolve(TOKENS.whatsappAdapter) as WhatsAppAdapter;
  const n8nClient = container.resolve(TOKENS.n8nClient) as N8nClient;

  await startTelemetry(env);

  const connection = { url: env.REDIS_URL } as const;

  const metaWorker = new Worker(
    QUEUE_META_PUBLISH,
    async (job) => {
      logger.info({ jobId: job.id }, 'Processing Meta publish job');
      const integration = await repository.getIntegration(job.data.tenantId);
      if (!integration?.meta_connected || !integration.meta_access_token_enc) {
        throw new Error('Meta integration not configured');
      }

      const token = decrypt(env.META_LONG_LIVED_TOKEN_SECRET, JSON.parse(integration.meta_access_token_enc));
      await metaAdapter.publishCampaign(
        {
          tenantId: job.data.tenantId,
          campaignId: job.data.campaignId,
          name: job.data.campaignName ?? 'Campaign',
          objective: 'OUTCOME_MESSAGES',
          adAccountId: (integration.meta_payload?.adAccountId as string) ?? '',
          pageId: integration.meta_payload?.pageId as string | undefined,
          creative: {
            primaryText: job.data.primaryText ?? 'Mensagem padrão',
            headline: job.data.headline ?? 'Campanha',
            imageUrl: job.data.imageUrl
          }
        },
        token
      );
    },
    { connection }
  );

  const whatsappWorker = new Worker(
    QUEUE_WHATSAPP_SEND,
    async (job) => {
      logger.info({ jobId: job.id }, 'Processing WhatsApp send job');
      if (!job.data.audience?.length) {
        logger.warn('WhatsApp audience empty');
        return;
      }

      await whatsappAdapter.sendCampaignMessage({
        tenantId: job.data.tenantId,
        campaignId: job.data.campaignId,
        message: job.data.message ?? { text: 'Promoção disponível!' },
        audience: job.data.audience,
        traceId: job.data.traceId ?? job.id ?? 'trace'
      });
    },
    { connection }
  );

  const aiWorker = new Worker(
    QUEUE_AI_GENERATE,
    async (job) => {
      logger.info({ jobId: job.id }, 'Processing AI generation job');
      if (job.data.type === 'image') {
        const url = await openAiService.generateImage({ prompt: job.data.prompt ?? 'Marketing asset' });
        logger.info({ imageUrl: url }, 'Generated AI image');
      } else {
        const copy = await openAiService.generateCampaignCopy({
          tenantName: job.data.tenantName ?? 'Cliente',
          offer: job.data.offer ?? {}
        });
        logger.info({ copy }, 'Generated AI copy');
      }
    },
    { connection }
  );

  const reengageWorker = new Worker(
    QUEUE_REENGAGE,
    async (job) => {
      logger.info({ jobId: job.id }, 'Processing reengagement job');
      await n8nClient.sendCampaign({
        tenantId: job.data.tenantId,
        campaignId: job.data.campaignId ?? 'reengage',
        channel: 'whatsapp',
        message: { text: 'Estamos com uma nova oferta para você!' },
        audience: job.data.audience ?? [],
        traceId: job.id ?? 'reengage'
      });
    },
    { connection }
  );

  const shutdown = async () => {
    await metaWorker.close();
    await whatsappWorker.close();
    await aiWorker.close();
    await reengageWorker.close();
    await redis.quit();
    await stopTelemetry();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrapWorkers().catch((error) => {
  console.error('Worker startup failed', error);
  process.exit(1);
});
