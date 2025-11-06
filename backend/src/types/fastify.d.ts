import 'fastify';
import { AuthenticatedRequestContext } from '@core/context';
import { Container } from '@core/container';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthenticatedRequestContext;
    rawBody?: Buffer;
  }

  interface FastifyInstance {
    container: Container;
  }
}
