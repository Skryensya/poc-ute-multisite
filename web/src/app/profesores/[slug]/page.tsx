import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { ProfessorDetailView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getProfessor } from "@/lib/strapi";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tenantOrNotFound();
  const { slug } = await params;
  // En una facultad solo existen sus profesores (filtro por relación en Strapi); si no, 404.
  const professor = /^[a-z0-9-]+$/.test(slug) ? await getProfessor(t, slug) : null;
  if (!professor) notFound();
  return <Hydrated tenant={t} queries={[[qk.professor(t, slug), async () => professor]]}><ProfessorDetailView slug={t} professorSlug={slug} /></Hydrated>;
}
