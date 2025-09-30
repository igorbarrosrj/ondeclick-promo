# OneClick Promo frontend

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/igor-barros-projects/v0-one-click-promo-frontend)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/KCCQWpBz84M)

## Overview

This repository now hosts both the Next.js frontend and a multi-tenant backend platform powering the OndeClick Promo marketplace. The backend is implemented in Node.js/TypeScript with Fastify, Supabase, BullMQ, OpenAI, Meta Ads, WhatsApp, n8n and Stripe adapters.

## Backend Service (`backend/`)

### Features

- Multi-tenant Supabase schema with RLS-friendly repositories and tenant-aware services
- Campaign engine with AI-assisted preparation, queue-driven publishing, Meta and WhatsApp adapters, and worker consumers
- Light CRM (leads, events, bulk re-engagement) with n8n automation hooks
- Integrations for Meta OAuth, WhatsApp, OpenAI, Stripe billing and n8n automations
- Observability via Pino logging and OpenTelemetry (OTLP exporter)

### Getting Started

```bash
pnpm install
cp .env.example .env.development # adjust values
pnpm build:backend
pnpm start:backend

# in another terminal for queue consumers
pnpm start:worker
```

- Development env variables live in `.env.development`; production secrets belong in `.env.production` and Coolify env groups.
- `pnpm seed:backend` creates a demo tenant, campaign and lead for local testing.
- REST API base path: `http://localhost:4000/api`. Health check: `/api/health`.

### Testing

```bash
pnpm test:backend
```

### Docker

See `backend/Dockerfile` (api) and `backend/Dockerfile.worker` (worker) for Coolify-ready images. Build args target Node.js 20 Alpine.

## Frontend Deployment

The existing frontend remains live at **[https://vercel.com/igor-barros-projects/v0-one-click-promo-frontend](https://vercel.com/igor-barros-projects/v0-one-click-promo-frontend)** and continues syncing through [v0.app](https://v0.app).
