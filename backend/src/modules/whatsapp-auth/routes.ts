import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TOKENS } from '@core/tokens';

export async function registerWhatsAppAuthRoutes(app: FastifyInstance) {
  // Iniciar autenticação via WhatsApp
  app.post('/api/whatsapp-auth/initiate', async (request, reply) => {
    const body = z
      .object({
        whatsappNumber: z.string().min(10),
        planCode: z.string(),
        planName: z.string(),
      })
      .parse(request.body);

    const whatsappAuthService = app.container.resolve(TOKENS.whatsappAuthService);
    const result = await whatsappAuthService.initiateAuth({
      whatsappNumber: body.whatsappNumber,
      planCode: body.planCode,
      planName: body.planName,
    });

    reply.send(result);
  });

  // Webhook: resposta do usuário no WhatsApp
  app.post('/api/whatsapp-auth/webhook', async (request, reply) => {
    const body = z
      .object({
        whatsappNumber: z.string(),
        message: z.string(),
      })
      .parse(request.body);

    const whatsappAuthService = app.container.resolve(TOKENS.whatsappAuthService);
    const result = await whatsappAuthService.handleWhatsAppReply({
      whatsappNumber: body.whatsappNumber,
      message: body.message,
    });

    reply.send(result);
  });

  // Verificar status de autenticação
  app.get('/api/whatsapp-auth/check/:whatsappNumber', async (request, reply) => {
    const params = z
      .object({
        whatsappNumber: z.string(),
      })
      .parse(request.params);

    const whatsappAuthService = app.container.resolve(TOKENS.whatsappAuthService);
    const result = await whatsappAuthService.checkAuth(params.whatsappNumber);

    reply.send(result);
  });
}
