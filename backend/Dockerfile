# syntax=docker/dockerfile:1

# ---- Base image shared by both stages ----
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies stage: install once, cached by lockfile hash ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- Runtime stage: copy only what's needed to run ----
FROM base AS runtime

# Run as a non-root user (best practice: never run Node as root in prod)
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Uploaded files directory needs to exist and be writable by the app user
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Basic container-level healthcheck hitting the app's own health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||5000)+'/api/health').then(r=>{if(r.ok)process.exit(0);process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
