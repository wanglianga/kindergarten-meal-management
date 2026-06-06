FROM node:18-alpine AS backend-base

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

FROM node:18-alpine AS backend-prod

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --production

COPY --from=backend-base /app/backend/dist ./dist
COPY backend/ ./

RUN mkdir -p /app/backend/data
RUN npm run seed

EXPOSE 3000

CMD ["node", "dist/main.js"]
