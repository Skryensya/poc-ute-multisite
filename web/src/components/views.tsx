"use client";
import Link from "next/link";
import { useState } from "react";
import { qk } from "@/lib/queries";
import { themeOf } from "@/lib/theme";
import { HUB } from "@/lib/tenants";
import type { Announcement, Career, CareerDetail, HomeData, Page, Professor, SiteInfo } from "@/lib/types";
import { useContent } from "./useContent";
import Hero from "./Hero";
import Prose from "./Prose";
import { AnnouncementCard, CareerCard, Malla, ProfessorCard, SharedBadge } from "./cards";

const Section = ({ title, href, intro, children }: { title: string; href?: string; intro?: string | null; children: React.ReactNode }) => (
  <section className="mx-auto max-w-6xl px-4 py-12">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="section-title text-2xl font-bold">{title}</h2>
        {intro && <p className="mt-1 max-w-2xl text-slate-600">{intro}</p>}
      </div>
      {href && <Link href={href} className="text-sm font-medium text-primary hover:underline">Ver todo →</Link>}
    </div>
    {children}
  </section>
);
const Grid = ({ children, cols = "md:grid-cols-2 lg:grid-cols-3" }: { children: React.ReactNode; cols?: string }) => (
  <ul className={`grid gap-5 ${cols}`}>{children}</ul>
);
// Encabezado de página: franja de color (clásico), panel oscuro con cuadrícula (técnico) o titular editorial.
const titleLook = {
  classic: { wrap: "bg-soft", h1: "text-3xl text-primary sm:text-4xl", sub: "text-slate-600", crumb: "text-slate-500" },
  tech: { wrap: "bg-slate-900 [background-image:linear-gradient(rgb(255_255_255/.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.05)_1px,transparent_1px)] [background-size:36px_36px]", h1: "text-3xl tracking-tight text-white sm:text-4xl", sub: "text-slate-300", crumb: "text-slate-400" },
  editorial: { wrap: "border-b border-primary/20", h1: "text-4xl italic text-primary sm:text-6xl", sub: "text-slate-600", crumb: "text-slate-500" },
};
const PageTitle = ({ slug, title, subtitle, crumbs }: { slug: string; title: string; subtitle?: string | null; crumbs?: [string, string][] }) => {
  const l = titleLook[themeOf(slug)];
  return (
    <div className={l.wrap}><div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
      {crumbs && (
        <nav aria-label="Ruta" className={`mb-3 text-sm ${l.crumb}`}>
          {crumbs.map(([href, label]) => <span key={href}><Link href={href} className="hover:underline">{label}</Link>{" / "}</span>)}
        </nav>
      )}
      <h1 className={`font-display font-bold ${l.h1}`}>{title}</h1>
      {subtitle && <p className={`mt-3 max-w-2xl text-lg ${l.sub}`}>{subtitle}</p>}
    </div></div>
  );
};
const Stats = ({ stats, overlap }: { stats: NonNullable<Page["stats"]>; overlap?: boolean }) => (
  <div className={`relative z-10 mx-auto max-w-6xl px-4 ${overlap ? "-mt-14" : "mt-8"}`}>
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

/** Filtro por texto, sin acentos ni mayúsculas, en el navegador (las listas son pequeñas). */
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

export function HomeView({ slug }: { slug: string }) {
  const { site, links } = useContent<SiteInfo>(qk.site(slug), "site")!;
  const { careers, professors, announcements, about } = useContent<HomeData>(qk.home(slug), "home")!;
  return (
    <>
      <Hero site={site} />
      {about?.stats && <Stats stats={about.stats} overlap />}
      {slug === HUB && (
        <Section title="Nuestras facultades">
          <Grid cols="md:grid-cols-2">
            {links.map((l) => (
              <li key={l.slug} className="card group overflow-hidden transition hover:shadow-lg motion-reduce:transition-none">
                <a href={l.url} className="block">
                  <div className="h-44 overflow-hidden bg-soft">
                    {l.heroImage && <img src={l.heroImage} alt={l.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />}
                  </div>
                  <div className="p-5"><h3 className="font-display text-lg font-semibold text-primary">{l.name}</h3><p className="mt-1 text-sm text-slate-600">{l.tagline}</p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary">Visitar sitio →</span></div>
                </a>
              </li>
            ))}
          </Grid>
        </Section>
      )}
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
      <Section title="Carreras" href="/carreras"><Grid>{careers.map((c) => <CareerCard key={c.documentId} career={c} current={slug} />)}</Grid></Section>
      <Section title="Profesores" href="/profesores"><Grid cols="md:grid-cols-2">{professors.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section>
      <Section title="Noticias" href="/anuncios"><Grid>{announcements.map((a) => <AnnouncementCard key={a.documentId} item={a} current={slug} />)}</Grid></Section>
    </>
  );
}

const usePages = (slug: string) => useContent<SiteInfo>(qk.site(slug), "site")!.pages;

export function AboutView({ slug }: { slug: string }) {
  const p = useContent<Page>(qk.page(slug, "nosotros"), "page", "nosotros")!;
  return (
    <>
      <PageTitle slug={slug} title={p.title} subtitle={p.intro} />
      {p.stats && <Stats stats={p.stats} />}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">{p.body && <Prose text={p.body} />}</div>
        {p.imageUrl && <img src={p.imageUrl} alt={p.title} loading="lazy" className="aspect-[3/2] w-full rounded-(--r-card) object-cover shadow-md lg:sticky lg:top-24 lg:self-start" />}
      </section>
      {p.values && (
        <Section title="Lo que nos define">
          <Grid cols="sm:grid-cols-2 lg:grid-cols-3">
            {p.values.map((v) => (
              <li key={v.title} className="card p-6">
                <h3 className="font-semibold text-primary">{v.title}</h3><p className="mt-2 text-sm text-slate-600">{v.text}</p>
              </li>
            ))}
          </Grid>
        </Section>
      )}
      <section className="bg-soft"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10">
        <p className="text-lg font-semibold text-primary">Conoce nuestros programas y a quienes los hacen posibles.</p>
        <div className="flex gap-3">
          <Link href="/carreras" className="rounded-(--r-btn) bg-primary px-6 py-2.5 text-sm font-semibold text-white">Carreras</Link>
          <Link href="/profesores" className="rounded-(--r-btn) border border-primary px-6 py-2.5 text-sm font-semibold text-primary">Profesores</Link>
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
      <PageTitle slug={slug} title={page?.title ?? "Carreras"} subtitle={page?.intro} />
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
  return (
    <>
      <PageTitle slug={slug} title={c.name} subtitle={c.description} crumbs={[["/carreras", "Carreras"]]} />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">{c.overview && <Prose text={c.overview} />}</div>
        <aside className="card h-fit p-6">
          <dl className="divide-y divide-slate-100">
            {c.degree && <Fact label="Título" value={c.degree} />}
            {c.duration && <Fact label="Duración" value={c.duration} />}
            {c.modality && <Fact label="Modalidad" value={c.modality} />}
          </dl>
          <div className="pt-3"><SharedBadge sites={c.sites} current={slug} /></div>
        </aside>
      </section>
      <Section title="Plan de estudios" intro={`Semestres 1 a 6 (${credits} créditos). El plan completo se entrega al matricularse.`}><Malla courses={c.courses} /></Section>
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
      <PageTitle slug={slug} title={page?.title ?? "Profesores"} subtitle={page?.intro} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Searchable items={list} text={(p) => `${p.name} ${p.title} ${p.specialty}`} label="Buscar por nombre o especialidad" empty="No encontramos profesores con esa búsqueda." noun={["profesor", "profesores"]}>
          {(shown) => <Grid cols="md:grid-cols-2">{shown.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid>}
        </Searchable>
      </section>
    </>
  );
}

export function AnnouncementsView({ slug }: { slug: string }) {
  const list = useContent<Announcement[]>(qk.announcements(slug), "announcements")!;
  const page = usePages(slug).anuncios;
  const [cat, setCat] = useState("");
  const shown = cat ? list.filter((a) => a.category === cat) : list;
  return (
    <>
      <PageTitle slug={slug} title={page?.title ?? "Anuncios"} subtitle={page?.intro} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Chips options={uniq(list.map((a) => a.category))} value={cat} onChange={setCat} label="Filtrar por categoría" />
        <Grid>{shown.map((a, i) => <AnnouncementCard key={a.documentId} item={a} current={slug} featured={i === 0} />)}</Grid>
      </section>
    </>
  );
}
