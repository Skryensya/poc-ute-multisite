import Link from "next/link";
import type { Announcement, Career, Course, Professor, SiteRef } from "@/lib/types";

const date = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" });
const short = (n: string) => n.replace("Facultad de ", "").replace("Universidad Tecnológica del Este", "Universidad");
const card = "card";
const chip = "rounded-(--r-btn) bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600";

/** Un mismo registro de Strapi en varios sitios: se indica dónde más aparece. Si es exclusivo, no se muestra nada. */
export function SharedBadge({ sites, current, onImage }: { sites: SiteRef[]; current: string; onImage?: boolean }) {
  const others = sites.filter((s) => s.slug !== current);
  if (others.length === 0) return null;
  return (
    <span title={sites.map((s) => s.name).join(", ")}
      className={`inline-flex items-center gap-1 rounded-(--r-btn) px-2.5 py-0.5 text-xs font-medium ${onImage ? "bg-white/95 text-primary shadow" : "bg-soft text-primary"}`}>
      <span aria-hidden="true">⇄</span>{`También en ${others.map((s) => short(s.name)).join(" y ")}`}
    </span>
  );
}

function Photo({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  return src
    ? <img src={src} alt={alt} loading="lazy" className={`${className} object-cover`} />
    : <div className={`${className} bg-soft`} aria-hidden="true" />;
}

export function CareerCard({ career, current }: { career: Career; current: string }) {
  return (
    <li className={`group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none focus-within:ring-2 focus-within:ring-primary ${card}`}>
      <Link href={`/carreras/${career.slug}`} className="flex h-full flex-col outline-none">
        <div className="relative h-44 overflow-hidden">
          <Photo src={career.imageUrl} alt={career.name} className="h-full w-full transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />
          <div className="absolute left-3 top-3"><SharedBadge sites={career.sites} current={current} onImage /></div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-display text-lg font-semibold leading-snug text-primary">{career.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{career.description}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {[career.duration, career.modality].filter(Boolean).map((t) => <span key={t} className={chip}>{t}</span>)}
          </div>
          <span className="pt-1 text-sm font-medium text-primary">Ver plan de estudios →</span>
        </div>
      </Link>
    </li>
  );
}

const initialsOf = (name: string) => name.split(" ").filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w) && !/^(Dra?|Mg)\.?$/.test(w)).slice(0, 2).map((w) => w[0]).join("");

export function ProfessorCard({ professor: p, current }: { professor: Professor; current: string }) {
  return (
    <li className={`flex gap-4 p-5 ${card}`}>
      {p.photoUrl
        ? <img src={p.photoUrl} alt={p.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-(--r-avatar) object-cover ring-2 ring-soft" />
        : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-(--r-avatar) bg-soft text-xl font-bold text-primary" aria-hidden="true">{initialsOf(p.name)}</div>}
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold leading-snug">{p.name}</h3>
        {p.title && <p className="text-xs font-medium text-primary">{p.title}</p>}
        {p.specialty && <p className="text-sm text-slate-700">{p.specialty}</p>}
        {p.bio && <p className="line-clamp-3 text-sm text-slate-500">{p.bio}</p>}
        <div className="pt-1"><SharedBadge sites={p.sites} current={current} /></div>
      </div>
    </li>
  );
}

export function AnnouncementCard({ item, current, featured }: { item: Announcement; current: string; featured?: boolean }) {
  return (
    <li className={`overflow-hidden ${card} ${featured ? "md:col-span-2 md:flex" : ""}`}>
      <Photo src={item.imageUrl} alt={item.title} className={`h-48 w-full ${featured ? "md:h-auto md:w-1/2" : ""}`} />
      <div className={`space-y-2 p-5 ${featured ? "md:flex md:w-1/2 md:flex-col md:justify-center md:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.category && <span className="rounded-(--r-btn) bg-soft px-2.5 py-0.5 font-semibold text-primary">{item.category}</span>}
          <time className="text-slate-500" dateTime={item.date}>{date.format(new Date(item.date))}</time>
        </div>
        <h3 className={`font-semibold leading-snug ${featured ? "text-2xl" : ""}`}>{item.title}</h3>
        <p className="text-sm text-slate-600">{item.description}</p>
        <div><SharedBadge sites={item.sites} current={current} /></div>
      </div>
    </li>
  );
}

/** Plan de estudios agrupado por semestre, con los créditos de cada uno. */
export function Malla({ courses }: { courses: Course[] }) {
  const bySemester = Map.groupBy(courses, (c) => c.semester);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...bySemester].map(([sem, list]) => (
        <section key={sem} className={`overflow-hidden ${card}`}>
          <h3 className="flex items-center justify-between bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            <span>{`Semestre ${sem}`}</span>
            <span className="text-xs font-normal text-white/80">{`${list.reduce((n, c) => n + (c.credits ?? 0), 0)} créditos`}</span>
          </h3>
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
  );
}
