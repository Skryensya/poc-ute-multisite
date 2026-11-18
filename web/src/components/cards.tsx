import Link from "next/link";
import { HUB, siteUrl, type Tenant } from "@/lib/tenants";
import type { Announcement, Career, Course, EventItem, Professor, SiteRef } from "@/lib/types";

const tz = "America/Santiago";
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CL", { timeZone: tz, ...o });
const dFull = fmt({ dateStyle: "long" });
const dayNum = fmt({ day: "numeric" }), monShort = fmt({ month: "short" }), weekday = fmt({ weekday: "long" }), hour = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
export const eventDate = (iso: string) => dFull.format(new Date(iso));
export const newsDate = (iso: string) => new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", dateStyle: "long" }).format(new Date(iso));
export const eventTime = (iso: string) => hour.format(new Date(iso));
// Las noticias traen solo fecha (sin hora): se formatea en UTC para que no retroceda un día en Santiago.
const utc = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", ...o });
const nMonth = utc({ day: "numeric", month: "long" }), nFull = utc({ dateStyle: "long" });
/** "12 de noviembre" si es de este año; con año si no. */
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return (d.getUTCFullYear() === new Date().getUTCFullYear() ? nMonth : nFull).format(d);
};

const short = (n: string) => n.replace("Facultad de ", "").replace("Universidad Tecnológica del Este", "Universidad");
const chip = "rounded-(--r-btn) bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600";
const tagChip = "rounded-(--r-btn) bg-soft px-2.5 py-0.5 text-xs font-medium text-primary";

/** Dónde vive un registro: en el sitio central lleva a la facultad dueña; en una facultad se queda en este sitio. */
function target(sites: SiteRef[], current: string, path: string) {
  const owner = current === HUB ? sites.find((s) => s.slug !== HUB) : undefined;
  return owner ? { href: `${siteUrl(owner.slug as Tenant)}${path}`, external: true } : { href: path, external: false };
}
/** Enlace "estirado" que cubre toda la tarjeta; los chips con z-10 quedan por encima y siguen siendo clicables. */
function Stretch({ href, external, children, className = "" }: { href: string; external: boolean; children: React.ReactNode; className?: string }) {
  const cls = `after:absolute after:inset-0 after:content-[''] ${className}`;
  return external ? <a href={href} className={cls}>{children}</a> : <Link href={href} className={cls}>{children}</Link>;
}

/**
 * El mismo registro de Strapi en varios sitios. En una facultad: "También en X y Y" (enlaza a ese sitio).
 * En el sitio central: la facultad a la que pertenece. Si es exclusivo del sitio actual, no muestra nada.
 */
export function SharedBadge({ sites, current, onImage, path = "/" }: { sites: SiteRef[]; current: string; onImage?: boolean; path?: string }) {
  const others = sites.filter((s) => s.slug !== current);
  if (others.length === 0) return null;
  return (
    <span className={`relative z-10 inline-flex flex-wrap items-center gap-x-1 rounded-(--r-btn) px-2.5 py-0.5 text-xs font-medium ${onImage ? "bg-white/95 text-primary shadow" : "bg-soft text-primary"}`}>
      <span aria-hidden="true">⇄</span>{current === HUB ? "En" : "También en"}
      {others.map((s, i) => (
        <span key={s.slug}>{i > 0 && " y "}<a href={`${siteUrl(s.slug as Tenant)}${path}`} className="underline-offset-2 hover:underline">{short(s.name)}</a></span>
      ))}
    </span>
  );
}

function Photo({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  return src
    ? <img src={src} alt={alt} loading="lazy" className={`${className} object-cover`} />
    : <div className={`${className} bg-soft`} aria-hidden="true" />;
}

export function CareerCard({ career, current }: { career: Career; current: string }) {
  const t = target(career.sites, current, `/carreras/${career.slug}`);
  return (
    <li className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none focus-within:ring-2 focus-within:ring-primary">
      <div className="relative h-44 overflow-hidden">
        <Photo src={career.imageUrl} alt={career.name} className="h-full w-full transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        <div className="absolute left-3 top-3"><SharedBadge sites={career.sites} current={current} onImage path={`/carreras/${career.slug}`} /></div>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-primary">
          <Stretch {...t} className="outline-none">{career.name}</Stretch>
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600">{career.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[career.duration, career.modality].filter(Boolean).map((x) => <span key={x} className={chip}>{x}</span>)}
        </div>
        <span className="pt-1 text-sm font-medium text-primary">{t.external ? "Ver en la facultad →" : "Ver plan de estudios →"}</span>
      </div>
    </li>
  );
}

const initialsOf = (name: string) => name.split(" ").filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w) && !/^(Dra?|Mg)\.?$/.test(w)).slice(0, 2).map((w) => w[0]).join("");

