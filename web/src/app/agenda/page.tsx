import type { Metadata } from "next";
import Hydrated from "@/components/Hydrated";
import { AgendaView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getEvents } from "@/lib/strapi";

export const metadata: Metadata = { title: "Agenda" };

export default async function Page() {
  const t = await tenantOrNotFound();
  return <Hydrated tenant={t} queries={[[qk.events(t), () => getEvents(t, { upcoming: true })]]}><AgendaView slug={t} /></Hydrated>;
}
