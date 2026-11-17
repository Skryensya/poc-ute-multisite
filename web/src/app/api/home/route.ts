import { hostFrom, resolveTenant } from "@/lib/tenants";
import { getHomeData } from "@/lib/strapi";

export const dynamic = "force-dynamic";

// El tenant sale del Host, nunca de parámetros del navegador.
export async function GET(req: Request) {
  const tenant = resolveTenant(hostFrom(req.headers));
  if (!tenant) return Response.json({ error: "Sitio no encontrado" }, { status: 404 });
  const data = await getHomeData(tenant);
  // no-store: React Query es la única caché del cliente. Vary: Host por si hay un proxy compartido.
  return Response.json(data, { headers: { "Cache-Control": "no-store", Vary: "Host" } });
}
