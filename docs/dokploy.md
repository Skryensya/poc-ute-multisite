# Despliegue en Dokploy

Tres servicios: PostgreSQL → Strapi → Next.js. Todos en el mismo proyecto de Dokploy. Los nombres de ejemplo: `ute-db`, `ute-cms`, `ute-web`.

## 1. PostgreSQL
*Create Service → Database → PostgreSQL* (15/16). Nombre `ute-db`, DB `ute`, usuario `ute`, contraseña fuerte. **No** configurar puerto externo. Dokploy crea el volumen persistente. Anota el *Internal Host* (`ute-db` o el que muestre; en Swarm es `<appName>`).

## 2. Strapi (Dockerfile)
*Create Service → Application* `ute-cms`, origen: tu repositorio Git.
- Build Type: **Dockerfile** · Dockerfile Path: `cms/Dockerfile` · Docker Context Path: `.`
- Environment:
  ```
  APP_KEYS=<4 valores base64 separados por coma>
  API_TOKEN_SALT=<openssl rand -base64 16>
  ADMIN_JWT_SECRET=<...>
  TRANSFER_TOKEN_SALT=<...>
  ENCRYPTION_KEY=<...>
  JWT_SECRET=<...>
  DATABASE_HOST=ute-db
  DATABASE_PORT=5432
  DATABASE_NAME=ute
  DATABASE_USERNAME=ute
  DATABASE_PASSWORD=<la de la DB>
  PUBLIC_URL=https://<hostname-del-cms>
  ```
- Domains: usa un hostname que ya controles (p. ej. `cms.allison.sh`) o el dominio `traefik.me` que ofrece Dokploy; Container Port **1337**, HTTPS activado (Let's Encrypt). No asumas otro dominio propio.
- Volumes (opcional, solo si subirás archivos): Volume Mount → `/app/public/uploads`.
- Deploy.

## 3. Configurar el admin
Abre `https://<hostname-del-cms>/admin` y crea el primer usuario administrador.

## 4. Token de API
*Settings → API Tokens → Create new API Token*: nombre `web`, duración *Unlimited*, tipo **Read-only**. Copia el valor (solo se muestra una vez).

## 5. Seed
En Dokploy: `ute-cms` → *Advanced → Terminal* (o `docker exec -it <contenedor> sh`):
```bash
node scripts/seed.js
```
Idempotente: se puede repetir sin duplicar. Imprime `Seed OK: 3 sitios, 7 carreras, 3 anuncios.` No corre automáticamente en el arranque.

## 6. Next.js (Dockerfile)
*Create Service → Application* `ute-web`.
- Build Type: **Dockerfile** · Dockerfile Path: `web/Dockerfile` · Docker Context Path: `.`
- Environment:
  ```
  STRAPI_URL=http://ute-cms:1337
  STRAPI_API_TOKEN=<token del paso 4>
  ```
  (Son variables de runtime; no se necesitan en build.)

## 7. Red privada
Dos aplicaciones de Dokploy **no** comparten DNS automáticamente si cada una está en su propia red. Dokploy usa Docker Swarm con la red overlay `dokploy-network`, a la que se une cada servicio: dentro de ella el nombre de servicio resuelve (`ute-cms`). Verifica desde la terminal de `ute-web`:
```bash
wget -qO- http://ute-cms:1337/_health -S 2>&1 | head -1   # HTTP/1.1 204
```
Si no resuelve, usa el *App Name* exacto que muestra Dokploy para `ute-cms` (suele llevar sufijo aleatorio) como host en `STRAPI_URL`, y confirma que ambos servicios están en `dokploy-network`. PostgreSQL debe seguir sin puerto publicado.

## 8. Dominios y 9. HTTPS
DNS: registros **A** de `ute1.allison.sh`, `ute2.allison.sh` y `ute3.allison.sh` → IP del VPS.
En `ute-web` → *Domains*, agrega **los tres** (Host, Path `/`, Container Port **3000**, HTTPS ON, Certificate: Let's Encrypt). Redeploy. Traefik emitirá un certificado por dominio.

## 10. Verificar
```bash
for h in ute1 ute2 ute3; do
  curl -sI https://$h.allison.sh | head -1
  curl -s  https://$h.allison.sh | grep -o '<title>[^<]*'
done
```
Esperado: 200 y títulos *Universidad Tecnológica Experimental*, *Facultad de Ingeniería*, *Facultad de Artes*. Una IP o dominio no listado debe dar 404.

## 11. Editar un registro compartido
1. En Strapi: *Content Manager → Announcement →* “Postulaciones abiertas para el año académico 2027”.
2. Cambia la descripción y pulsa **Publish** (guardar sin publicar solo modifica el borrador).
3. Recarga `ute1`, `ute2` y `ute3`: el texto nuevo aparece en los tres (es un único registro).
4. Para contenido específico, edita “Nueva infraestructura para laboratorios de ingeniería”: solo cambia en `ute2`. Para asignar un registro a más sitios, añade sitios en su campo *sites* y publica.
