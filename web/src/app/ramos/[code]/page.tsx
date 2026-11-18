import { notFound } from "next/navigation";
import Hydrated from "@/components/Hydrated";
import { CourseDetailView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getCourse } from "@/lib/strapi";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const t = await tenantOrNotFound();
  const { code } = await params;
  // El código va en minúsculas en la URL (inf-101); existe solo si la carrera del ramo existe en este sitio.
  const course = /^[a-z0-9-]+$/.test(code) ? await getCourse(t, code) : null;
  if (!course) notFound();
  return <Hydrated tenant={t} queries={[[qk.course(t, code), async () => course]]}><CourseDetailView slug={t} code={code} /></Hydrated>;
}
