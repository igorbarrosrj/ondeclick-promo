# Regras de Negócio - OndeClick Promo

Este documento descreve o fluxo completo de negócio implementado no sistema.

## Fluxo Principal

```
Landing Page → Assinatura (Mercado Pago) → WhatsApp Auth → Criar Campanha → Grupo Automático
```

---

## 1. Landing Page com Planos

### Planos Disponíveis

#### Básico - R$ 37/mês
- 2 campanhas por semana
- Relatórios simples no WhatsApp
- Aparece no canal coletivo
- Templates básicos de imagem
- Rastreamento de cupons

#### Pro - R$ 97/mês (Mais Popular)
- Campanhas ilimitadas
- Relatórios detalhados de análises
- Envios de opt-in no WhatsApp
- Posicionamento prioritário no canal
- Marca personalizada
- Testes A/B
- Suporte prioritário

#### Plus - R$ 147/mês
- Tudo do Pro
- Promotor humano (vídeos/stories)
- Selo premium
- Estratégia de campanha personalizada
- Gerente de conta dedicado
- Integrações avançadas
- Opções de marca branca

#### Add-on: Afiliados - +R$ 10/mês
- Link de indicação
- 20% de comissão vitalícia

### Implementação
- **Arquivo:** [components/landing/pricing-section.tsx](../components/landing/pricing-section.tsx)
- Ao clicar em "Começar Plano", abre modal do WhatsApp

---

## 2. Fluxo de Assinatura via Mercado Pago

### Passo 1: Usuário Clica no Plano
1. Modal WhatsApp é exibido ([WhatsAppModal.tsx](../components/WhatsAppModal.tsx))
2. Usuário clica em "Continuar no WhatsApp"
3. Frontend chama: `POST /api/whatsapp-auth/initiate`
   ```json
   {
     "whatsappNumber": "5511999999999",
     "planCode": "pro",
     "planName": "Pro"
   }
   ```

### Passo 2: Sistema Gera Token e Cria Tenant Pendente
4. Backend cria tenant com status `whatsapp_verified: false`
5. Gera código de verificação de 6 dígitos
6. Cria subscription com status `pending`
7. Retorna URL do WhatsApp com mensagem pré-preenchida

### Passo 3: Usuário Responde no WhatsApp
8. N8N recebe webhook do WhatsApp Business API
9. N8N chama: `POST /api/whatsapp-auth/webhook`
   ```json
   {
     "whatsappNumber": "5511999999999",
     "message": "123456"
   }
   ```

### Passo 4: Verificação e Criação de Pagamento
10. Se código correto:
    - Marca `whatsapp_verified: true`
    - Cria preferência de pagamento no Mercado Pago
    - Retorna `init_point` (URL de checkout)
11. N8N envia mensagem com link de pagamento

### Passo 5: Pagamento
12. Usuário paga via Mercado Pago (PIX, Cartão, etc.)
13. Mercado Pago notifica: `POST /api/mercadopago/webhook`
14. Backend atualiza subscription para `status: active`
15. N8N envia mensagem de boas-vindas

### Tecnologias
- **Backend:**
  - [whatsapp-auth-service.ts](../backend/src/services/whatsapp-auth-service.ts)
  - [mercadopago-service.ts](../backend/src/services/mercadopago-service.ts)
- **N8N Workflows:**
  - `/webhook/whatsapp-auth`
  - `/webhook/mercadopago`

---

## 3. Criação de Campanha

### Usuário NÃO tem Login Tradicional
- Identificação é **apenas pelo número do WhatsApp**
- Não existe senha ou email
- Sistema identifica usuário pelo `whatsapp_number` na tabela `tenants`

### Fluxo de Criação
1. Usuário acessa sistema (redirecionado via link do WhatsApp)
2. Sistema identifica tenant pelo WhatsApp
3. Usuário preenche formulário de campanha:
   - Nome da campanha
   - Tipo (WhatsApp Direct, Status, Broadcast)
   - Mensagem (pode usar IA para gerar)
   - Cupom e desconto (opcional)
   - Público-alvo
   - Agendamento (opcional)

4. **Automação:** Ao criar campanha, sistema:
   - Cria registro na tabela `campaigns`
   - **Automaticamente** chama `POST /api/ad-groups/create`
   - Dispara N8N para criar grupo no WhatsApp

### Implementação
- **Frontend:** [merchant/campaigns/new/page.tsx](../app/(merchant)/merchant/campaigns/new/page.tsx)
- **Backend:** [ad-group-service.ts](../backend/src/services/ad-group-service.ts)

---

## 4. Criação Automática de Grupo de Anúncio

### Processo Automático
1. **Trigger:** Campanha criada
2. **Backend chama N8N:**
   ```json
   {
     "ad_group_id": "uuid",
     "tenant_id": "uuid",
     "campaign_id": "uuid",
     "campaign_name": "Nome da Campanha",
     "whatsapp_number": "5511999999999",
     "tenant_name": "Loja do João"
   }
   ```

