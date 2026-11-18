import type { Metadata } from "next";
import Hydrated from "@/components/Hydrated";
import { ProfessorsView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getProfessors } from "@/lib/strapi";

export const metadata: Metadata = { title: "Profesores" };

export default async function Page() {
  const t = await tenantOrNotFound();
  return <Hydrated tenant={t} queries={[[qk.professors(t), () => getProfessors(t)]]}><ProfessorsView slug={t} /></Hydrated>;
}
