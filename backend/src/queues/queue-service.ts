import { Queue } from 'bullmq';
import { QUEUE_META_PUBLISH, QUEUE_WHATSAPP_SEND, QUEUE_AI_GENERATE, QUEUE_REENGAGE } from './queue-names';

const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1_000
  },
  removeOnComplete: true,
  removeOnFail: 10
};

export interface QueuePayloads {
  [QUEUE_META_PUBLISH]: {
    tenantId: string;
    campaignId: string;
    channels: string[];
  };
  [QUEUE_WHATSAPP_SEND]: {
    tenantId: string;
    campaignId: string;
    audience: Array<Record<string, unknown>>;
  };
  [QUEUE_AI_GENERATE]: {
    tenantId: string;
    campaignId: string;
    type: 'image' | 'copy';
  };
  [QUEUE_REENGAGE]: {
    tenantId: string;
    tags?: string[];
    campaignId?: string;
  };
}

export class QueueService {
  constructor(
    private readonly metaQueue: Queue,
    private readonly whatsappQueue: Queue,
    private readonly aiQueue: Queue,
    private readonly reengageQueue: Queue
  ) {}

  enqueueMetaPublish(payload: QueuePayloads[typeof QUEUE_META_PUBLISH]) {
    return this.metaQueue.add('publish', payload, DEFAULT_JOB_OPTIONS);
  }

  enqueueWhatsAppSend(payload: QueuePayloads[typeof QUEUE_WHATSAPP_SEND]) {
    return this.whatsappQueue.add('send', payload, DEFAULT_JOB_OPTIONS);
  }

  enqueueAiTask(payload: QueuePayloads[typeof QUEUE_AI_GENERATE]) {
    return this.aiQueue.add(payload.type, payload, DEFAULT_JOB_OPTIONS);
  }

  enqueueReengage(payload: QueuePayloads[typeof QUEUE_REENGAGE]) {
    return this.reengageQueue.add('reengage', payload, DEFAULT_JOB_OPTIONS);
  }
}
