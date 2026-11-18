import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { CareerDetailView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getCareer } from "@/lib/strapi";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tenantOrNotFound();
  const { slug } = await params;
  // Solo existe si la carrera pertenece a ESTE sitio (filtro por relación en Strapi); si no, 404.
  const career = /^[a-z0-9-]+$/.test(slug) ? await getCareer(t, slug) : null;
  if (!career) notFound();
  return <Hydrated tenant={t} queries={[[qk.career(t, slug), async () => career]]}><CareerDetailView slug={t} careerSlug={slug} /></Hydrated>;
}
