import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { AboutView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getPage } from "@/lib/strapi";

export const metadata: Metadata = { title: "Sobre nosotros" };

export default async function Page() {
  const t = await tenantOrNotFound();
  const about = await getPage(t, "nosotros");
  if (!about) notFound(); // este sitio aún no tiene la página en Strapi
  return <Hydrated tenant={t} queries={[[qk.page(t, "nosotros"), async () => about]]}><AboutView slug={t} /></Hydrated>;
}
