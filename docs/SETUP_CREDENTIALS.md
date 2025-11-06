# Como Obter e Configurar Credenciais

Este guia explica como obter todas as credenciais necessárias para o projeto funcionar.

---

## 1. WhatsApp Business API

### Passo 1: Criar Conta Meta for Developers
1. Acessar: https://developers.facebook.com/
2. Criar uma conta ou fazer login
3. Criar um novo App:
   - Tipo: **Business**
   - Nome: `OndeClick Promo WhatsApp`

### Passo 2: Adicionar WhatsApp Product
1. No painel do app, clicar em **"Add Product"**
2. Selecionar **"WhatsApp"**
3. Clicar em **"Set Up"**

### Passo 3: Obter Credenciais
1. Ir em **WhatsApp** > **Getting Started**
2. Copiar:
   - `WHATSAPP_TOKEN` (Temporary Access Token - depois gerar permanente)
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`

### Passo 4: Gerar Token Permanente
```bash
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={TEMPORARY_TOKEN}"
```

### Passo 5: Configurar Webhook
1. Ir em **WhatsApp** > **Configuration**
2. Em **Webhook**, clicar em **Edit**
3. Callback URL: `https://seu-dominio.com/api/whatsapp-auth/webhook`
4. Verify Token: Criar um token aleatório (ex: `meu_token_123`)
   - Guardar em `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. Webhook Fields: Selecionar `messages`

### Passo 6: Adicionar Número de Telefone
1. Ir em **WhatsApp** > **Phone Numbers**
2. Adicionar seu número de telefone comercial
3. Verificar o número

**⚠️ Importante:**
- Modo de produção requer **Meta Business Verification**
- No modo de teste, só funciona com números cadastrados

---

## 2. Mercado Pago

### Passo 1: Criar Conta
1. Acessar: https://www.mercadopago.com.br/
2. Criar conta business

### Passo 2: Acessar Painel de Desenvolvedores
1. Ir para: https://www.mercadopago.com.br/developers/
2. Fazer login

### Passo 3: Criar Aplicação
1. Clicar em **"Suas aplicações"** > **"Criar aplicação"**
2. Nome: `OndeClick Promo`
3. Modelo de integração: **Pagamentos online**
4. Produto: **Checkout Pro**

### Passo 4: Obter Credenciais
1. Acessar **Suas aplicações** > **OndeClick Promo**
2. Ir em **Credenciais de produção** (ou teste)
3. Copiar:
   - `MERCADOPAGO_PUBLIC_KEY` (Public key)
   - `MERCADOPAGO_ACCESS_TOKEN` (Access token)

### Passo 5: Configurar Webhook
1. No painel da aplicação, ir em **Webhooks**
2. Clicar em **Configurar notificações**
3. URL de produção: `https://seu-dominio.com/api/mercadopago/webhook`
4. Eventos: Selecionar **Pagamentos**

### Passo 6: Gerar Secret do Webhook (opcional)
```bash
# Gerar secret aleatório
openssl rand -base64 32
```
Guardar em `MERCADOPAGO_WEBHOOK_SECRET`

**📝 Notas:**
- Ambiente de teste usa `TEST-xxx` credentials
- Ambiente de produção usa `APP_USR-xxx` credentials
- PIX só funciona em produção

---

## 3. Supabase

### Opção A: Usar Supabase Cloud
1. Acessar: https://supabase.com/
2. Criar novo projeto
3. Nome: `ondeclick-promo`
4. Database Password: (criar senha forte)
5. Region: `South America (São Paulo)`

#### Obter Credenciais
1. Ir em **Settings** > **API**
2. Copiar:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret)

### Opção B: Self-Hosted (Seu servidor)
Se você já está usando no IP `69.62.101.194:8000`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://69.62.101.194:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=b8942dae583827aedd950b3ddc40368d5d713378d97e54dc1016612c0cff861f
SUPABASE_SERVICE_ROLE_KEY=ba6363ed57e79c16ea83459c2087c8e00c7d27c2e034e56b6476d27bae4599ca55ca118aef70105c84520520945878f45b5d6e3fd896217cf7f9beb5c919735a
```

#### Rodar Migrations
```bash
# Conectar ao PostgreSQL do Supabase
psql -h 69.62.101.194 -p 5432 -U postgres -d postgres

