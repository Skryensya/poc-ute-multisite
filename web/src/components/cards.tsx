import Link from "next/link";
import type { Announcement, Career, Course, Professor, SiteRef } from "@/lib/types";

const date = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" });

/** Hace visible el contenido compartido: un mismo registro de Strapi en varios sitios. */
export function SharedBadge({ sites, current }: { sites: SiteRef[]; current: string }) {
  const others = sites.filter((s) => s.slug !== current);
  if (others.length === 0) return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">Solo en este sitio</span>;
  return (
    <span title={sites.map((s) => s.name).join(", ")} className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
      {`⇄ Compartido con ${others.map((s) => s.name.replace("Facultad de ", "").replace("Universidad Tecnológica Experimental", "Universidad")).join(" y ")}`}
    </span>
  );
}

const Img = ({ src }: { src: string | null }) =>
  src ? <img src={src} alt="" loading="lazy" className="h-44 w-full object-cover" /> : <div className="h-44 w-full bg-soft" />;

export function CareerCard({ career, current }: { career: Career; current: string }) {
  return (
    <li className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/carreras/${career.slug}`} className="block">
        <Img src={career.imageUrl} />
        <div className="space-y-2 p-5">
          <SharedBadge sites={career.sites} current={current} />
          <h3 className="text-lg font-semibold text-primary">{career.name}</h3>
          <p className="text-sm text-slate-600">{career.description}</p>
          <p className="text-xs text-slate-500">{[career.degree, career.duration, career.modality].filter(Boolean).join(" · ")}</p>
        </div>
      </Link>
    </li>
  );
}

export function ProfessorCard({ professor, current }: { professor: Professor; current: string }) {
  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {professor.photoUrl && <img src={professor.photoUrl} alt={professor.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover" />}
      <div className="space-y-1">
        <SharedBadge sites={professor.sites} current={current} />
        <h3 className="font-semibold">{professor.name}</h3>
        <p className="text-xs font-medium text-primary">{professor.title}</p>
        <p className="text-sm text-slate-600">{professor.specialty}</p>
        {professor.bio && <p className="text-xs text-slate-500">{professor.bio}</p>}
      </div>
    </li>
  );
}

export function AnnouncementCard({ item, current }: { item: Announcement; current: string }) {
  return (
    <li className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Img src={item.imageUrl} />
      <div className="space-y-2 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {item.category && <span className="rounded-full bg-soft px-2.5 py-0.5 font-medium text-primary">{item.category}</span>}
          <time className="text-slate-500" dateTime={item.date}>{date.format(new Date(item.date))}</time>
        </div>
        <SharedBadge sites={item.sites} current={current} />
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-sm text-slate-600">{item.description}</p>
      </div>
    </li>
  );
}

/** Malla curricular agrupada por semestre. */
export function Malla({ courses }: { courses: Course[] }) {
  const bySemester = Map.groupBy(courses, (c) => c.semester);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...bySemester].map(([sem, list]) => (
        <div key={sem} className="rounded-xl border border-slate-200 bg-white">
          <p className="rounded-t-xl bg-primary px-4 py-2 text-sm font-semibold text-white">{`Semestre ${sem}`}</p>
          <ul className="divide-y divide-slate-100 text-sm">
            {list.map((c) => (
              <li key={c.code} className="flex justify-between gap-3 px-4 py-2.5">
                <span>{c.name}<span className="block text-xs text-slate-400">{c.code}</span></span>
                <span className="shrink-0 text-xs text-slate-500">{c.credits} cr.</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
