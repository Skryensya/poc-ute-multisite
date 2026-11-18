import { dehydrate, HydrationBoundary, QueryClient, type QueryKey } from "@tanstack/react-query";
import { getSiteInfoCached } from "@/lib/strapi";
import { qk } from "@/lib/queries";
import type { Tenant } from "@/lib/tenants";
import SiteShell from "./SiteShell";

export type Prefetch = [key: QueryKey, fn: () => Promise<unknown>];

/**
 * Prefetch en servidor con un QueryClient POR PETICIÓN, dehydrate y HydrationBoundary.
 * fetchQuery (no prefetchQuery): si Strapi falla, 500 en vez de una página vacía.
 */
export default async function Hydrated({ tenant, queries, children }: { tenant: Tenant; queries: Prefetch[]; children: React.ReactNode }) {
  const qc = new QueryClient();
  const all: Prefetch[] = [[qk.site(tenant), () => getSiteInfoCached(tenant)], ...queries];
  await Promise.all(all.map(([queryKey, queryFn]) => qc.fetchQuery({ queryKey, queryFn })));
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <SiteShell slug={tenant}>{children}</SiteShell>
    </HydrationBoundary>
  );
}
