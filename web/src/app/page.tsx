import Hydrated from "@/components/Hydrated";
import { HomeView } from "@/components/views";
import { qk } from "@/lib/queries";
import { tenantOrNotFound } from "@/lib/server";
import { getHome } from "@/lib/strapi";

export default async function Page() {
  const t = await tenantOrNotFound();
  return <Hydrated tenant={t} queries={[[qk.home(t), () => getHome(t)]]}><HomeView slug={t} /></Hydrated>;
}
