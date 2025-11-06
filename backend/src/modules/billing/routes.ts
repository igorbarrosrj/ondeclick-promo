import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';
import { requireAuth } from '@modules/auth/auth-hooks';

export async function registerBillingRoutes(app: FastifyInstance) {
  const billingService = app.container.resolve(TOKENS.billingService);

  app.post('/api/billing/checkout', { preHandler: requireAuth }, async (request, reply) => {
    const auth = request.auth!;
    const body = z
      .object({
        priceId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        customerEmail: z.string().email().optional()
      })
      .parse(request.body ?? {});

    const url = await billingService.createCheckoutSession({
      tenantId: auth.tenantId,
      priceId: body.priceId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      customerEmail: body.customerEmail
    });

    reply.send({ url });
  });

  app.post('/api/billing/portal', { preHandler: requireAuth }, async (request, reply) => {
    const body = z
      .object({
        customerId: z.string(),
        returnUrl: z.string().url()
      })
      .parse(request.body ?? {});

    const url = await billingService.createPortalSession(body.customerId, body.returnUrl);
    reply.send({ url });
  });

  app.post('/api/billing/webhook/stripe', { config: { rawBody: true } }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string | undefined;
    const payload = request.rawBody;
    if (!payload) {
      reply.status(400).send({ message: 'Missing payload' });
      return;
    }

    await billingService.handleWebhook(signature, Buffer.from(payload));
    reply.send({ received: true });
  });
}
