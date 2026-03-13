# --- Build ---
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/bot/package.json apps/bot/
COPY apps/admin/package.json apps/admin/
COPY packages/shared/package.json packages/shared/
RUN npm ci

COPY tsconfig.base.json turbo.json ./
COPY apps/bot/ apps/bot/
COPY packages/shared/ packages/shared/
RUN npx turbo run build --filter=@guigo/bot

# --- Production ---
FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/bot/package.json apps/bot/
COPY apps/admin/package.json apps/admin/
COPY packages/shared/package.json packages/shared/
RUN npm ci --omit=dev

COPY --from=builder /app/apps/bot/dist apps/bot/dist

EXPOSE 3001
CMD ["node", "apps/bot/dist/index.js"]
