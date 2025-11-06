# Configuração Completa do n8n para OndeClick Promo

## CONTEXTO DO PROJETO

Este é um sistema de automação de marketing que gerencia campanhas em múltiplos canais (WhatsApp, Meta/Facebook/Instagram). O n8n atua como orquestrador de workflows, recebendo requisições do backend Node.js/Fastify e executando as ações necessárias (envio de mensagens, processamento de respostas, billing, etc.).

---

## ARQUITETURA

```
Backend (Fastify) → n8n Webhooks → Execução de Workflows → APIs Externas (WhatsApp, Meta, etc)
                                  ↓
                            Banco de dados (Supabase)
```

---

## WEBHOOKS NECESSÁRIOS

Você precisa criar **7 workflows** no n8n, cada um com um webhook específico:

### 1. **Campaign Send** (OBRIGATÓRIO)
- **URL**: `http://69.62.101.194:5678/webhook/campaign-send`
- **Método**: POST
- **Descrição**: Recebe solicitações para enviar campanhas via WhatsApp
- **Payload esperado**:
```json
{
  "tenantId": "uuid-do-tenant",
  "campaignId": "uuid-da-campanha",
  "channel": "whatsapp",
  "message": {
    "text": "Texto da mensagem",
    "buttons": [
      { "label": "Botão 1", "payload": "action1" }
    ],
    "mediaUrl": "https://url-da-imagem.com/image.jpg"
  },
  "audience": [
    {
      "name": "João Silva",
      "phone": "5511999999999",
      "leadId": "uuid-do-lead"
    }
  ],
  "traceId": "trace-id-para-debug"
}
```
- **O que fazer**:
  1. Receber o webhook
  2. Para cada contato em `audience[]`, enviar mensagem via API do WhatsApp
  3. Registrar logs de sucesso/erro
  4. Retornar status HTTP 200

### 2. **WhatsApp Reply** (OBRIGATÓRIO)
- **URL**: `http://69.62.101.194:5678/webhook/whatsapp-reply`
- **Método**: POST
- **Descrição**: Recebe notificações quando leads respondem mensagens no WhatsApp
- **Payload esperado**:
```json
{
  "tenantId": "uuid-do-tenant",
  "lead": {
    "name": "João Silva",
    "phone": "5511999999999",
    "leadId": "uuid-do-lead",
    "campaignId": "uuid-da-campanha"
  },
  "message": {
    "text": "Resposta do usuário",
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```
- **O que fazer**:
  1. Receber a resposta do WhatsApp
  2. Fazer POST para `http://backend:4000/api/webhooks/whatsapp/reply` com os dados recebidos
  3. Processar resposta automática se necessário
  4. Retornar status HTTP 200

### 3. **WhatsApp Auth** (OPCIONAL)
- **URL**: `http://69.62.101.194:5678/webhook/whatsapp-auth`
- **Método**: POST
- **Descrição**: Recebe notificações sobre autenticação/conexão do WhatsApp
- **Payload esperado**:
```json
{
  "tenantId": "uuid-do-tenant",
  "event": "connected|disconnected|qr_code",
  "data": {
    "phone": "5511999999999",
    "qrCode": "base64-encoded-qr-code",
    "status": "authenticated"
  }
}
```
- **O que fazer**:
  1. Atualizar status de conexão do WhatsApp no banco
  2. Notificar tenant sobre mudanças de status
  3. Retornar status HTTP 200

### 4. **Create Ad Group** (OPCIONAL)
- **URL**: `http://69.62.101.194:5678/webhook/create-ad-group`
- **Método**: POST
- **Descrição**: Recebe solicitações para criar grupos de anúncios no Meta
- **Payload esperado**:
```json
{
  "tenantId": "uuid-do-tenant",
  "campaignId": "uuid-da-campanha",
  "adGroupData": {
    "name": "Nome do Ad Group",
    "targeting": {
      "age_min": 18,
      "age_max": 65,
      "geo_locations": { "countries": ["BR"] }
    },
    "budget": 5000
  }
}
```
- **O que fazer**:
  1. Receber dados do ad group
  2. Criar o ad group via Meta Marketing API
  3. Retornar ID do ad group criado
  4. Retornar status HTTP 200

### 5. **Billing** (OPCIONAL)
- **URL**: `http://69.62.101.194:5678/webhook/billing`
- **Método**: POST
- **Descrição**: Recebe eventos de cobrança (pagamentos, cancelamentos, etc)
- **Payload esperado**:
```json
{
  "tenantId": "uuid-do-tenant",
  "event": "payment_succeeded|payment_failed|subscription_cancelled",
  "data": {
    "amount": 9900,
    "currency": "BRL",
    "planId": "premium",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-02-01"
  }
}
```
- **O que fazer**:
  1. Processar evento de billing
  2. Atualizar status da assinatura no banco
  3. Enviar notificação ao tenant se necessário
  4. Retornar status HTTP 200

