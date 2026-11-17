// ÚNICO lugar donde se mapea hostname -> sitio. Solo identificadores de infraestructura,
// nada de contenido (el contenido vive en Strapi). Búsqueda O(1), sin red ni base de datos.
export const tenants = {
  "ute1.allison.sh": "university",
  "ute2.allison.sh": "engineering",
  "ute3.allison.sh": "arts",
} as const;

export type Tenant = (typeof tenants)[keyof typeof tenants];
export const HUB: Tenant = "university";

/** Normaliza un header Host: minúsculas, sin puerto, sin punto final. */
export function normalizeHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

/** Devuelve el slug del sitio o null si el hostname no está configurado (sin tenant por defecto). */
export function resolveTenant(host: string | null | undefined): Tenant | null {
  const h = normalizeHost(host);
  return Object.hasOwn(tenants, h) ? tenants[h as keyof typeof tenants] : null;
}

/** URL pública del sitio, usada para los enlaces entre sitios. */
export function siteUrl(slug: Tenant): string {
  const host = Object.keys(tenants).find((h) => tenants[h as keyof typeof tenants] === slug)!;
  return `https://${host}`;
}

/**
 * Hostname de la petición. Solo se lee `Host`: Traefik lo conserva por defecto
 * (passHostHeader) y no se confía en X-Forwarded-Host, que un cliente podría falsificar
 * si alcanzara el contenedor directamente. Ver docs/architecture.md.
 */
export function hostFrom(headers: Headers | { get(name: string): string | null }): string | null {
  return headers.get("host");
}
