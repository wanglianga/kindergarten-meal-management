FROM node:18-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./backend/
WORKDIR /app/backend/backend
RUN npm ci --registry=https://registry.npmmirror.com || npm ci

WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app/backend

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./
COPY backend/src/ ./src/

RUN mkdir -p /app/backend/data
RUN node dist/seed.js 2>/dev/null || echo "Seed skipped"

EXPOSE 3000

CMD ["sh", "-c", "node dist/seed.js 2>/dev/null; node dist/main.js"]
