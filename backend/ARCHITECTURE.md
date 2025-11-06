# OndeClick Promo Backend Architecture

## Overview

The backend is a Fastify service with multi-tenant Supabase persistence, queue-driven workers, and adapters for Meta Ads, WhatsApp, n8n automations, Stripe billing, and OpenAI-generated creatives. A shared dependency container powers the HTTP API, background workers, and optional Next.js API adapters.

```
backend/
├── src/
│   ├── adapters/         # Meta, WhatsApp, Next.js, etc.
│   ├── clients/          # External clients (n8n, etc.)
│   ├── config/           # Env validation, logger, telemetry, Redis, Supabase
│   ├── core/             # DI container, errors, auth context, tokens
│   ├── modules/          # Fastify route groups (tenants, campaigns, integrations...)
│   ├── queues/           # BullMQ queue helpers and queue service
│   ├── repositories/     # Supabase data access layer
│   ├── services/         # Domain logic per capability
│   ├── utils/            # Helpers (crypto, retry, ids, circuit breaker)
│   ├── app.ts            # Fastify instance builder
│   ├── server.ts         # HTTP entrypoint
│   └── worker.ts         # BullMQ worker entrypoint
├── scripts/              # Seed/data utilities
├── sql/                  # Migration-ready SQL
├── tests/                # Vitest suites
├── Dockerfile            # API container
├── Dockerfile.worker     # Worker container
├── tsconfig.*            # TypeScript configs
└── vitest.config.ts
```

## Dependency Container

Shared dependencies are registered in `core/tokens.ts` and hydrated via `adapters/next/container.ts`. The same container powers:

- Fastify server (`src/server.ts`)
- BullMQ workers (`src/worker.ts`)
- Optional Next.js API handlers (`src/adapters/next/*.ts`)

## Multi-Tenancy

- Every table stores `tenant_id`. Repository methods receive the tenant scope explicitly.
- Auth middleware currently expects `x-user-id`, `x-tenant-id`, `x-roles`. Replace with Supabase JWT validation when hooking into the auth gateway.
- Row Level Security policies must be enforced inside Supabase (see `sql/0001_init.sql`).

## Queues & Workers

- `queue-service.ts` enqueues jobs to `metaPublish`, `whatsappSend`, `aiGenerate`, `reengage` with exponential backoff.
- Workers in `src/worker.ts` consume each queue, call adapters, and log results.

## Integrations

- Meta OAuth/token exchange handled by `MetaAdapter` + `IntegrationService` (AES-GCM encryption with `META_LONG_LIVED_TOKEN_SECRET`).
- WhatsApp messaging routes through n8n webhooks (`WhatsAppAdapter`).
- OpenAI used for copy + image generation in `OpenAIService`.
- Stripe billing flows in `BillingService` (checkout, portal, webhook).
- Observability via Pino + optional OTLP exporter (`config/telemetry.ts`).

## Extending

1. Implement additional Supabase queries in `SupabaseRepository` as needed per module.
2. Expose new REST endpoints by adding route files under `modules/` and registering them in `app.ts`.
3. If an external integration requires retries/rate-limits, use `utils/retry.ts` and `utils/circuit-breaker.ts`.
4. Add queue processors by extending `queue-names.ts`, `queue-service.ts`, and `worker.ts`.
5. Keep env validation up to date in `config/env.ts`.

## Testing

- Run `pnpm test:backend` for vitest suites.
- Add integration tests with mocked Supabase/n8n/meta in `backend/tests/`.

## Deployment

- Build using `backend/Dockerfile` (API) and `backend/Dockerfile.worker` (workers).
- Configure Coolify services: Redis, Postgres/Supabase connection, API, workers, n8n.
- Provide OTLP endpoint via vendor (e.g., Honeycomb, Uptrace) if telemetry is required.

