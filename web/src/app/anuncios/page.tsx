import type { Metadata } from "next";
import Hydrated from "@/components/Hydrated";
import { AnnouncementsView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getAnnouncements } from "@/lib/strapi";

export const metadata: Metadata = { title: "Anuncios" };

export default async function Page() {
  const t = await tenantOrNotFound();
  return <Hydrated tenant={t} queries={[[qk.announcements(t), () => getAnnouncements(t)]]}><AnnouncementsView slug={t} /></Hydrated>;
}