export function ProfessorCard({ professor: p, current }: { professor: Professor; current: string }) {
  return (
    <li className="card flex gap-4 p-5">
      {p.photoUrl
        ? <img src={p.photoUrl} alt={p.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-soft" />
        : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-soft text-xl font-bold text-primary" aria-hidden="true">{initialsOf(p.name)}</div>}
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold leading-snug">{p.name}</h3>
        {p.title && <p className="text-xs font-medium text-primary">{p.title}</p>}
        {p.specialty && <p className="text-sm text-slate-700">{p.specialty}</p>}
        {p.bio && <p className="line-clamp-3 text-sm text-slate-500">{p.bio}</p>}
        {!!p.careers?.length && (
          <p className="pt-1 text-xs text-slate-500">Dicta en{" "}
            {p.careers.map((c, i) => (
              <span key={c.slug}>{i > 0 && ", "}<Link href={`/carreras/${c.slug}`} className="font-medium text-primary hover:underline">{c.name}</Link></span>
            ))}
          </p>
        )}
        <div className="pt-1"><SharedBadge sites={p.sites} current={current} path="/profesores" /></div>
      </div>
    </li>
  );
}

export function AnnouncementCard({ item, current, featured }: { item: Announcement; current: string; featured?: boolean }) {
  const t = target(item.sites, current, `/noticias/${item.slug}`);
  return (
    <li className={`card relative flex flex-col overflow-hidden ${featured ? "lg:col-span-2 lg:flex-row" : ""}`}>
      <Photo src={item.imageUrl} alt={item.title} className={`h-48 w-full shrink-0 ${featured ? "lg:h-auto lg:w-1/2" : ""}`} />
      <div className={`flex flex-1 flex-col gap-2 p-5 ${featured ? "lg:justify-center lg:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.category && <span className="font-semibold uppercase tracking-wide text-primary">{item.category}</span>}
          <time className="text-slate-500" dateTime={item.date}>{shortDate(item.date)}</time>
        </div>
        <h3 className={`font-display font-semibold leading-snug ${featured ? "text-2xl" : "text-lg"}`}><Stretch {...t} className="outline-none">{item.title}</Stretch></h3>
        <p className="line-clamp-3 text-sm text-slate-600">{item.description}</p>
        {!!item.tags?.length && <div className="flex flex-wrap gap-1.5 pt-1">{item.tags.map((t) => <span key={t} className={tagChip}>{t}</span>)}</div>}
        <div><SharedBadge sites={item.sites} current={current} path={`/noticias/${item.slug}`} /></div>
      </div>
    </li>
  );
}

/** Actividad de la agenda: bloque de fecha + datos clave. Lleva a su ficha (en la facultad cuando se ve desde el sitio central). */
export function EventCard({ event: e, current }: { event: EventItem; current: string }) {
  const path = `/agenda/${e.slug}`, t = target(e.sites, current, path), d = new Date(e.startsAt);
  return (
    <li className="card relative flex gap-4 p-4 transition hover:shadow-md motion-reduce:transition-none focus-within:ring-2 focus-within:ring-primary">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-(--r-btn) bg-primary text-white" aria-hidden="true">
        <span className="text-2xl font-bold leading-none">{dayNum.format(d)}</span>
        <span className="mt-0.5 text-xs uppercase">{monShort.format(d).replace(".", "")}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{e.eventType}</p>
        <h3 className="font-display font-semibold leading-snug"><Stretch {...t} className="outline-none">{e.title}</Stretch></h3>
        <p className="text-xs text-slate-500">{`${weekday.format(d)} · ${eventTime(e.startsAt)} h · ${e.place ?? ""}`}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={chip}>{e.free ? "Gratis" : e.price}</span>
          {e.online && <span className={chip}>Online</span>}
          {e.tags?.slice(0, 2).map((x) => <span key={x} className={tagChip}>{x}</span>)}
          <SharedBadge sites={e.sites} current={current} path={path} />
        </div>
      </div>
    </li>
  );
}

/** Plan de estudios agrupado por año (dos semestres), con los créditos de cada semestre. */
export function Malla({ courses }: { courses: Course[] }) {
  const bySemester = Map.groupBy(courses, (c) => c.semester);
  const years = Map.groupBy([...bySemester], ([sem]) => Math.ceil(sem / 2));
  return (
    <div className="space-y-8">
      {[...years].map(([year, sems]) => (
        <div key={year}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{`Año ${year}`}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sems.map(([sem, list]) => (
              <section key={sem} className="card overflow-hidden">
                <h4 className="flex items-center justify-between bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                  <span>{`Semestre ${sem}`}</span>
                  <span className="text-xs font-normal text-white/80">{`${list.reduce((n, c) => n + (c.credits ?? 0), 0)} créditos`}</span>
                </h4>
                <ul className="divide-y divide-slate-100 text-sm">
                  {list.map((c) => (
                    <li key={c.code} className="flex justify-between gap-3 px-4 py-2.5">
                      <span>{c.name}<span className="block text-xs text-slate-400">{c.code}</span></span>
                      <span className="shrink-0 text-xs text-slate-500">{`${c.credits} cr.`}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
