"use client";
import Link from "next/link";
import { qk } from "@/lib/queries";
import { HUB } from "@/lib/tenants";
import type { Announcement, Career, CareerDetail, HomeData, Professor, SiteInfo } from "@/lib/types";
import { useContent } from "./useContent";
import Hero from "./Hero";
import { AnnouncementCard, CareerCard, Malla, ProfessorCard, SharedBadge } from "./cards";

const Section = ({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) => (
  <section className="mx-auto max-w-6xl px-4 py-12">
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      {href && <Link href={href} className="text-sm font-medium text-primary hover:underline">Ver todo →</Link>}
    </div>
    {children}
  </section>
);
const Grid = ({ children, cols = "md:grid-cols-2 lg:grid-cols-3" }: { children: React.ReactNode; cols?: string }) => (
  <ul className={`grid gap-5 ${cols}`}>{children}</ul>
);
const PageTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="bg-soft"><div className="mx-auto max-w-6xl px-4 py-12">
    <h1 className="text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
    {subtitle && <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>}
  </div></div>
);

export function HomeView({ slug }: { slug: string }) {
  const { site, links } = useContent<SiteInfo>(qk.site(slug), "site")!;
  const { careers, professors, announcements } = useContent<HomeData>(qk.home(slug), "home")!;
  return (
    <>
      <Hero site={site} />
      {slug === HUB && (
        <Section title="Nuestras facultades">
          <Grid cols="md:grid-cols-2">
            {links.map((l) => (
              <li key={l.slug} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <a href={l.url}>
                  {l.heroImage && <img src={l.heroImage} alt="" loading="lazy" className="h-40 w-full object-cover" />}
                  <div className="p-5"><h3 className="text-lg font-semibold text-primary">{l.name}</h3><p className="text-sm text-slate-600">{l.tagline}</p></div>
                </a>
              </li>
            ))}
          </Grid>
        </Section>
      )}
      <Section title="Carreras" href="/carreras"><Grid>{careers.map((c) => <CareerCard key={c.documentId} career={c} current={slug} />)}</Grid></Section>
      <Section title="Profesores" href="/profesores"><Grid cols="md:grid-cols-2">{professors.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section>
      <Section title="Anuncios" href="/anuncios"><Grid>{announcements.map((a) => <AnnouncementCard key={a.documentId} item={a} current={slug} />)}</Grid></Section>
    </>
  );
}

export function CareersView({ slug }: { slug: string }) {
  const careers = useContent<Career[]>(qk.careers(slug), "careers")!;
  return (<><PageTitle title="Carreras" subtitle="Programas de pregrado. Las etiquetas indican qué carreras se comparten con otros sitios de la universidad." />
    <Section title={`${careers.length} carreras`}><Grid>{careers.map((c) => <CareerCard key={c.documentId} career={c} current={slug} />)}</Grid></Section></>);
}

export function CareerDetailView({ slug, careerSlug }: { slug: string; careerSlug: string }) {
  const c = useContent<CareerDetail>(qk.career(slug, careerSlug), "career", careerSlug)!;
  return (
    <>
      <PageTitle title={c.name} subtitle={c.overview ?? c.description} />
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <SharedBadge sites={c.sites} current={slug} />
          {[c.degree, c.duration, c.modality].filter(Boolean).map((t) => <span key={t} className="rounded-full bg-slate-100 px-3 py-1">{t}</span>)}
        </div>
      </section>
      <Section title="Malla curricular"><p className="-mt-3 mb-5 text-sm text-slate-500">Primeros 6 semestres.</p><Malla courses={c.courses} /></Section>
      {c.professors.length > 0 && (
        <Section title="Profesores de la carrera"><Grid cols="md:grid-cols-2">{c.professors.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section>
      )}
    </>
  );
}

export function ProfessorsView({ slug }: { slug: string }) {
  const list = useContent<Professor[]>(qk.professors(slug), "professors")!;
  return (<><PageTitle title="Profesores" subtitle="Cuerpo académico de este sitio. Algunos profesores enseñan en más de una facultad." />
    <Section title={`${list.length} profesores`}><Grid cols="md:grid-cols-2">{list.map((p) => <ProfessorCard key={p.documentId} professor={p} current={slug} />)}</Grid></Section></>);
}

export function AnnouncementsView({ slug }: { slug: string }) {
  const list = useContent<Announcement[]>(qk.announcements(slug), "announcements")!;
  return (<><PageTitle title="Anuncios" subtitle="Noticias institucionales y de la facultad." />
    <Section title={`${list.length} anuncios`}><Grid>{list.map((a) => <AnnouncementCard key={a.documentId} item={a} current={slug} />)}</Grid></Section></>);
}
