# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install only what's needed to build
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile

# Compile TypeScript ➜ dist/
COPY . .
RUN pnpm build                    # ⁠ tsc ⁠ or your build script

# ---------- Stage 2: runtime ----------
FROM node:20-alpine
WORKDIR /app

# Runtime deps only
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --prod --frozen-lockfile

# Ship compiled JS
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "dist/index.js"]