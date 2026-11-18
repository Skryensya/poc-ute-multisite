import { cache } from "react";
import { HUB, siteUrl, tenants, type Tenant } from "./tenants";
import type {
  Announcement, Career, CareerDetail, HomeData, Professor, Site, SiteInfo, SiteLink, StrapiList,
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
const bySite = (slug: string, limit?: number) => ({
  "filters[sites][slug][$eq]": slug,
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
  const { data } = await strapi<StrapiList<Professor>>("professors", { ...bySite(site, limit), ...fields(PROFESSOR), sort: "name:asc" });
  return data;
}

export async function getAnnouncements(site: string, limit?: number): Promise<Announcement[]> {
  const { data } = await strapi<StrapiList<Announcement>>("announcements", {
    ...bySite(site, limit), ...fields(["title", "description", "date", "category", "imageUrl"]), sort: "date:desc",
  });
  return data;
}

/** Detalle de una carrera del sitio, con malla curricular y solo los profesores de este sitio. null si no existe aquí. */
export async function getCareer(site: string, careerSlug: string): Promise<CareerDetail | null> {
  const { data } = await strapi<StrapiList<CareerDetail>>("careers", {
    "filters[slug][$eq]": careerSlug,
    "filters[sites][slug][$eq]": site,
    ...fields([...CAREER, "overview"]),
    ...fields(["code", "name", "semester", "credits"], "populate[courses][fields]"),
    "populate[courses][sort]": "semester:asc",
    ...fields(PROFESSOR, "populate[professors][fields]"),
    "populate[professors][filters][sites][slug][$eq]": site,
    ...fields(["name", "slug"], "populate[professors][populate][sites][fields]"),
    ...fields(["name", "slug"], "populate[sites][fields]"),
  });
  return data[0] ?? null;
}

// La universidad enlaza a las facultades; las facultades, a la universidad.
async function getLinks(slug: Tenant): Promise<SiteLink[]> {
  const wanted = slug === HUB ? Object.values(tenants).filter((t) => t !== HUB) : [HUB];
  const params: Record<string, string> = fields(["name", "slug", "tagline", "heroImage"]);
  wanted.forEach((s, i) => (params[`filters[slug][$in][${i}]`] = s));
  const { data } = await strapi<StrapiList<Omit<SiteLink, "url">>>("sites", params);
  return data.map((s) => ({ ...s, url: siteUrl(s.slug as Tenant) }));
}

export async function getSiteInfo(slug: Tenant): Promise<SiteInfo> {
  const [site, links] = await Promise.all([getSite(slug), getLinks(slug)]);
  return { site, links };
}

/** Portada: una selección de cada colección, en paralelo. */
export async function getHome(slug: Tenant): Promise<HomeData> {
  const [careers, professors, announcements] = await Promise.all([
    getCareers(slug, 6), getProfessors(slug, 4), getAnnouncements(slug, 3),
  ]);
  return { careers, professors, announcements };
}

/** Deduplica por petición (el layout y la página comparten el resultado). */
export const getSiteInfoCached = cache(getSiteInfo);