# Executar migration
\i backend/sql/0001_init.sql
```

---

## 4. OpenAI

### Passo 1: Criar Conta
1. Acessar: https://platform.openai.com/
2. Criar conta

### Passo 2: Adicionar Créditos
1. Ir em **Billing** > **Add payment method**
2. Adicionar cartão de crédito
3. Adicionar pelo menos $5 em créditos

### Passo 3: Gerar API Key
1. Ir em **API Keys**
2. Clicar em **Create new secret key**
3. Nome: `ondeclick-promo`
4. Copiar: `OPENAI_API_KEY`

**⚠️ Importante:**
- Guardar a chave em local seguro
- OpenAI não mostra a chave novamente
- Rotear por proxy se quiser controlar custos

---

## 5. Redis (Opcional - se não usar Docker)

### Opção A: Redis Cloud
1. Acessar: https://redis.com/try-free/
2. Criar conta gratuita
3. Criar database
4. Copiar: `REDIS_URL`

### Opção B: Redis Local/Docker
Se estiver usando Docker (recomendado):
```env
REDIS_URL=redis://redis:6379
```

Se estiver local:
```bash
# Instalar Redis
sudo apt install redis-server

# URL
REDIS_URL=redis://localhost:6379
```

---

## 6. Meta/Facebook (Para Ads)

Caso queira integrar com Facebook/Instagram Ads:

### Passo 1: Meta Business Manager
1. Acessar: https://business.facebook.com/
2. Criar Business Manager

### Passo 2: Criar App no Developers
1. https://developers.facebook.com/
2. Criar novo App (tipo Business)

### Passo 3: Adicionar Marketing API
1. Adicionar produto **Marketing API**
2. Obter:
   - `META_APP_ID`
   - `META_APP_SECRET`

### Passo 4: OAuth Redirect
```env
META_REDIRECT_URI=https://seu-dominio.com/integrations/meta/callback
```

### Passo 5: Long-Lived Token Secret
```bash
# Gerar secret de 32 caracteres
openssl rand -hex 16
```
Guardar em `META_LONG_LIVED_TOKEN_SECRET`

---

## 7. Secrets da Aplicação

### JWT Signing Key
```bash
openssl rand -hex 16
```
Guardar em `JWT_SIGNING_KEY` (mínimo 32 caracteres)

### WhatsApp Webhook Verify Token
Criar token aleatório:
```bash
openssl rand -hex 16
```
Guardar em `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

---

## 8. N8N

### Configuração
Se estiver rodando N8N separadamente:

1. Acessar painel do N8N: `http://seu-ip:5678`
2. Criar workflows conforme [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)
3. URLs dos webhooks:
   ```env
   N8N_BASE_URL=http://seu-ip:5678
   N8N_WEBHOOK_CAMPAIGN_SEND=http://seu-ip:5678/webhook/campaign-send
   N8N_WEBHOOK_WHATSAPP_REPLY=http://seu-ip:5678/webhook/whatsapp-reply
   N8N_WEBHOOK_WHATSAPP_AUTH=http://seu-ip:5678/webhook/whatsapp-auth
   N8N_WEBHOOK_CREATE_AD_GROUP=http://seu-ip:5678/webhook/create-ad-group
   N8N_WEBHOOK_BILLING=http://seu-ip:5678/webhook/billing
   N8N_WEBHOOK_MERCADOPAGO=http://seu-ip:5678/webhook/mercadopago
   N8N_WEBHOOK_HEALTH=http://seu-ip:5678/webhook/health
   ```

---

## 9. Arquivo .env Final

Copiar `.env.example` para `.env.production`:

```bash
cp .env.example .env.production
```

Preencher com todas as credenciais obtidas acima.

### Validar Configuração

```bash
# No backend
npm run build:backend

# Se não houver erros, variáveis estão OK
```

---

## 10. Checklist de Credenciais

- [ ] WhatsApp Business API configurado
- [ ] WhatsApp Token permanente gerado
- [ ] WhatsApp Webhook configurado
- [ ] Mercado Pago aplicação criada
- [ ] Mercado Pago webhook configurado
- [ ] Supabase migrations rodadas
- [ ] OpenAI API Key obtida
- [ ] Redis configurado
- [ ] JWT Secret gerado
- [ ] N8N workflows criados
- [ ] Todas as variáveis no `.env` preenchidas

---

## Troubleshooting

### WhatsApp não envia mensagens
- Verificar se token é permanente (não temporary)
- Verificar se número está verificado
- Verificar se app está em modo produção

### Mercado Pago não notifica webhook
- Verificar se URL está acessível publicamente
- Testar webhook com ngrok primeiro
- Verificar logs do Mercado Pago

### OpenAI retorna erro 429
- Adicionar créditos na conta
- Verificar rate limits
- Usar modelo mais barato (gpt-3.5-turbo)

### Redis connection refused
- Verificar se Redis está rodando
- Verificar URL/porta corretas
- Verificar firewall
