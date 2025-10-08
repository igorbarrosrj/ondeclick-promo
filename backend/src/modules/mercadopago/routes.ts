import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';

export async function registerMercadoPagoRoutes(app: FastifyInstance) {
  // Criar preferência de pagamento
  app.post('/api/mercadopago/create-preference', async (request, reply) => {
    const body = z
      .object({
        tenantId: z.string().uuid(),
        planCode: z.string(),
        planName: z.string(),
        price: z.number().positive(),
        successUrl: z.string().url(),
        failureUrl: z.string().url(),
        pendingUrl: z.string().url().optional(),
      })
      .parse(request.body);

    const mercadoPagoService = app.container.resolve(TOKENS.mercadoPagoService);
    const result = await mercadoPagoService.createPreference(body);

    reply.send(result);
  });

  // Webhook do Mercado Pago
  app.post('/api/mercadopago/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const mercadoPagoService = app.container.resolve(TOKENS.mercadoPagoService);

    await mercadoPagoService.handleWebhook(request.body);

    reply.send({ received: true });
  });
}
