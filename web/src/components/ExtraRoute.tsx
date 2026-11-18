import { notFound } from "next/navigation";
import { extraOf } from "@/lib/extras";
import { tenantOrNotFound } from "@/lib/server";
import Hydrated from "./Hydrated";
import { ExtraView } from "./views";

/** Página propia de un sitio (definida en el front): solo existe en el dominio al que pertenece; en los demás, 404. */
export default async function ExtraRoute({ path }: { path: string }) {
  const t = await tenantOrNotFound();
  if (extraOf(t)?.path !== path) notFound();
  return <Hydrated tenant={t} queries={[]}><ExtraView slug={t} /></Hydrated>;
}
