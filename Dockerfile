# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json .npmrc ./
RUN npx --yes google-artifactregistry-auth && npm ci && rm -f /root/.npmrc /app/.npmrc

COPY tsconfig.json tsconfig.prod.json ./
COPY bin/ ./bin/
COPY src/ ./src/

RUN npm run build-prod

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:24-slim AS production

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package*.json .npmrc ./
RUN npx --yes google-artifactregistry-auth && npm ci --omit=dev && rm -f /root/.npmrc /app/.npmrc

# Copy compiled TypeScript output
COPY --from=builder /app/dist ./dist

# Copy static frontend assets
COPY public/ ./public/

USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]
