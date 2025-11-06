# Workflows N8N Necessários

Este documento descreve todos os workflows que precisam ser configurados no N8N para o sistema funcionar corretamente.

## 1. Workflow: WhatsApp Authentication (`/webhook/whatsapp-auth`)

**Propósito:** Processar autenticação de novos usuários via WhatsApp

### Trigger
- **Tipo:** Webhook
- **Método:** POST
- **Path:** `/webhook/whatsapp-auth`

### Fluxo
1. **Receber dados:**
   ```json
   {
     "event": "whatsapp_verified",
     "tenant_id": "uuid",
     "whatsapp_number": "5511999999999"
   }
   ```

2. **Enviar mensagem de boas-vindas via WhatsApp Business API:**
   - Endpoint: `https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
   - Headers: `Authorization: Bearer {WHATSAPP_TOKEN}`
   - Body:
     ```json
     {
       "messaging_product": "whatsapp",
       "to": "{whatsapp_number}",
       "type": "text",
       "text": {
         "body": "🎉 Bem-vindo ao OndeClick Promo! Sua conta foi ativada com sucesso. Agora você pode criar suas campanhas e começar a promover seu negócio!"
       }
     }
     ```

3. **Criar campanha de boas-vindas (opcional)**
4. **Notificar admin via Slack/Email (opcional)**

---

## 2. Workflow: Create Ad Group (`/webhook/create-ad-group`)

**Propósito:** Criar grupo do WhatsApp automaticamente quando uma campanha é criada

### Trigger
- **Tipo:** Webhook
- **Método:** POST
- **Path:** `/webhook/create-ad-group`

### Fluxo

#### A. Criar Grupo
1. **Receber dados:**
   ```json
   {
     "ad_group_id": "uuid",
     "tenant_id": "uuid",
     "campaign_id": "uuid",
     "campaign_name": "Nome da Campanha",
     "whatsapp_number": "5511999999999",
     "tenant_name": "Nome do Cliente"
   }
   ```

2. **Criar grupo via WhatsApp Business API:**
   - Endpoint: `https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/groups`
   - Headers: `Authorization: Bearer {WHATSAPP_TOKEN}`
   - Body:
     ```json
     {
       "subject": "Grupo - {campaign_name}",
       "description": "Grupo de anúncios automático para: {tenant_name}"
     }
     ```

3. **Capturar resposta:**
   ```json
   {
     "id": "whatsapp_group_id",
     "invite_link": "https://chat.whatsapp.com/xxxx"
   }
   ```

4. **Atualizar banco via API:**
   - POST `http://backend:4000/api/ad-groups/webhook/created`
   - Body:
     ```json
     {
       "adGroupId": "{ad_group_id}",
       "whatsappGroupId": "{whatsapp_group_id}",
       "inviteLink": "{invite_link}"
     }
     ```

#### B. Adicionar Participante ao Grupo
1. **Receber dados:**
   ```json
   {
     "action": "add_participant",
     "whatsapp_group_id": "group_id",
     "participant_number": "5511888888888",
     "participant_name": "João Silva"
   }
   ```

2. **Adicionar ao grupo via API:**
   - Endpoint: `https://graph.facebook.com/v21.0/{whatsapp_group_id}/participants`
   - Body:
     ```json
     {
       "participants": ["{participant_number}"]
     }
     ```

---

## 3. Workflow: Mercado Pago Webhook (`/webhook/mercadopago`)

**Propósito:** Processar notificações de pagamento do Mercado Pago

### Trigger
- **Tipo:** Webhook
- **Método:** POST
- **Path:** `/webhook/mercadopago`

### Fluxo
1. **Receber notificação do Mercado Pago:**
   ```json
   {
     "type": "payment",
     "data": {
       "id": "payment_id"
     }
   }
   ```

2. **Encaminhar para backend:**
   - POST `http://backend:4000/api/mercadopago/webhook`
   - Passar o body completo

3. **Log da transação** (opcional para auditoria)

---

## 4. Workflow: Campaign Send (Já existe - ajustes necessários)

**Propósito:** Enviar campanhas via WhatsApp

### Path
`/webhook/campaign-send`

### Ajustes Necessários
- Verificar se tenant tem `whatsapp_verified = true`
- Ao enviar, verificar se deve adicionar usuário ao grupo de anúncio
- Se campanha tem ad_group associado, incluir link do grupo na mensagem

### Exemplo de mensagem com grupo:
```
🎉 {mensagem_da_campanha}

💬 Participe do nosso grupo exclusivo:
{invite_link}
```

---

## 5. Workflow: WhatsApp Reply (Ajustes necessários)

**Propósito:** Processar respostas de usuários no WhatsApp

### Path
`/webhook/whatsapp-reply`

### Ajustes Necessários

#### A. Se for código de verificação
1. Verificar se mensagem contém apenas números (6 dígitos)
2. Encaminhar para: `POST /api/whatsapp-auth/webhook`
   ```json
   {
     "whatsappNumber": "5511999999999",
     "message": "123456"
   }
   ```

#### B. Se for resposta normal
1. Continuar fluxo existente de leads/conversas

---

## Variáveis de Ambiente Necessárias no N8N

```env
# WhatsApp Business API
WHATSAPP_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_account_id

# Backend API
BACKEND_URL=http://backend:4000

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
```

---

## Ordem de Implementação Recomendada

1. ✅ **WhatsApp Authentication** - Essencial para login
2. ✅ **Mercado Pago Webhook** - Essencial para pagamentos
3. ✅ **Create Ad Group** - Essencial para grupos automáticos
4. ⚠️ **Campaign Send** (ajustar existente)
5. ⚠️ **WhatsApp Reply** (ajustar existente)

---

## Testes

### Testar WhatsApp Auth
```bash
curl -X POST http://n8n:5678/webhook/whatsapp-auth \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_verified",
    "tenant_id": "test-uuid",
    "whatsapp_number": "5511999999999"
  }'
```

### Testar Create Ad Group
```bash
curl -X POST http://n8n:5678/webhook/create-ad-group \
  -H "Content-Type: application/json" \
  -d '{
    "ad_group_id": "test-uuid",
    "tenant_id": "test-tenant",
    "campaign_id": "test-campaign",
    "campaign_name": "Teste",
    "whatsapp_number": "5511999999999",
    "tenant_name": "Loja Teste"
  }'
```

---

## Troubleshooting

### Webhook não está sendo chamado
- Verificar se a URL está correta no `.env`
- Verificar logs do N8N
- Testar com curl primeiro

### WhatsApp API retorna erro
- Verificar se `WHATSAPP_TOKEN` está válido
- Verificar se `WHATSAPP_PHONE_NUMBER_ID` está correto
- Verificar permissões da Business App

### Grupo não é criado
- Verificar se WhatsApp Business API tem permissão para criar grupos
- Alguns tipos de conta podem não ter essa funcionalidade
- Considerar criar grupos manualmente como fallback
