import type { Metadata } from "next";
import Hydrated from "@/components/Hydrated";
import { CareersView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getCareers } from "@/lib/strapi";

export const metadata: Metadata = { title: "Carreras" };

export default async function Page() {
  const t = await tenantOrNotFound();
  return <Hydrated tenant={t} queries={[[qk.careers(t), () => getCareers(t)]]}><CareersView slug={t} /></Hydrated>;
}