3. **N8N cria grupo via WhatsApp Business API:**
   - Endpoint: `POST /v21.0/{PHONE_ID}/groups`
   - Nome do grupo: `"Grupo - {campaign_name}"`
   - Descrição: `"Grupo de anúncios para {tenant_name}"`

4. **N8N retorna dados do grupo:**
   ```json
   {
     "id": "whatsapp_group_id",
     "invite_link": "https://chat.whatsapp.com/xxxx"
   }
   ```

5. **N8N notifica backend:**
   - `POST /api/ad-groups/webhook/created`
   - Backend atualiza tabela `ad_groups` com `whatsapp_group_id` e `invite_link`

### Identificação do Cliente
- Grupo é identificado pelo **número do WhatsApp** do tenant
- Não há necessidade de criar conta separada
- Tudo vinculado ao `whatsapp_number`

### Implementação
- **Backend:** [ad-group-service.ts](../backend/src/services/ad-group-service.ts)
- **N8N:** `/webhook/create-ad-group` (ver [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md))
- **Banco:** Tabela `ad_groups` (ver [0001_init.sql](../backend/sql/0001_init.sql#L185-196))

---

## 5. Estrutura do Banco de Dados

### Tabela: `tenants`
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp_number TEXT UNIQUE,        -- NOVO
  whatsapp_verified BOOLEAN DEFAULT false, -- NOVO
  whatsapp_verification_token TEXT,   -- NOVO
  ...
)
```

### Tabela: `plan_subscriptions`
```sql
CREATE TABLE plan_subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id), -- NOVO
  plan_code TEXT NOT NULL,
  plan_name TEXT,                     -- NOVO
  status TEXT CHECK (status IN ('active','past_due','canceled','pending')),
  payment_provider TEXT DEFAULT 'mercadopago', -- NOVO
  payment_provider_id TEXT,           -- NOVO
  payment_provider_data JSONB,        -- NOVO
  ...
)
```

### Tabela: `ad_groups` (NOVA)
```sql
CREATE TABLE ad_groups (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  campaign_id UUID REFERENCES campaigns(id),
  whatsapp_group_id TEXT,
  whatsapp_group_invite_link TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('creating','active','paused','archived')),
  ...
)
```

---

## 6. APIs Criadas

### WhatsApp Authentication
- `POST /api/whatsapp-auth/initiate` - Iniciar autenticação
- `POST /api/whatsapp-auth/webhook` - Validar código
- `GET /api/whatsapp-auth/check/:whatsappNumber` - Verificar status

### Mercado Pago
- `POST /api/mercadopago/create-preference` - Criar checkout
- `POST /api/mercadopago/webhook` - Webhook de pagamentos

### Ad Groups
- `POST /api/ad-groups/create` - Criar grupo para campanha
- `POST /api/ad-groups/webhook/created` - Webhook N8N (grupo criado)
- `POST /api/ad-groups/:id/add-customer` - Adicionar cliente ao grupo
- `GET /api/ad-groups/campaign/:campaignId` - Listar grupos
- `GET /api/ad-groups/:id/invite-link` - Obter link de convite

---

## 7. Resumo do Fluxo Completo

```
1. Usuário acessa Landing Page
   ↓
2. Clica em "Começar Plano Pro"
   ↓
3. Sistema inicia auth WhatsApp e cria tenant pendente
   ↓
4. Usuário recebe código no WhatsApp
   ↓
5. Usuário responde com código
   ↓
6. Sistema verifica e marca como autenticado
   ↓
7. Sistema cria checkout Mercado Pago
   ↓
8. Usuário recebe link de pagamento no WhatsApp
   ↓
9. Usuário paga via PIX/Cartão
   ↓
10. Mercado Pago notifica webhook
    ↓
11. Sistema ativa subscription
    ↓
12. Usuário recebe boas-vindas no WhatsApp
    ↓
13. Usuário cria primeira campanha
    ↓
14. Sistema AUTOMATICAMENTE cria grupo no WhatsApp
    ↓
15. N8N cria grupo e retorna link
    ↓
16. Grupo pronto para adicionar clientes
```

---

## 8. Diferenças do Fluxo Anterior

### ❌ Antes
- Login tradicional com email/senha
- Stripe para pagamentos
- Sem criação automática de grupos
- Usuário tinha que criar grupos manualmente

### ✅ Agora
- Login APENAS via WhatsApp (sem senha)
- Mercado Pago (PIX, Cartão, etc.)
- Grupo criado AUTOMATICAMENTE ao criar campanha
- Identificação por `whatsapp_number`
- Tudo integrado via N8N

---

## Próximos Passos

1. ✅ Implementar workflows no N8N (ver [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md))
2. ✅ Configurar Coolify para deploy (ver [COOLIFY_SETUP.md](./COOLIFY_SETUP.md))
3. Testar fluxo completo em ambiente de homologação
4. Configurar webhook do Mercado Pago
5. Obter credenciais WhatsApp Business API
6. Deploy em produção