### 6. **Mercado Pago** (OPCIONAL)
- **URL**: `http://69.62.101.194:5678/webhook/mercadopago`
- **Método**: POST
- **Descrição**: Recebe webhooks do Mercado Pago sobre pagamentos
- **Payload esperado** (formato Mercado Pago):
```json
{
  "action": "payment.created|payment.updated",
  "data": {
    "id": "123456789"
  },
  "type": "payment"
}
```
- **O que fazer**:
  1. Validar webhook do Mercado Pago (verificar assinatura)
  2. Buscar detalhes do pagamento na API do Mercado Pago
  3. Atualizar status no banco de dados
  4. Chamar webhook `/billing` se necessário
  5. Retornar status HTTP 200

### 7. **Health Check** (OBRIGATÓRIO)
- **URL**: `http://69.62.101.194:5678/webhook/health`
- **Método**: GET
- **Descrição**: Endpoint para verificar se o n8n está funcionando
- **O que fazer**:
  1. Retornar simplesmente `{ "status": "ok" }`
  2. Retornar status HTTP 200

---

## INTEGRAÇÕES EXTERNAS NECESSÁRIAS

### WhatsApp Business API (GRATUITA - ChatPRO)
Atualmente o projeto usa ChatPRO como API do WhatsApp:
- **Base URL**: https://v5.chatpro.com.br/chatpro-c0vmlc715g
- **Token**: fc7b0fc73d1036af93597ea3dfe6a100
- **Phone Number ID**: chatpro-c0vmlc715g

**Alternativas GRATUITAS para WhatsApp:**

1. **Evolution API** (RECOMENDADO - 100% GRATUITO)
   - GitHub: https://github.com/EvolutionAPI/evolution-api
   - Servidor próprio
   - Sem limites de mensagens
   - Suporta WhatsApp Web via QR Code
   - Docker: `docker run -d -p 8080:8080 atendai/evolution-api`

2. **Baileys** (Biblioteca Node.js)
   - GitHub: https://github.com/WhiskeySockets/Baileys
   - Integração direta no código
   - Sem custos
   - Requer manutenção de sessão

3. **WPPConnect**
   - GitHub: https://github.com/wppconnect-team/wppconnect
   - API REST sobre WhatsApp Web
   - Gratuito
   - Fácil integração

**RECOMENDAÇÃO**: Use Evolution API - é a mais completa e estável.

### Meta (Facebook/Instagram) Marketing API
Já configurado no projeto:
- **App ID**: 3610014019133315
- **App Secret**: 1ebb43b76feb7f16c311e84a981666e9
- **Redirect URI**: https://app.rotacomercial.com/integrations/meta/callback

---

## ESTRUTURA DOS WORKFLOWS NO N8N

### Exemplo: Workflow "Campaign Send"

```
[Webhook] → [Split Array] → [Loop over audience] → [HTTP Request to WhatsApp] → [Log Result]
              (audience)         (for each)              (send message)            (Supabase)
```

**Nós necessários:**
1. **Webhook Node**: Receber POST em `/webhook/campaign-send`
2. **Function Node**: Extrair dados do payload
3. **Split In Batches**: Processar audience em lotes de 10
4. **HTTP Request**: Enviar mensagem para WhatsApp API
   - URL: `{{ $env.WHATSAPP_BASE_URL }}/message/sendText`
   - Method: POST
   - Headers: `Authorization: Bearer {{ $env.WHATSAPP_TOKEN }}`
   - Body:
     ```json
     {
       "number": "{{ $json.phone }}",
       "text": "{{ $json.message.text }}"
     }
     ```
5. **Supabase Node**: Registrar envio no banco
6. **Response Node**: Retornar sucesso

### Exemplo: Workflow "WhatsApp Reply"

```
[Webhook] → [Function] → [HTTP Request] → [Response]
  (reply)    (format)    (to backend)      (200 OK)
```

---

## VARIÁVEIS DE AMBIENTE NO N8N

Configure estas variáveis no n8n:

```bash
# WhatsApp (ChatPRO atual)
WHATSAPP_BASE_URL=https://v5.chatpro.com.br/chatpro-c0vmlc715g
WHATSAPP_TOKEN=fc7b0fc73d1036af93597ea3dfe6a100
WHATSAPP_PHONE_NUMBER_ID=chatpro-c0vmlc715g

# Backend
BACKEND_URL=http://backend:4000

# Supabase
SUPABASE_URL=http://69.62.101.194:8000
SUPABASE_SERVICE_KEY=ba6363ed57e79c16ea83459c2087c8e00c7d27c2e034e56b6476d27bae4599ca55ca118aef70105c84520520945878f45b5d6e3fd896217cf7f9beb5c919735a

# Meta (se usar)
META_ACCESS_TOKEN=<token-de-acesso-meta>

# Mercado Pago (se usar)
MERCADOPAGO_ACCESS_TOKEN=<seu-token>
```

---

## TESTES DE INTEGRAÇÃO

### 1. Testar Health Check
```bash
curl http://69.62.101.194:5678/webhook/health
# Esperado: { "status": "ok" }
```

