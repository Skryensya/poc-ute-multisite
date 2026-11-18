"use client";
import Link from "next/link";
import { useState } from "react";
import { extraOf } from "@/lib/extras";
import { qk } from "@/lib/queries";
import { HUB, siteUrl, type Tenant } from "@/lib/tenants";
import type { Announcement, Career, CareerDetail, EventDetail, EventItem, HomeData, NewsDetail, Page, Professor, SiteInfo } from "@/lib/types";
import { useContent } from "./useContent";
import Hero from "./Hero";
import Prose from "./Prose";
import Explorer, { type Facet } from "./Explorer";
import { AnnouncementCard, CareerCard, EventCard, Malla, ProfessorCard, SharedBadge, eventDate, eventTime, newsDate } from "./cards";

const Section = ({ title, href, linkLabel = "Ver todo", intro, children }: { title: string; href?: string; linkLabel?: string; intro?: string | null; children: React.ReactNode }) => (
  <section className="mx-auto max-w-6xl px-4 py-12">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="section-title text-2xl font-bold">{title}</h2>
        {intro && <p className="mt-1 max-w-2xl text-slate-600">{intro}</p>}
      </div>
      {href && <Link href={href} className="text-sm font-medium text-primary hover:underline">{`${linkLabel} →`}</Link>}
    </div>
    {children}
  </section>
);
const Grid = ({ children, cols = "md:grid-cols-2 lg:grid-cols-3" }: { children: React.ReactNode; cols?: string }) => (
  <ul className={`grid gap-5 ${cols}`}>{children}</ul>
);
const PageTitle = ({ title, subtitle, crumbs }: { title: string; subtitle?: string | null; crumbs?: [string, string][] }) => (
  <div className="bg-soft"><div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
    {crumbs && (
      <nav aria-label="Ruta" className="mb-3 text-sm text-slate-500">
        {crumbs.map(([href, label]) => <span key={href}><Link href={href} className="hover:underline">{label}</Link>{" / "}</span>)}
      </nav>
    )}
    <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
    {subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-600">{subtitle}</p>}
  </div></div>
);
const Stats = ({ stats }: { stats: NonNullable<Page["stats"]> }) => (
  <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4">
    <dl className="card grid grid-cols-2 gap-px overflow-hidden bg-slate-200 shadow-lg lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col bg-white px-5 py-6 text-center">
          <dt className="order-2 mt-1 text-sm text-slate-600">{s.label}</dt>
          <dd className="font-display text-3xl font-extrabold text-primary">{s.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

/** Filtro por chips de una sola opción; "Todas" limpia el filtro. No se muestra si hay una sola opción. */
function Chips({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  if (options.length < 2) return null;
  const pill = (on: boolean) => `rounded-(--r-btn) px-4 py-1.5 text-sm font-medium transition ${on ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`;
  return (
    <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={label}>
      <button type="button" className={pill(!value)} aria-pressed={!value} onClick={() => onChange("")}>Todas</button>
      {options.map((o) => <button key={o} type="button" className={pill(value === o)} aria-pressed={value === o} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}
const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))];
const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Búsqueda simple por texto (carreras y profesores). */
function Searchable<T>({ items, text, label, children, empty, noun }: {
  items: T[]; text: (i: T) => string; label: string; empty: string; noun: [string, string]; children: (shown: T[]) => React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const shown = q.trim() ? items.filter((i) => norm(text(i)).includes(norm(q.trim()))) : items;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500" aria-live="polite">{shown.length === items.length ? "" : `${shown.length} de `}{`${items.length} ${noun[items.length === 1 ? 0 : 1]}`}</p>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={label} aria-label={label}
          className="w-full rounded-(--r-btn) border border-slate-300 bg-white px-5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 sm:w-80" />
      </div>
      {shown.length ? children(shown) : <p className="rounded-(--r-card) bg-slate-50 p-10 text-center text-slate-500">{empty}</p>}
    </>
  );
}

const shortName = (n: string) => n.replace("Facultad de ", "");
const monthLabel = (ym: string) => new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(`${ym}-15`));
const ymSantiago = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit" }).format(new Date(iso)).slice(0, 7);

// Facetas de noticias y agenda. En el sitio central se agrega "Facultad", porque ahí se mezclan todas.
const facultyFacet = <T extends { sites: { name: string; slug: string }[] }>(slug: string): Facet<T>[] =>
  slug === HUB ? [{ key: "faculty", label: "Facultad", values: (i) => i.sites.filter((s) => s.slug !== HUB).map((s) => shortName(s.name)) }] : [];
const newsFacets = (slug: string): Facet<Announcement>[] => [
  ...facultyFacet<Announcement>(slug),
  { key: "tags", label: "Temas", values: (n) => n.tags ?? [] },
  { key: "category", label: "Tipo", values: (n) => (n.category ? [n.category] : []) },
  { key: "month", label: "Mes", values: (n) => [n.date.slice(0, 7)], format: monthLabel, order: "key" },
];
const eventFacets = (slug: string): Facet<EventItem>[] => [
  ...facultyFacet<EventItem>(slug),
  { key: "type", label: "Tipo de actividad", values: (e) => (e.eventType ? [e.eventType] : []) },
  { key: "tags", label: "Temas", values: (e) => e.tags ?? [] },
  { key: "place", label: "Lugar", values: (e) => (e.place ? [e.place] : []) },
  { key: "audience", label: "Público", values: (e) => e.audience ?? [] },
  { key: "cost", label: "Precio", values: (e) => [e.free ? "Gratis" : "Con costo"] },
  { key: "mode", label: "Modalidad", values: (e) => [e.online ? "Online" : "Presencial"] },
  { key: "month", label: "Mes", values: (e) => [ymSantiago(e.startsAt)], format: monthLabel, order: "key" },
];

export function HomeView({ slug }: { slug: string }) {
  const { site, links } = useContent<SiteInfo>(qk.site(slug), "site")!;
  const { careers, professors, announcements, events, about } = useContent<HomeData>(qk.home(slug), "home")!;
  const hub = links.find((l) => l.slug === HUB);
  const extra = extraOf(slug);
  return (
    <>
      <Hero site={site} />
      {about?.stats && <Stats stats={about.stats} />}
      {slug === HUB ? (
        <Section title="Nuestras facultades">
          <Grid cols="md:grid-cols-2">
            {links.map((l) => (
              <li key={l.slug} className="card group relative overflow-hidden transition hover:shadow-lg motion-reduce:transition-none focus-within:ring-2 focus-within:ring-primary">
                <div className="h-44 overflow-hidden bg-soft">
                  {l.heroImage && <img src={l.heroImage} alt={l.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-primary"><a href={l.url} className="outline-none after:absolute after:inset-0 after:content-['']">{l.name}</a></h3>
                  <p className="mt-1 text-sm text-slate-600">{l.tagline}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-primary">Visitar sitio →</span>
                </div>
              </li>
            ))}
          </Grid>
        </Section>
      ) : hub && (
        <div className="mx-auto mt-10 max-w-6xl px-4">
          <a href={hub.url} className="card flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:shadow-md motion-reduce:transition-none">
            <span className="text-slate-700">{`${site.name} es parte de `}<strong className="text-primary">{hub.name}</strong>. Conoce toda su oferta, noticias y agenda.</span>
            <span className="text-sm font-medium text-primary">Ir al sitio central →</span>
          </a>
        </div>
      )}
      {events.length > 0 && (
        <Section title="Próximas actividades" href="/agenda" linkLabel="Ver toda la agenda"><Grid cols="md:grid-cols-2">{events.map((e) => <EventCard key={e.documentId} event={e} current={slug} />)}</Grid></Section>
      )}
      <Section title="Noticias" href="/noticias" linkLabel="Ver todas las noticias">
        <Grid cols="lg:grid-cols-3">{announcements.map((a, i) => <AnnouncementCard key={a.documentId} item={a} current={slug} featured={i === 0} />)}</Grid>
      </Section>
      <Section title="Carreras" href="/carreras" linkLabel="Ver todas las carreras"><Grid>{careers.map((c) => <CareerCard key={c.documentId} career={c} current={slug} />)}</Grid></Section>
      {about && (
        <section className="bg-soft">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
            {about.imageUrl && <img src={about.imageUrl} alt={about.title} loading="lazy" className="aspect-[3/2] w-full rounded-(--r-card) object-cover shadow-md" />}
            <div>
              <h2 className="section-title text-2xl font-bold text-primary">{about.title}</h2>
              {about.intro && <p className="mt-3 text-lg text-slate-700">{about.intro}</p>}
              <Link href="/nosotros" className="mt-5 inline-block rounded-(--r-btn) bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">Conoce más</Link>
            </div>
          </div>
        </section>
      )}
      {extra && (
        <Section title={extra.title} href={extra.path} linkLabel={extra.label === "Admisión" ? "Ver el proceso" : `Ver ${extra.label.toLowerCase()}`} intro={extra.teaser}>
          {extra.layout === "cards"
            ? <Grid>{extra.items.slice(0, 3).map((x) => <li key={x.title} className="card overflow-hidden">{x.image && <img src={x.image} alt={x.title} loading="lazy" className="h-36 w-full object-cover" />}<p className="p-4 text-sm font-semibold">{x.title}</p></li>)}</Grid>
            : <Grid cols="sm:grid-cols-2 lg:grid-cols-4">{extra.items.map((x, i) => <li key={x.title} className="card p-5"><span className="font-display text-3xl font-bold text-primary">{i + 1}</span><p className="mt-1 text-sm font-semibold">{x.title}</p>{x.meta && <p className="mt-1 text-xs text-slate-500">{x.meta[0]}</p>}</li>)}</Grid>}
        </Section>
      )}
      <Section title="Profesores" href="/profesores" linkLabel="Ver todos los profesores"><Grid cols="md:grid-cols-2">{professors.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section>
    </>
  );
}

const usePages = (slug: string) => useContent<SiteInfo>(qk.site(slug), "site")!.pages;

export function AboutView({ slug }: { slug: string }) {
  const p = useContent<Page>(qk.page(slug, "nosotros"), "page", "nosotros")!;
  const hub = useContent<SiteInfo>(qk.site(slug), "site")!.links.find((l) => l.slug === HUB);
  return (
    <>
      <PageTitle title={p.title} subtitle={p.intro} />
      {p.stats && <div className="pt-0"><Stats stats={p.stats} /></div>}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">{p.body && <Prose text={p.body} />}</div>
        {p.imageUrl && <img src={p.imageUrl} alt={p.title} loading="lazy" className="aspect-[3/2] w-full rounded-(--r-card) object-cover shadow-md lg:sticky lg:top-24 lg:self-start" />}
      </section>
      {p.values && (
        <Section title="Lo que nos define">
          <Grid cols="sm:grid-cols-2 lg:grid-cols-3">
            {p.values.map((v) => (
              <li key={v.title} className="card p-6"><h3 className="font-semibold text-primary">{v.title}</h3><p className="mt-2 text-sm text-slate-600">{v.text}</p></li>
            ))}
          </Grid>
        </Section>
      )}
      <section className="bg-soft"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10">
        <p className="text-lg font-semibold text-primary">Conoce nuestros programas y a quienes los hacen posibles.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/carreras" className="rounded-(--r-btn) bg-primary px-6 py-2.5 text-sm font-semibold text-white">Carreras</Link>
          <Link href="/profesores" className="rounded-(--r-btn) border border-primary px-6 py-2.5 text-sm font-semibold text-primary">Profesores</Link>
          {hub && slug !== HUB && <a href={hub.url} className="rounded-(--r-btn) border border-primary px-6 py-2.5 text-sm font-semibold text-primary">{`Ir a ${hub.name}`}</a>}
        </div>
      </div></section>
    </>
  );
}

export function CareersView({ slug }: { slug: string }) {
  const careers = useContent<Career[]>(qk.careers(slug), "careers")!;
  const page = usePages(slug).carreras;
  const [mod, setMod] = useState("");
  const list = mod ? careers.filter((c) => c.modality === mod) : careers;
  return (
    <>
      <PageTitle title={page?.title ?? "Carreras"} subtitle={page?.intro} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Chips options={uniq(careers.map((c) => c.modality))} value={mod} onChange={setMod} label="Filtrar por modalidad" />
        <Searchable items={list} text={(c) => `${c.name} ${c.description} ${c.degree}`} label="Buscar una carrera" empty="No encontramos carreras con esa búsqueda." noun={["carrera", "carreras"]}>
          {(shown) => <Grid>{shown.map((c) => <CareerCard key={c.documentId} career={c} current={slug} />)}</Grid>}
        </Searchable>
      </section>
    </>
  );
}

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-0.5 font-medium">{value}</dd></div>
);

export function CareerDetailView({ slug, careerSlug }: { slug: string; careerSlug: string }) {
  const c = useContent<CareerDetail>(qk.career(slug, careerSlug), "career", careerSlug)!;
  const credits = c.courses.reduce((n, x) => n + (x.credits ?? 0), 0);
  const semesters = new Set(c.courses.map((x) => x.semester)).size;
  return (
    <>
      <PageTitle title={c.name} subtitle={c.description} crumbs={[["/carreras", "Carreras"]]} />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">{c.overview && <Prose text={c.overview} />}</div>
        <aside className="card h-fit p-6">
          <dl className="divide-y divide-slate-100">
            {c.degree && <Fact label="Título" value={c.degree} />}
            {c.duration && <Fact label="Duración" value={c.duration} />}
            {c.modality && <Fact label="Modalidad" value={c.modality} />}
          </dl>
          <div className="pt-3"><SharedBadge sites={c.sites} current={slug} path={`/carreras/${c.slug}`} /></div>
        </aside>
      </section>
      <Section title="Plan de estudios" intro={`${semesters} semestres · ${credits} créditos en total. Malla vigente de la carrera.`}><Malla courses={c.courses} /></Section>
      {c.professors.length > 0 && (
        <Section title="Profesores de la carrera"><Grid cols="md:grid-cols-2">{c.professors.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section>
      )}
    </>
  );
}

export function ProfessorsView({ slug }: { slug: string }) {
  const list = useContent<Professor[]>(qk.professors(slug), "professors")!;
  const page = usePages(slug).profesores;
  return (
    <>
      <PageTitle title={page?.title ?? "Profesores"} subtitle={page?.intro} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Searchable items={list} text={(p) => `${p.name} ${p.title} ${p.specialty}`} label="Buscar por nombre o especialidad" empty="No encontramos profesores con esa búsqueda." noun={["profesor", "profesores"]}>
          {(shown) => <Grid cols="md:grid-cols-2">{shown.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid>}
        </Searchable>
      </section>
    </>
  );
}

export function NewsView({ slug }: { slug: string }) {
  const list = useContent<Announcement[]>(qk.announcements(slug), "announcements")!;
  const page = usePages(slug).anuncios;
  return (
    <>
      <PageTitle title={page?.title ?? "Noticias"} subtitle={page?.intro} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Explorer items={list} facets={newsFacets(slug)} noun={["noticia", "noticias"]} empty="No hay noticias con esos filtros."
          text={(n) => `${n.title} ${n.description} ${(n.tags ?? []).join(" ")} ${n.category ?? ""}`}>
          {(shown) => <Grid cols="md:grid-cols-2">{shown.map((a) => <AnnouncementCard key={a.documentId} item={a} current={slug} />)}</Grid>}
        </Explorer>
      </section>
    </>
  );
}

export function AgendaView({ slug }: { slug: string }) {
  const list = useContent<EventItem[]>(qk.events(slug), "events")!;
  const { site, links } = useContent<SiteInfo>(qk.site(slug), "site")!;
  const hub = links.find((l) => l.slug === HUB);
  const faculty = slug !== HUB;
  return (
    <>
      <PageTitle title={faculty ? `Agenda de ${site.name}` : "Agenda"} subtitle="Charlas, talleres, exposiciones, conciertos y más. Filtra por tipo, tema, lugar, público o precio." />
      <section className="mx-auto max-w-6xl px-4 py-10">
        {faculty && hub && (
          <p className="card mb-6 flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm text-slate-700">
            <span>{`Aquí ves solo las actividades de ${site.name}.`}</span>
            <a href={`${hub.url}/agenda`} className="font-medium text-primary hover:underline">{`Ver la agenda completa de ${hub.name} →`}</a>
          </p>
        )}
        <Explorer items={list} facets={eventFacets(slug)} noun={["actividad", "actividades"]} empty="No hay actividades con esos filtros." pinned={faculty ? site.name : undefined}
          text={(e) => `${e.title} ${e.description} ${e.unit ?? ""} ${(e.tags ?? []).join(" ")}`}>
          {(shown) => <Grid cols="grid-cols-1">{shown.map((e) => <EventCard key={e.documentId} event={e} current={slug} />)}</Grid>}
        </Explorer>
      </section>
    </>
  );
}

const minutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 200));

export function NewsDetailView({ slug, newsSlug }: { slug: string; newsSlug: string }) {
  const n = useContent<NewsDetail>(qk.newsItem(slug, newsSlug), "newsItem", newsSlug)!;
  return (
    <>
      <PageTitle title={n.title} subtitle={n.description} crumbs={[["/noticias", "Noticias"]]} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          {n.category && <span className="font-semibold uppercase tracking-wide text-primary">{n.category}</span>}
          <time dateTime={n.date}>{newsDate(n.date)}</time>
          {n.author && <span>{`Por ${n.author}`}</span>}
          {n.body && <span>{`${minutes(n.body)} min de lectura`}</span>}
        </p>
        {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="mb-8 aspect-[16/9] w-full rounded-(--r-card) object-cover shadow-md" />}
        {n.body && <Prose text={n.body} />}
        {!!n.tags?.length && <div className="mt-8 flex flex-wrap gap-2">{n.tags.map((t) => <span key={t} className="rounded-(--r-btn) bg-soft px-3 py-1 text-xs font-medium text-primary">{t}</span>)}</div>}
        <div className="mt-4"><SharedBadge sites={n.sites} current={slug} path={`/noticias/${n.slug}`} /></div>
      </article>
      {n.related.length > 0 && (
        <Section title="Más noticias sobre estos temas"><Grid cols="md:grid-cols-3">{n.related.map((r) => <AnnouncementCard key={r.documentId} item={r} current={slug} />)}</Grid></Section>
      )}
    </>
  );
}

export function EventDetailView({ slug, eventSlug }: { slug: string; eventSlug: string }) {
  const e = useContent<EventDetail>(qk.event(slug, eventSlug), "event", eventSlug)!;
  const hub = useContent<SiteInfo>(qk.site(slug), "site")!.links.find((l) => l.slug === HUB);
  return (
    <>
      <PageTitle title={e.title} subtitle={e.eventType} crumbs={[["/agenda", "Agenda"]]} />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="aspect-[16/9] w-full rounded-(--r-card) object-cover shadow-md" />}
          {e.body ? <Prose text={e.body} /> : <p className="text-lg text-slate-700">{e.description}</p>}
          {!!e.program?.length && (
            <div>
              <h2 className="section-title mb-4 text-xl font-bold">Programa</h2>
              <ol className="card divide-y divide-slate-100">
                {e.program.map((p) => <li key={`${p.time}${p.title}`} className="flex gap-4 px-5 py-3 text-sm"><span className="w-14 shrink-0 font-semibold text-primary">{p.time}</span><span>{p.title}</span></li>)}
              </ol>
            </div>
          )}
          {!!e.speakers?.length && (
            <div>
              <h2 className="section-title mb-4 text-xl font-bold">{e.speakers.length > 1 ? "Quiénes participan" : "Quién participa"}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {e.speakers.map((s) => <li key={s.name} className="card px-5 py-3"><p className="font-semibold">{s.name}</p><p className="text-sm text-slate-500">{s.role}</p></li>)}
              </ul>
            </div>
          )}
          {!!e.tags?.length && <div className="flex flex-wrap gap-2">{e.tags.map((t) => <span key={t} className="rounded-(--r-btn) bg-soft px-3 py-1 text-xs font-medium text-primary">{t}</span>)}</div>}
        </div>
        <aside className="card h-fit p-6">
          <dl className="divide-y divide-slate-100">
            <Fact label="Fecha" value={eventDate(e.startsAt)} />
            <Fact label="Hora" value={`${eventTime(e.startsAt)}${e.endsAt ? ` a ${eventTime(e.endsAt)}` : ""} h`} />
            {e.place && <Fact label="Lugar" value={e.online ? "Online" : e.place} />}
            <Fact label="Precio" value={e.free ? "Gratis" : (e.price ?? "Con costo")} />
            {!!e.audience?.length && <Fact label="Dirigido a" value={e.audience.join(", ")} />}
            {e.unit && <Fact label="Organiza" value={e.unit} />}
          </dl>
          <div className="space-y-2 pt-3">
            <SharedBadge sites={e.sites} current={slug} path={`/agenda/${e.slug}`} />
            {hub && slug !== HUB && <p><a href={`${siteUrl(HUB as Tenant)}/agenda`} className="text-sm font-medium text-primary hover:underline">Ver la agenda de la Universidad →</a></p>}
          </div>
        </aside>
      </section>
      {e.related.length > 0 && (
        <Section title="Otras actividades que te pueden interesar"><Grid cols="grid-cols-1">{e.related.map((r) => <EventCard key={r.documentId} event={r} current={slug} />)}</Grid></Section>
      )}
    </>
  );
}

export function ExtraView({ slug }: { slug: string }) {
  const x = extraOf(slug)!;
  return (
    <>
      <PageTitle title={x.title} subtitle={x.intro} />
      <section className="mx-auto max-w-6xl px-4 py-12">
        {x.layout === "steps" ? (
          <ol className="grid gap-5 md:grid-cols-2">
            {x.items.map((it, i) => (
              <li key={it.title} className="card flex gap-4 p-6">
                <span className="font-display text-4xl font-bold text-primary">{i + 1}</span>
                <div><h2 className="font-semibold">{it.title}</h2><p className="mt-1 text-sm text-slate-600">{it.text}</p>
                  {it.meta?.map((m) => <p key={m} className="mt-2 inline-block rounded-(--r-btn) bg-soft px-2.5 py-0.5 text-xs font-medium text-primary">{m}</p>)}</div>
              </li>
            ))}
          </ol>
        ) : (
          <Grid>
            {x.items.map((it) => (
              <li key={it.title} className="card overflow-hidden">
                {it.image && <img src={it.image} alt={it.title} loading="lazy" className="h-44 w-full object-cover" />}
                <div className="space-y-2 p-5"><h2 className="font-display font-semibold text-primary">{it.title}</h2><p className="text-sm text-slate-600">{it.text}</p>
                  <div className="flex flex-wrap gap-1.5">{it.meta?.map((m) => <span key={m} className="rounded-(--r-btn) bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{m}</span>)}</div></div>
              </li>
            ))}
          </Grid>
        )}
        {x.cta && <p className="mt-10 text-center"><Link href={x.cta.href} className="inline-block rounded-(--r-btn) bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90">{x.cta.label}</Link></p>}
      </section>
    </>
  );
}
