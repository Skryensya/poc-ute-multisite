import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hostFrom, resolveTenant, type Tenant } from "./tenants";

/** Resuelve el sitio por Host; hostname desconocido → 404 (sin tenant por defecto). */
export async function tenantOrNotFound(): Promise<Tenant> {
  const tenant = resolveTenant(hostFrom(await headers()));
  if (!tenant) notFound();
  return tenant;
}
