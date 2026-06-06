FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com || npm ci

COPY . .
RUN npm run build

RUN mkdir -p /app/data
RUN node dist/seed.js 2>/dev/null || echo "Seed skipped"

EXPOSE 3000

CMD ["sh", "-c", "node dist/seed.js 2>/dev/null; node dist/main.js"]
