# Arquitectura

```mermaid
flowchart TD
  U1[ute1.allison.sh] & U2[ute2.allison.sh] & U3[ute3.allison.sh] --> T[Traefik / Dokploy]
  T -->|mismo servicio :3000| N[Next.js]
  N -->|Host → slug, en memoria| N
  N -->|REST + token read-only, red privada| S[Strapi :1337]
  S --> P[(PostgreSQL)]
  B[Navegador] -->|GET /api/home, mismo origen| N
```

## Traefik y los tres dominios
En Dokploy los tres dominios se agregan a **la misma aplicación** (puerto 3000). Dokploy genera un router de Traefik por dominio, todos hacia el mismo contenedor, y Traefik gestiona los certificados. Traefik conserva el header `Host` original al reenviar.

## Resolución de tenant
`web/src/lib/tenants.ts` contiene un objeto `host → slug`. Es una búsqueda en memoria: sin base de datos, sin Strapi, sin middleware. Se normaliza el host (minúsculas, sin puerto ni punto final) y se verifica con `Object.hasOwn`. Host desconocido → `notFound()` (404); no existe tenant por defecto.

**Supuestos de confianza:** solo se lee `Host`. No se usa `X-Forwarded-Host`: Traefik ya conserva `Host`, y un header reenviado podría falsificarse si alguien alcanzara el contenedor sin pasar por Traefik. Incluso así, un host no listado da 404, de modo que lo peor que puede hacer un cliente es pedir uno de los tres sitios válidos. El contenedor no debe publicarse en un puerto del host; solo Traefik lo alcanza.

## Contenido compartido vs. específico
Un único modelo por tipo: `Site`, `Career`, `Announcement`; los dos últimos tienen una relación **muchos-a-muchos** con `Site`.
- *Compartido:* un anuncio relacionado con los 3 sitios es **una** fila; editarlo en Strapi cambia los tres sitios.
- *Específico:* un anuncio/carrera relacionado con un solo sitio solo aparece allí.

El filtrado lo hace Strapi: `filters[sites][slug][$eq]=<slug>`, con `fields` explícitos. Strapi 5 devuelve respuestas planas con `documentId`; solo se consultan documentos **publicados** (Draft & Publish activo; un registro en borrador no se ve en el sitio).

## React Query
1. `page.tsx` resuelve el tenant, crea un `QueryClient` **por petición**, llama `fetchQuery({ queryKey: ["site-home", slug], queryFn: getHomeData })` (acceso directo a Strapi, sin HTTP propio) y entrega `dehydrate()` en un `HydrationBoundary`.
2. `Home` (client component) usa `useQuery` con la misma clave. Los datos ya están hidratados, así que el HTML inicial ya trae el contenido y no hay loading.
3. La clave incluye el slug, así que cada sitio tiene su caché independiente. `getHomeData` hace 4 peticiones a Strapi en paralelo (sitio, carreras, anuncios, nombres para enlaces).
4. `queryFn` del cliente = `GET /api/home` (mismo origen). El servidor deduce el sitio por `Host`; el navegador no envía ningún identificador de tenant.

Se usa `fetchQuery` en lugar de `prefetchQuery` a propósito: si Strapi cae, se prefiere un 500 a una página vacía que reintenta en el navegador.

## Dueño de cada caché
| Capa | Política |
|---|---|
| Next.js | Sin caché: `fetch(..., {cache: "no-store"})`, ruta dinámica (lee `Host`). Cada carga de página consulta Strapi. |
| React Query (navegador) | `staleTime` 60 s, sin refetch al enfocar. Es la única caché del cliente. |
| HTTP | `/api/home` responde `no-store` y `Vary: Host`. |

Frescura: un cambio en Strapi es visible en la **siguiente carga de página** (el SSR siempre consulta). En una pestaña ya abierta aparece al refrescar el `staleTime` y volver a montar/refetch. Sin webhooks ni invalidación.

## Seguridad de los datos
`STRAPI_URL` y `STRAPI_API_TOKEN` se leen solo en código de servidor (sin prefijo `NEXT_PUBLIC_`), el token es *read-only* y el navegador solo ve `/api/home` del mismo origen. Los tests verifican que el token no esté en el bundle ni en las respuestas.
