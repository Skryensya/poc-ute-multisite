import Link from "next/link";
import { themeOf, type Theme } from "@/lib/theme";
import type { SiteInfo } from "@/lib/types";
import { nav } from "./nav";

const look: Record<Theme, { bar: string; head: string; brand: string }> = {
  classic: { bar: "bg-primary text-white/85", head: "text-white", brand: "font-display text-lg font-bold text-white" },
  tech: { bar: "border-t-4 border-primary bg-slate-900 text-slate-300", head: "eyebrow text-primary brightness-150", brand: "text-lg font-bold tracking-tight text-white" },
  editorial: { bar: "mt-8 border-t border-primary/20 text-slate-700", head: "text-primary", brand: "font-display text-4xl italic text-primary" },
};

export default function Footer({ info: { site, links } }: { info: SiteInfo }) {
  const l = look[themeOf(site.slug)];
  const title = `text-xs font-semibold uppercase tracking-wider ${l.head}`;
  return (
    <footer className={`text-sm ${l.bar}`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className={l.brand}>{site.name}</p>
          {site.tagline && <p className="mt-2 max-w-xs opacity-75">{site.tagline}</p>}
        </div>
        <div>
          <p className={title}>Explora</p>
          <ul className="mt-3 space-y-1.5">{nav.map(([href, label]) => <li key={href}><Link href={href} className="hover:underline">{label}</Link></li>)}</ul>
        </div>
        <div>
          <p className={title}>Contacto</p>
          <address className="mt-3 space-y-1.5 not-italic">
            {site.address && <p>{site.address}</p>}
            {site.email && <p><a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></p>}
          </address>
        </div>
        <div>
          <p className={title}>Nuestros sitios</p>
          <ul className="mt-3 space-y-1.5">{links.map((x) => <li key={x.slug}><a href={x.url} className="hover:underline">{x.name}</a></li>)}</ul>
        </div>
      </div>
      <p className="border-t border-current/15 py-5 text-center text-xs opacity-60">{`© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`}</p>
    </footer>
  );
}
