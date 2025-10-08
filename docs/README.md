# OndeClick Promo - Documentação Completa

Sistema de marketing via WhatsApp com autenticação simplificada e criação automática de grupos de anúncio.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Regras de Negócio](#regras-de-negócio)
3. [Arquitetura](#arquitetura)
4. [Setup e Deploy](#setup-e-deploy)
5. [Documentação Detalhada](#documentação-detalhada)

---

## 🎯 Visão Geral

### O que foi implementado?

✅ **Login via WhatsApp (sem senha)**
- Autenticação por código de 6 dígitos enviado pelo WhatsApp
- Identificação única pelo número de telefone
- Sem necessidade de email ou senha

✅ **Pagamento via Mercado Pago**
- Substituído Stripe por Mercado Pago
- Suporte a PIX, Cartão, Boleto
- Webhooks para confirmação automática

✅ **Criação Automática de Grupos de Anúncio**
- Ao criar campanha, grupo do WhatsApp é criado automaticamente
- Integração via N8N e WhatsApp Business API
- Link de convite gerado automaticamente

✅ **Banco de Dados Atualizado**
- Novos campos para WhatsApp (`whatsapp_number`, `whatsapp_verified`)
- Tabela `ad_groups` para grupos de anúncio
- Suporte a múltiplos payment providers

---

## 📊 Regras de Negócio

### Fluxo Completo

```
Landing Page
    ↓
Escolhe Plano (R$ 37, R$ 97, R$ 147)
    ↓
Clica "Começar"
    ↓
Sistema envia código no WhatsApp
    ↓
Usuário responde com código
    ↓
Sistema verifica e cria checkout Mercado Pago
    ↓
Usuário paga via PIX/Cartão
    ↓
Conta ativada!
    ↓
Usuário cria primeira campanha
    ↓
✨ GRUPO DO WHATSAPP CRIADO AUTOMATICAMENTE ✨
    ↓
Cliente pode adicionar pessoas ao grupo
```

### Diferenças do Sistema Anterior

| Antes | Agora |
|-------|-------|
| Login com email/senha | Login apenas com WhatsApp |
| Stripe | Mercado Pago (PIX, Cartão) |
| Grupos criados manualmente | **Grupos automáticos via N8N** |
| Conta tradicional | Identificação por telefone |

**📖 Detalhes completos:** [BUSINESS_RULES.md](./BUSINESS_RULES.md)

---

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend:** Next.js 14 + React + TypeScript
- **Backend:** Fastify + TypeScript
- **Banco:** PostgreSQL (via Supabase)
- **Cache/Queue:** Redis + BullMQ
- **Automação:** N8N
- **Pagamento:** Mercado Pago API
- **Mensageria:** WhatsApp Business API

### Novos Services Criados

1. **MercadoPagoService** ([mercadopago-service.ts](../backend/src/services/mercadopago-service.ts))
   - Criação de preferências de pagamento
   - Processamento de webhooks
   - Atualização de subscriptions

2. **WhatsAppAuthService** ([whatsapp-auth-service.ts](../backend/src/services/whatsapp-auth-service.ts))
   - Geração de códigos de verificação
   - Validação de autenticação
   - Gerenciamento de tokens

3. **AdGroupService** ([ad-group-service.ts](../backend/src/services/ad-group-service.ts))
   - Criação automática de grupos
   - Integração com N8N
   - Gerenciamento de participantes

### Novas Rotas da API

#### WhatsApp Auth
- `POST /api/whatsapp-auth/initiate` - Iniciar auth
- `POST /api/whatsapp-auth/webhook` - Validar código
- `GET /api/whatsapp-auth/check/:number` - Status

#### Mercado Pago
- `POST /api/mercadopago/create-preference` - Checkout
- `POST /api/mercadopago/webhook` - Notificações

#### Ad Groups
- `POST /api/ad-groups/create` - Criar grupo
- `POST /api/ad-groups/webhook/created` - Callback N8N
- `GET /api/ad-groups/campaign/:id` - Listar grupos
- `GET /api/ad-groups/:id/invite-link` - Link convite

---

## 🚀 Setup e Deploy

### 1. Pré-requisitos

```bash
# Node.js 20+
node --version

# Docker (para Redis)
docker --version

# PostgreSQL (Supabase)
```

### 2. Instalação

```bash
# Clonar repositório
git clone <repo>
cd ondeclick-promo

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env.production
```

### 3. Configurar Credenciais

**⚠️ IMPORTANTE:** Obter todas as credenciais antes de continuar

**📖 Ver guia completo:** [SETUP_CREDENTIALS.md](./SETUP_CREDENTIALS.md)

Resumo do que você precisa:
- WhatsApp Business API (Token + Phone ID)
- Mercado Pago (Public Key + Access Token)
- Supabase (URL + Keys)
- OpenAI (API Key)
- Redis (URL)

### 4. Rodar Migrations

```bash
# Conectar no Supabase
psql -h seu-supabase -U postgres -d postgres

# Executar migration
\i backend/sql/0001_init.sql
```

### 5. Iniciar Desenvolvimento

```bash
# Frontend
npm run dev

# Backend (em outro terminal)
npm run dev:backend

# Worker (em outro terminal)
npm run start:worker
```

### 6. Deploy em Produção

**📖 Ver guia completo:** [COOLIFY_SETUP.md](./COOLIFY_SETUP.md)

Resumo:
1. Configurar Coolify
2. Adicionar variáveis de ambiente
3. Deploy via Docker Compose
4. Configurar N8N separadamente
5. Configurar webhooks (Mercado Pago, WhatsApp)

---

## 📚 Documentação Detalhada

### Documentos Disponíveis

| Documento | Descrição |
|-----------|-----------|
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Regras de negócio completas |
| [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md) | Workflows necessários no N8N |
| [COOLIFY_SETUP.md](./COOLIFY_SETUP.md) | Deploy com Coolify |
| [SETUP_CREDENTIALS.md](./SETUP_CREDENTIALS.md) | Como obter todas as credenciais |

### Arquivos Importantes

#### Backend
- [0001_init.sql](../backend/sql/0001_init.sql) - Schema do banco
- [env.ts](../backend/src/config/env.ts) - Configuração de variáveis
- [container.ts](../backend/src/adapters/next/container.ts) - DI Container

#### Frontend
- [pricing-section.tsx](../components/landing/pricing-section.tsx) - Planos
- [WhatsAppModal.tsx](../components/WhatsAppModal.tsx) - Modal de auth

---

## 🔧 Configuração do N8N

### Workflows Necessários

1. **WhatsApp Authentication** (`/webhook/whatsapp-auth`)
   - Enviar mensagem de boas-vindas
   - Criar checkout no Mercado Pago

2. **Create Ad Group** (`/webhook/create-ad-group`)
   - Criar grupo via WhatsApp Business API
   - Retornar link de convite

3. **Mercado Pago Webhook** (`/webhook/mercadopago`)
   - Processar notificações de pagamento
   - Ativar subscriptions

4. **WhatsApp Reply** (ajustar existente)
   - Detectar códigos de verificação
   - Encaminhar para auth webhook

**📖 Detalhes completos:** [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)

---

## ✅ Checklist de Deploy

### Backend
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodadas no banco
- [ ] Redis conectado
- [ ] Build sem erros
- [ ] Health check funcionando

### N8N
- [ ] Workflows criados
- [ ] Webhooks acessíveis publicamente
- [ ] Variáveis de ambiente configuradas
- [ ] WhatsApp Business API conectada

### Mercado Pago
- [ ] Aplicação criada
- [ ] Webhook configurado
- [ ] Credenciais de produção obtidas

### WhatsApp
- [ ] App criado no Meta for Developers
- [ ] Token permanente gerado
- [ ] Webhook configurado
- [ ] Número verificado

---

## 🐛 Troubleshooting

### "WhatsApp não envia mensagens"
- Verificar se `WHATSAPP_TOKEN` é permanente
- Verificar se número está em modo produção
- Ver logs do Meta for Developers

### "Mercado Pago webhook não funciona"
- Verificar se URL está acessível publicamente
- Testar com ngrok primeiro
- Ver logs do Mercado Pago

### "Grupo não é criado automaticamente"
- Verificar logs do N8N
- Verificar se workflow está ativo
- Verificar permissões da WhatsApp Business API

### "Build falha no backend"
- Verificar se todas as variáveis obrigatórias estão no .env
- Rodar `npm run build:backend` para ver erros
- Verificar versão do Node (20+)

---

## 📞 Suporte

- **Problemas com N8N:** Ver logs em `http://n8n:5678`
- **Problemas com WhatsApp:** https://developers.facebook.com/support/
- **Problemas com Mercado Pago:** https://www.mercadopago.com.br/developers/

---

## 🎉 Próximos Passos

1. ✅ Implementar workflows no N8N
2. ✅ Obter credenciais do WhatsApp Business
3. ✅ Obter credenciais do Mercado Pago
4. ⬜ Testar fluxo completo em homologação
5. ⬜ Deploy em produção com Coolify
6. ⬜ Monitorar logs e métricas

---

**Última atualização:** 2025-10-08

**Versão:** 2.0.0 (WhatsApp Auth + Mercado Pago + Auto Ad Groups)
