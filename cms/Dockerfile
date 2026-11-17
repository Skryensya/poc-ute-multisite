# Contexto de build: raíz del repo.  docker build -f cms/Dockerfile -t ute-cms .
FROM node:22-alpine AS deps
WORKDIR /app
COPY cms/package.json cms/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY cms/ ./
ENV NODE_ENV=production
RUN npm run build   # compila el panel de administración

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337
COPY --from=build --chown=node:node /app ./
# Strapi escribe en /app (database/migrations), uploads y .tmp como usuario node.
RUN mkdir -p public/uploads .tmp database/migrations && chown node:node /app && chown -R node:node public/uploads .tmp database
USER node
EXPOSE 1337
# Secretos y DATABASE_* se inyectan en runtime. El seed NO corre al arrancar: `node scripts/seed.js`.
CMD ["npm", "start"]
