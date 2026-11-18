import { hostFrom, resolveTenant } from "@/lib/tenants";
import { getAnnouncements, getCareer, getCareers, getCourse, getEvent, getEvents, getHome, getNewsItem, getPage, getProfessor, getProfessors, getSiteInfo } from "@/lib/strapi";

export const dynamic = "force-dynamic";

// El tenant sale del Host, nunca de parámetros del navegador. `kind` es una lista cerrada.
export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const tenant = resolveTenant(hostFrom(req.headers));
  if (!tenant) return Response.json({ error: "Sitio no encontrado" }, { status: 404 });
  const { kind } = await params;
  const slug = new URL(req.url).searchParams.get("slug") ?? "";

  const loaders: Record<string, () => Promise<unknown>> = {
    site: () => getSiteInfo(tenant),
    home: () => getHome(tenant),
    careers: () => getCareers(tenant),
    professors: () => getProfessors(tenant),
    announcements: () => getAnnouncements(tenant),
    professor: () => (/^[a-z0-9-]+$/.test(slug) ? getProfessor(tenant, slug) : Promise.resolve(null)),
    course: () => (/^[a-z0-9-]+$/.test(slug) ? getCourse(tenant, slug) : Promise.resolve(null)),
    newsItem: () => (/^[a-z0-9-]+$/.test(slug) ? getNewsItem(tenant, slug) : Promise.resolve(null)),
    events: () => getEvents(tenant, { upcoming: true }),
    event: () => (/^[a-z0-9-]+$/.test(slug) ? getEvent(tenant, slug) : Promise.resolve(null)),
    page: () => (/^[a-z0-9-]+$/.test(slug) ? getPage(tenant, slug) : Promise.resolve(null)),
    career: () => (/^[a-z0-9-]+$/.test(slug) ? getCareer(tenant, slug) : Promise.resolve(null)),
  };
  if (!Object.hasOwn(loaders, kind)) return Response.json({ error: "No encontrado" }, { status: 404 });
  const data = await loaders[kind]();
  if (data === null) return Response.json({ error: "No encontrado" }, { status: 404 });
  // no-store: React Query es la única caché del cliente. Vary: Host por si hay un proxy compartido.
  return Response.json(data, { headers: { "Cache-Control": "no-store", Vary: "Host" } });
}
