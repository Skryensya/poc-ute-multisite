import type { HomeData } from "./types";

/** La clave incluye el tenant: cada sitio tiene su propia entrada de caché. */
export const homeKey = (slug: string) => ["site-home", slug] as const;

/** Función del cliente: mismo origen, sin parámetros de tenant (lo decide el servidor por Host). */
export async function fetchHome(): Promise<HomeData> {
  const res = await fetch("/api/home");
  if (!res.ok) throw new Error(`GET /api/home → ${res.status}`);
  return res.json();
}
