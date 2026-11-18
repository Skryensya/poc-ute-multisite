import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { EventDetailView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getEvent } from "@/lib/strapi";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tenantOrNotFound();
  const { slug } = await params;
  // En una facultad solo existen sus actividades (filtro por relación en Strapi); si no, 404.
  const event = /^[a-z0-9-]+$/.test(slug) ? await getEvent(t, slug) : null;
  if (!event) notFound();
  return <Hydrated tenant={t} queries={[[qk.event(t, slug), async () => event]]}><EventDetailView slug={t} eventSlug={slug} /></Hydrated>;
}
