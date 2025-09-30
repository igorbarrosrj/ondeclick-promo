import { Queue, QueueEvents } from 'bullmq';
import { RedisOptions } from 'ioredis';

export interface QueueConfig {
  name: string;
  connection: RedisOptions & { url?: string };
  prefix?: string;
}

export function createQueue<T = unknown>(config: QueueConfig) {
  const queue = new Queue<T>(config.name, {
    connection: config.connection,
    prefix: config.prefix
  });

  const events = new QueueEvents(config.name, {
    connection: config.connection,
    prefix: config.prefix
  });

  return { queue, events };
}
