# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -----------------------------
# Install dependencies
# -----------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -----------------------------
# Build the backend
# -----------------------------
FROM deps AS builder
WORKDIR /app
COPY . .
RUN cd backend && pnpm run build:backend

# -----------------------------
# Production image
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=deps /pnpm /pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY package.json pnpm-lock.yaml ./

EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
