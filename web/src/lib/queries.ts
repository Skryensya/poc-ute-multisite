import type { Tenant } from "./tenants";

/** Todas las claves incluyen el tenant: cada sitio tiene su propia entrada de caché. */
export const qk = {
  site: (t: string) => ["site", t] as const,
  home: (t: string) => ["home", t] as const,
  careers: (t: string) => ["careers", t] as const,
  career: (t: string, slug: string) => ["career", t, slug] as const,
  professors: (t: string) => ["professors", t] as const,
  announcements: (t: string) => ["announcements", t] as const,
  page: (t: string, slug: string) => ["page", t, slug] as const,
  events: (t: string) => ["events", t] as const,
  event: (t: string, slug: string) => ["event", t, slug] as const,
};

export type ContentKind = "site" | "home" | "careers" | "career" | "professors" | "announcements" | "page" | "events" | "event";

/** Cliente: siempre mismo origen; el tenant lo decide el servidor por Host, nunca el navegador. */
export async function fetchContent<T>(kind: ContentKind, slug?: string): Promise<T> {
  const res = await fetch(`/api/content/${kind}${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`);
  if (!res.ok) throw new Error(`GET /api/content/${kind} → ${res.status}`);
  return res.json();
}

export type { Tenant };
