# Configuração do Coolify

Este documento descreve como configurar o projeto no Coolify para deploy em produção.

## Pré-requisitos

- Servidor com Coolify instalado
- Acesso ao repositório Git
- Domínio configurado (opcional, mas recomendado)

---

## 1. Criar Novo Projeto no Coolify

1. Acessar o painel do Coolify
2. Clicar em **"New Resource"**
3. Selecionar **"Application"**
4. Escolher **"Docker Compose"**

---

## 2. Configurar Repositório

### Informações do Repositório
- **Repository URL:** `https://github.com/seu-usuario/ondeclick-promo`
- **Branch:** `main` (ou `production`)
- **Build Pack:** Docker Compose

---

## 3. Variáveis de Ambiente

Adicionar as seguintes variáveis de ambiente no Coolify:

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=http://seu-ip:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### OpenAI
```env
OPENAI_API_KEY=sk-proj-...
```

### N8N
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

### Meta/Facebook
```env
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_REDIRECT_URI=https://seu-dominio.com/integrations/meta/callback
META_LONG_LIVED_TOKEN_SECRET=sua_secret_32_chars_minimo
```

### WhatsApp Business API
```env
WHATSAPP_BASE_URL=https://graph.facebook.com/v21.0
WHATSAPP_TOKEN=seu_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_de_verificacao
```

### Mercado Pago
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=seu_secret_webhook
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

### Redis
```env
REDIS_URL=redis://redis:6379
```

### Aplicação
```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
JWT_SIGNING_KEY=sua_chave_jwt_32_chars_minimo
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
QUEUE_PREFIX=ondeclick
FEATURE_TIKTOK_ENABLED=false
RATE_LIMIT_MAX=200
RATE_LIMIT_TIME_WINDOW_MS=60000
```

---

## 4. Docker Compose

O projeto já possui um `docker-compose.yml`. Certifique-se de que ele está configurado corretamente:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=${NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY}
    depends_on:
      - backend
      - redis

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - N8N_BASE_URL=${N8N_BASE_URL}
      - N8N_WEBHOOK_CAMPAIGN_SEND=${N8N_WEBHOOK_CAMPAIGN_SEND}
      - N8N_WEBHOOK_WHATSAPP_REPLY=${N8N_WEBHOOK_WHATSAPP_REPLY}
      - N8N_WEBHOOK_WHATSAPP_AUTH=${N8N_WEBHOOK_WHATSAPP_AUTH}
      - N8N_WEBHOOK_CREATE_AD_GROUP=${N8N_WEBHOOK_CREATE_AD_GROUP}
      - N8N_WEBHOOK_BILLING=${N8N_WEBHOOK_BILLING}
      - N8N_WEBHOOK_MERCADOPAGO=${N8N_WEBHOOK_MERCADOPAGO}
      - N8N_WEBHOOK_HEALTH=${N8N_WEBHOOK_HEALTH}
      - WHATSAPP_BASE_URL=${WHATSAPP_BASE_URL}
      - WHATSAPP_TOKEN=${WHATSAPP_TOKEN}
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - WHATSAPP_BUSINESS_ACCOUNT_ID=${WHATSAPP_BUSINESS_ACCOUNT_ID}
      - WHATSAPP_WEBHOOK_VERIFY_TOKEN=${WHATSAPP_WEBHOOK_VERIFY_TOKEN}
      - MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}
      - MERCADOPAGO_PUBLIC_KEY=${MERCADOPAGO_PUBLIC_KEY}
      - MERCADOPAGO_WEBHOOK_SECRET=${MERCADOPAGO_WEBHOOK_SECRET}
      - REDIS_URL=${REDIS_URL}
      - JWT_SIGNING_KEY=${JWT_SIGNING_KEY}
      - META_APP_ID=${META_APP_ID}
      - META_APP_SECRET=${META_APP_SECRET}
      - META_REDIRECT_URI=${META_REDIRECT_URI}
      - META_LONG_LIVED_TOKEN_SECRET=${META_LONG_LIVED_TOKEN_SECRET}
    depends_on:
      - redis

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      # Mesmas variáveis do backend
      - NODE_ENV=${NODE_ENV}
      # ... (copiar todas do backend)
    depends_on:
      - redis
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 5. Dockerfiles

### Dockerfile.frontend
```dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### Dockerfile.backend
```dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:backend

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
```

### Dockerfile.worker
```dockerfile
FROM node:20-alpine AS base

# Mesma estrutura do backend, mas CMD diferente
# ...

CMD ["node", "backend/dist/worker.js"]
```

---

## 6. Configurar Domínio

1. No Coolify, vá em **Settings** > **Domains**
2. Adicionar domínio: `app.seu-dominio.com`
3. Coolify gerará automaticamente certificado SSL via Let's Encrypt

---

## 7. Configurar N8N Separadamente

O N8N deve rodar em um container separado:

1. Criar novo Resource no Coolify
2. Tipo: **Docker Image**
3. Image: `n8nio/n8n:latest`
4. Porta: `5678`
5. Volume: `/root/.n8n` (persistir workflows)

### Variáveis de Ambiente do N8N
```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sua_senha_forte
WEBHOOK_URL=https://n8n.seu-dominio.com
N8N_HOST=n8n.seu-dominio.com
N8N_PORT=5678
N8N_PROTOCOL=https
NODE_ENV=production
```

---

## 8. Deploy

1. Commit e push para o repositório
2. No Coolify, clicar em **Deploy**
3. Acompanhar os logs em tempo real
4. Aguardar conclusão

---

## 9. Pós-Deploy

### Verificar Health Check
```bash
curl https://seu-dominio.com/api/health
# Resposta esperada: {"status":"ok"}
```

### Rodar Migrations do Banco
```bash
# Conectar no Supabase e executar:
psql -h seu-supabase -U postgres -d postgres -f backend/sql/0001_init.sql
```

### Configurar Webhooks do Mercado Pago
1. Acessar painel do Mercado Pago
2. Ir em **Webhooks**
3. Adicionar URL: `https://seu-dominio.com/api/mercadopago/webhook`
4. Selecionar eventos: `payment`

### Configurar Webhook do WhatsApp
1. Acessar Meta for Developers
2. Ir em WhatsApp > Configuration
3. Callback URL: `https://seu-dominio.com/api/whatsapp-auth/webhook`
4. Verify Token: (usar o mesmo do `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)

---

## Troubleshooting

### Containers não iniciam
- Verificar logs no Coolify
- Verificar se todas as variáveis de ambiente estão configuradas
- Verificar se Redis está acessível

### Backend não conecta no Supabase
- Verificar se `SUPABASE_SERVICE_ROLE_KEY` está correta
- Verificar se IP do Coolify está na whitelist do Supabase

### N8N não recebe webhooks
- Verificar se URL está acessível publicamente
- Verificar SSL do domínio
- Testar com `curl`

---

## Backup e Monitoramento

### Backup
- Configurar backup automático do volume Redis
- Fazer backup regular do Supabase
- Versionar workflows do N8N

### Monitoramento
- Configurar alertas no Coolify
- Monitorar uso de CPU/Memória
- Configurar logs centralizados (opcional)