### 2. Testar Campaign Send
```bash
curl -X POST http://69.62.101.194:5678/webhook/campaign-send \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "campaignId": "123e4567-e89b-12d3-a456-426614174001",
    "channel": "whatsapp",
    "message": {
      "text": "Teste de mensagem"
    },
    "audience": [
      {
        "name": "Teste",
        "phone": "5511999999999"
      }
    ],
    "traceId": "test-123"
  }'
```

### 3. Testar WhatsApp Reply
```bash
curl -X POST http://69.62.101.194:5678/webhook/whatsapp-reply \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "lead": {
      "name": "João",
      "phone": "5511999999999",
      "leadId": "123e4567-e89b-12d3-a456-426614174002"
    },
    "message": {
      "text": "Olá, tenho interesse"
    }
  }'
```

### 4. Verificar no Backend
Após os testes, verifique os logs do backend:
```bash
docker logs -f ondeclick-backend
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Instalar n8n em `http://69.62.101.194:5678`
- [ ] Criar workflow "Campaign Send" com webhook
- [ ] Criar workflow "WhatsApp Reply" com webhook
- [ ] Criar workflow "Health Check" com webhook
- [ ] (Opcional) Criar workflow "WhatsApp Auth"
- [ ] (Opcional) Criar workflow "Create Ad Group"
- [ ] (Opcional) Criar workflow "Billing"
- [ ] (Opcional) Criar workflow "Mercado Pago"
- [ ] Configurar variáveis de ambiente no n8n
- [ ] Testar health check
- [ ] Testar campaign send com número real
- [ ] Testar recebimento de respostas
- [ ] Integrar Evolution API para WhatsApp gratuito
- [ ] Documentar credenciais obtidas

---

## INTEGRAÇÃO WHATSAPP GRATUITA - EVOLUTION API

### Instalação via Docker

```bash
# 1. Criar docker-compose para Evolution API
cat > docker-compose.evolution.yml <<EOF
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://69.62.101.194:8080
      - AUTHENTICATION_API_KEY=suachavesecreta123
    volumes:
      - evolution_data:/evolution/instances
    restart: unless-stopped

volumes:
  evolution_data:
EOF

# 2. Iniciar Evolution API
docker-compose -f docker-compose.evolution.yml up -d

# 3. Verificar se está rodando
curl http://localhost:8080/
```

### Configurar Instância do WhatsApp

```bash
# 1. Criar instância
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: suachavesecreta123" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "ondeclick-whatsapp",
    "qrcode": true
  }'

# 2. Obter QR Code
curl http://localhost:8080/instance/connect/ondeclick-whatsapp \
  -H "apikey: suachavesecreta123"

# Retorna: { "qrcode": "base64...", "status": "connecting" }

# 3. Escanear QR Code com WhatsApp
# Abra WhatsApp > Aparelhos conectados > Escanear QR Code

# 4. Verificar status
curl http://localhost:8080/instance/connectionState/ondeclick-whatsapp \
  -H "apikey: suachavesecreta123"
```

### Enviar Mensagem via Evolution API

```bash
curl -X POST http://localhost:8080/message/sendText/ondeclick-whatsapp \
  -H "apikey: suachavesecreta123" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste."
  }'
```

### Atualizar n8n para usar Evolution API

No workflow "Campaign Send", alterar o nó HTTP Request:
- **URL**: `http://evolution-api:8080/message/sendText/ondeclick-whatsapp`
- **Headers**: `apikey: suachavesecreta123`
- **Body**:
  ```json
  {
    "number": "{{ $json.phone }}",
    "text": "{{ $json.message.text }}"
  }
  ```

---

## ARQUIVOS DE EXPORTAÇÃO DO N8N

Após criar os workflows, exporte-os e salve em:
- `docs/n8n-workflows/campaign-send.json`
- `docs/n8n-workflows/whatsapp-reply.json`
- `docs/n8n-workflows/health.json`

---

## SUPORTE E DOCUMENTAÇÃO

- **n8n Docs**: https://docs.n8n.io/
- **Evolution API Docs**: https://doc.evolution-api.com/
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Meta Marketing API**: https://developers.facebook.com/docs/marketing-apis

---

## OBSERVAÇÕES IMPORTANTES

1. **Webhooks obrigatórios**: Campaign Send, WhatsApp Reply, Health Check
2. **Webhooks opcionais**: Os outros podem ser implementados depois
3. **WhatsApp gratuito**: Evolution API é 100% gratuito e sem limites
4. **Segurança**: Adicione autenticação nos webhooks do n8n se for expor publicamente
5. **Logs**: Sempre registre execuções no Supabase para auditoria
6. **Rate limiting**: Implemente controle de taxa para evitar bloqueios do WhatsApp
7. **Retry logic**: O backend já tem retry, mas adicione no n8n também

---

## PRÓXIMOS PASSOS

1. Configure o n8n com os webhooks obrigatórios
2. Instale e configure Evolution API para WhatsApp
3. Execute os testes de integração
4. Exporte os workflows criados
5. Documente as credenciais obtidas
