import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { hostFrom, resolveTenant } from "@/lib/tenants";
import { getHomeDataCached } from "@/lib/strapi";
import { homeKey } from "@/lib/queries";
import Home from "@/components/Home";

export default async function Page() {
  const tenant = resolveTenant(hostFrom(await headers()));
  if (!tenant) notFound(); // hostname desconocido: 404, sin tenant por defecto

  // QueryClient por petición (nunca compartido entre peticiones SSR).
  // fetchQuery (no prefetchQuery) para que un fallo de Strapi produzca error 500 y no una página vacía.
  const queryClient = new QueryClient();
  await queryClient.fetchQuery({ queryKey: homeKey(tenant), queryFn: () => getHomeDataCached(tenant) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Home slug={tenant} />
    </HydrationBoundary>
  );
}
