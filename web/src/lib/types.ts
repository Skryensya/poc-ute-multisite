import type { Tenant } from "./tenants";

export interface Site {
  documentId: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}
export interface Career {
  documentId: string;
  name: string;
  description: string;
  duration: string | null;
  degree: string | null;
}
export interface Announcement {
  documentId: string;
  title: string;
  description: string;
  date: string;
}
export interface SiteLink {
  slug: Tenant;
  name: string;
  url: string;
}
export interface HomeData {
  site: Site;
  careers: Career[];
  announcements: Announcement[];
  links: SiteLink[];
}
export interface StrapiList<T> {
  data: T[];
}
