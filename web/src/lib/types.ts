import type { Tenant } from "./tenants";

export interface SiteRef { name: string; slug: string }

export interface Site {
  documentId: string;
  name: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  heroImage: string | null;
  email: string | null;
  address: string | null;
  primaryColor: string;
  secondaryColor: string;
}
export interface SiteLink { slug: Tenant; name: string; tagline: string | null; heroImage: string | null; url: string }
export interface PageInfo { slug: string; title: string; intro: string | null }
export interface Page extends PageInfo {
  body: string | null; imageUrl: string | null;
  stats: { value: string; label: string }[] | null;
  values: { title: string; text: string }[] | null;
}
/** `pages`: título e introducción editables de cada sección del sitio, por slug. */
export interface SiteInfo { site: Site; links: SiteLink[]; pages: Record<string, PageInfo> }

// `sites` = todos los sitios a los que pertenece el registro (permite mostrar qué es compartido).
export interface Career {
  documentId: string; slug: string; name: string; description: string; overview: string | null;
  duration: string | null; degree: string | null; modality: string | null; imageUrl: string | null; sites: SiteRef[];
}
export interface Course { documentId: string; code: string; name: string; semester: number; credits: number | null }
export interface Professor {
  documentId: string; name: string; title: string | null; specialty: string | null;
  bio: string | null; photoUrl: string | null; sites: SiteRef[];
  /** Carreras de este sitio en las que dicta (solo en listados de profesores). */
  careers?: { name: string; slug: string }[];
}
export interface CareerDetail extends Career { courses: Course[]; professors: Professor[] }
export interface Announcement {
  documentId: string; title: string; description: string; date: string;
  category: string | null; tags: string[] | null; imageUrl: string | null; sites: SiteRef[];
  slug: string; body?: string | null; author?: string | null; // body y author solo en el detalle
}
export interface NewsDetail extends Announcement { related: Announcement[] }
/** Actividad de la agenda; mismas facetas que la agenda de la UC (tipo, lugar, público, gratuito, online). */
export interface EventItem {
  documentId: string; slug: string; title: string; description: string; startsAt: string; endsAt: string | null;
  eventType: string | null; place: string | null; online: boolean; free: boolean; price: string | null;
  audience: string[] | null; tags: string[] | null; unit: string | null; imageUrl: string | null; sites: SiteRef[];
  body?: string | null; program?: { time: string; title: string }[] | null; speakers?: { name: string; role: string }[] | null; // solo en el detalle
}
export interface EventDetail extends EventItem { related: EventItem[] }
export interface HomeData { careers: Career[]; professors: Professor[]; announcements: Announcement[]; events: EventItem[]; about: Page | null }
export interface StrapiList<T> { data: T[] }
