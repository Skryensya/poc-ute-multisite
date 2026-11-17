import { cache } from "react";
import { HUB, siteUrl, tenants, type Tenant } from "./tenants";
import type { Announcement, Career, HomeData, Site, SiteLink, StrapiList } from "./types";

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

const bySite = (slug: string) => ({ "filters[sites][slug][$eq]": slug, "pagination[pageSize]": "50" });

export async function getSite(slug: string): Promise<Site> {
  const { data } = await strapi<StrapiList<Site>>("sites", {
    "filters[slug][$eq]": slug,
    "fields[0]": "name", "fields[1]": "slug", "fields[2]": "title",
    "fields[3]": "description", "fields[4]": "primaryColor", "fields[5]": "secondaryColor",
  });
  if (!data[0]) throw new Error(`Site "${slug}" no existe o no está publicado en Strapi`);
  return data[0];
}

export async function getCareers(siteSlug: string): Promise<Career[]> {
  const { data } = await strapi<StrapiList<Career>>("careers", {
    ...bySite(siteSlug),
    "fields[0]": "name", "fields[1]": "description", "fields[2]": "duration", "fields[3]": "degree",
    sort: "name:asc",
  });
  return data;
}

export async function getAnnouncements(siteSlug: string): Promise<Announcement[]> {
  const { data } = await strapi<StrapiList<Announcement>>("announcements", {
    ...bySite(siteSlug),
    "fields[0]": "title", "fields[1]": "description", "fields[2]": "date",
    sort: "date:desc",
  });
  return data;
}

// Nombres para los enlaces entre sitios (la universidad enlaza a las facultades; ellas, a la universidad).
async function getLinks(slug: Tenant): Promise<SiteLink[]> {
  const wanted = slug === HUB ? Object.values(tenants).filter((t) => t !== HUB) : [HUB];
  const params: Record<string, string> = { "fields[0]": "name", "fields[1]": "slug" };
  wanted.forEach((s, i) => (params[`filters[slug][$in][${i}]`] = s));
  const { data } = await strapi<StrapiList<Pick<Site, "name" | "slug">>>("sites", params);
  return data.map((s) => ({ slug: s.slug as Tenant, name: s.name, url: siteUrl(s.slug as Tenant) }));
}

/** Una sola agregación para la home; las 4 peticiones a Strapi van en paralelo. */
export async function getHomeData(slug: Tenant): Promise<HomeData> {
  const [site, careers, announcements, links] = await Promise.all([
    getSite(slug), getCareers(slug), getAnnouncements(slug), getLinks(slug),
  ]);
  return { site, careers, announcements, links };
}

/** Deduplica por petición (la página y generateMetadata comparten el resultado). */
export const getHomeDataCached = cache(getHomeData);
