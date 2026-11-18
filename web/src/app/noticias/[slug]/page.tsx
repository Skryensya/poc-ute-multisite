import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { NewsDetailView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getNewsItem } from "@/lib/strapi";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tenantOrNotFound();
  const { slug } = await params;
  // En una facultad solo existen sus noticias (filtro por relación en Strapi); si no, 404.
  const item = /^[a-z0-9-]+$/.test(slug) ? await getNewsItem(t, slug) : null;
  if (!item) notFound();
  return <Hydrated tenant={t} queries={[[qk.newsItem(t, slug), async () => item]]}><NewsDetailView slug={t} newsSlug={slug} /></Hydrated>;
}
