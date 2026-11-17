# POC UTE multisite

Tres sitios universitarios (`ute1/2/3.allison.sh`) servidos por **un** Next.js y **un** Strapi, con contenido distinto según el dominio. Es una prueba de arquitectura, no un portal completo.

| Dominio | Sitio | slug |
|---|---|---|
| ute1.allison.sh | Universidad Tecnológica Experimental | `university` |
| ute2.allison.sh | Facultad de Ingeniería | `engineering` |
| ute3.allison.sh | Facultad de Artes | `arts` |

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query 5 · Strapi 5.62 · PostgreSQL · Docker (multi-stage) · Dokploy/Traefik. Node 22 LTS.

## Estructura
```
web/    Next.js (src/lib/tenants.ts = mapeo host→sitio; src/lib/strapi.ts = acceso a Strapi)
cms/    Strapi (src/api/{site,career,announcement}, scripts/seed.js)
docs/   architecture.md, dokploy.md
```

## Imágenes Docker (contexto = raíz del repo)
```bash
docker build -f web/Dockerfile -t ute-web .
docker build -f cms/Dockerfile -t ute-cms .
```

## Variables de entorno
**cms** (ver `cms/.env.example`): `APP_KEYS` (4 valores separados por coma), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET`, `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL`, `PUBLIC_URL`. Generar cada secreto con `openssl rand -base64 16`.

**web** (ver `web/.env.example`): `STRAPI_URL` (dirección interna, p. ej. `http://ute-cms:1337`) y `STRAPI_API_TOKEN` (token *read-only*). Solo servidor; nunca `NEXT_PUBLIC_`.

## Inicializar Strapi y sembrar datos
1. Arrancar el CMS con PostgreSQL accesible (las tablas se crean al arrancar).
2. Crear el usuario admin en `/admin`.
3. Sembrar (manual, idempotente; **no** corre al arrancar):
   ```bash
   docker exec -it <contenedor-cms> node scripts/seed.js   # o: cd cms && npm run seed
   ```
4. En Strapi: *Settings → API Tokens → Create* → tipo **Read-only**, duración ilimitada. Ese valor es `STRAPI_API_TOKEN` de `web`.

## Desarrollo local
Strapi: `cd cms && cp .env.example .env` (completar) `&& npm i && npm run develop`. Web: `cd web && npm i && STRAPI_URL=... STRAPI_API_TOKEN=... npm run dev`.
Sin tocar `/etc/hosts`: `curl -H "Host: ute2.allison.sh" localhost:3000/`.

## Pruebas
```bash
cd web
npm test                                   # unitarias: tenant, query keys, hidratación
SMOKE_URL=http://localhost:3000 npm test   # + integración contra una app corriendo con el seed aplicado
```
La integración envía el header `Host` de cada dominio y comprueba aislamiento de carreras/anuncios, branding, 404 de hosts desconocidos y que el token no aparezca en las respuestas.

Humo en producción (revisar el cuerpo, no solo el 200):
```bash
for h in ute1 ute2 ute3; do curl -s https://$h.allison.sh | grep -o '<title>[^<]*'; done
```

Más detalle: [docs/architecture.md](docs/architecture.md) y [docs/dokploy.md](docs/dokploy.md).
