import { cache } from "react";
import { HUB, siteUrl, tenants, type Tenant } from "./tenants";
import type {
  Announcement, Career, CareerDetail, EventItem, HomeData, Page, PageInfo, Professor, Site, SiteInfo, SiteLink, StrapiList,
} from "./types";

// Solo servidor: STRAPI_URL (red privada) y STRAPI_API_TOKEN nunca llegan al navegador.
async function strapi<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`/api/${path}`, process.env.STRAPI_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // Next no cachea aquí: la frescura la gobierna React Query en el cliente (ver docs).
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Strapi ${path} → ${res.status}`);
  return res.json();
}

const fields = (names: string[], prefix = "fields") =>
  Object.fromEntries(names.map((n, i) => [`${prefix}[${i}]`, n]));
// Filtra por la relación con el sitio resuelto y trae los sitios del registro (nombre + slug).
// El sitio central (HUB) muestra el contenido de TODAS las facultades y enlaza a cada una; las facultades, solo el suyo.
const bySite = (slug: string, limit?: number) => ({
  ...(slug === HUB ? {} : { "filters[sites][slug][$eq]": slug }),
  "pagination[pageSize]": String(limit ?? 100),
  ...fields(["name", "slug"], "populate[sites][fields]"),
});

const CAREER = ["slug", "name", "description", "duration", "degree", "modality", "imageUrl"];
const PROFESSOR = ["name", "title", "specialty", "bio", "photoUrl"];

export async function getSite(slug: string): Promise<Site> {
  const { data } = await strapi<StrapiList<Site>>("sites", {
    "filters[slug][$eq]": slug,
    ...fields(["name", "slug", "title", "tagline", "description", "heroImage", "email", "address", "primaryColor", "secondaryColor"]),
  });
  if (!data[0]) throw new Error(`Site "${slug}" no existe o no está publicado en Strapi`);
  return data[0];
}

export async function getCareers(site: string, limit?: number): Promise<Career[]> {
  const { data } = await strapi<StrapiList<Career>>("careers", { ...bySite(site, limit), ...fields(CAREER), sort: "name:asc" });
  return data;
}

export async function getProfessors(site: string, limit?: number): Promise<Professor[]> {
  const { data } = await strapi<StrapiList<Professor>>("professors", {
    ...bySite(site, limit), ...fields(PROFESSOR), sort: "name:asc",
    // solo las carreras que existen en este sitio: un enlace a otra facultad daría 404
    ...fields(["name", "slug"], "populate[careers][fields]"), ...(site === HUB ? {} : { "populate[careers][filters][sites][slug][$eq]": site }),
  });
  return data;
}

export async function getAnnouncements(site: string, limit?: number): Promise<Announcement[]> {
  const { data } = await strapi<StrapiList<Announcement>>("announcements", {
    ...bySite(site, limit), ...fields(["title", "description", "date", "category", "tags", "imageUrl"]), sort: "date:desc",
  });
  return data;
}

const EVENT = ["slug", "title", "description", "startsAt", "endsAt", "eventType", "place", "online", "free", "price", "audience", "tags", "unit", "imageUrl"];

/** Agenda: próximas actividades primero. `upcoming` oculta las que ya terminaron (se calcula en cada petición). */
export async function getEvents(site: string, opts: { limit?: number; upcoming?: boolean } = {}): Promise<EventItem[]> {
  const { data } = await strapi<StrapiList<EventItem>>("events", {
    ...bySite(site, opts.limit), ...fields(EVENT), sort: "startsAt:asc",
    ...(opts.upcoming ? { "filters[startsAt][$gte]": new Date().toISOString() } : {}),
  });
  return data;
}

export async function getEvent(site: string, slug: string): Promise<EventItem | null> {
  const { data } = await strapi<StrapiList<EventItem>>("events", {
    ...bySite(site, 1), "filters[slug][$eq]": slug, ...fields(EVENT),
  });
  return data[0] ?? null;
}

/** Detalle de una carrera del sitio, con malla curricular y solo los profesores de este sitio. null si no existe aquí. */
export async function getCareer(site: string, careerSlug: string): Promise<CareerDetail | null> {
  const { data } = await strapi<StrapiList<CareerDetail>>("careers", {
    "filters[slug][$eq]": careerSlug,
    ...(site === HUB ? {} : { "filters[sites][slug][$eq]": site }),
    ...fields([...CAREER, "overview"]),
    ...fields(["code", "name", "semester", "credits"], "populate[courses][fields]"),
    "populate[courses][sort]": "semester:asc",
    ...fields(PROFESSOR, "populate[professors][fields]"),
    ...(site === HUB ? {} : { "populate[professors][filters][sites][slug][$eq]": site }),
    ...fields(["name", "slug"], "populate[professors][populate][sites][fields]"),
    ...fields(["name", "slug"], "populate[sites][fields]"),
  });
  return data[0] ?? null;
}

const pageFilter = (site: string) => ({ "filters[site][slug][$eq]": site });

/** Título e introducción de cada sección del sitio (livianos: viajan en todas las páginas). */
export async function getPages(site: string): Promise<Record<string, PageInfo>> {
  const { data } = await strapi<StrapiList<PageInfo>>("pages", { ...pageFilter(site), ...fields(["slug", "title", "intro"]), "pagination[pageSize]": "20" });
  return Object.fromEntries(data.map((p) => [p.slug, p]));
}

/** Página completa de este sitio (p. ej. `nosotros`); null si el sitio no la tiene. */
export async function getPage(site: string, slug: string): Promise<Page | null> {
  const { data } = await strapi<StrapiList<Page>>("pages", {
    ...pageFilter(site), "filters[slug][$eq]": slug,
    ...fields(["slug", "title", "intro", "body", "imageUrl", "stats", "values"]),
  });
  return data[0] ?? null;
}

// Cada sitio enlaza a todos los demás.
async function getLinks(slug: Tenant): Promise<SiteLink[]> {
  const wanted = Object.values(tenants).filter((t) => t !== slug); // la universidad y las facultades hermanas
  const params: Record<string, string> = fields(["name", "slug", "tagline", "heroImage"]);
  wanted.forEach((s, i) => (params[`filters[slug][$in][${i}]`] = s));
  const { data } = await strapi<StrapiList<Omit<SiteLink, "url">>>("sites", params);
  return data.map((s) => ({ ...s, url: siteUrl(s.slug as Tenant) }));
}

export async function getSiteInfo(slug: Tenant): Promise<SiteInfo> {
  const [site, links, pages] = await Promise.all([getSite(slug), getLinks(slug), getPages(slug)]);
  return { site, links, pages };
}

/** Portada: una selección de cada colección, en paralelo. */
export async function getHome(slug: Tenant): Promise<HomeData> {
  const [careers, professors, announcements, events, about] = await Promise.all([
    getCareers(slug, 6), getProfessors(slug, 6), getAnnouncements(slug, 5), getEvents(slug, { limit: 4, upcoming: true }), getPage(slug, "nosotros"),
  ]);
  return { careers, professors, announcements, events, about };
}

/** Deduplica por petición (el layout y la página comparten el resultado). */
export const getSiteInfoCached = cache(getSiteInfo);
