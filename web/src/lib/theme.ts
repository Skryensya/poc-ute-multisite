import type { Tenant } from "./tenants";

/** Personalidad visual de cada sitio (tipografía, formas, cabecera, portada, pie). El color viene de Strapi. */
export type Theme = "classic" | "tech" | "editorial";
const byTenant: Record<Tenant, Theme> = { university: "classic", engineering: "tech", arts: "editorial" };
export const themeOf = (slug: string): Theme => byTenant[slug as Tenant] ?? "classic";
