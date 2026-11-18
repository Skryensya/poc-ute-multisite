import Link from "next/link";
import type { SiteInfo } from "@/lib/types";
import { nav } from "./nav";

const title = "text-xs font-semibold uppercase tracking-wider text-white";

export default function Footer({ info: { site, links } }: { info: SiteInfo }) {
  return (
    <footer className="bg-primary text-sm text-white/85">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-base font-bold text-white">{site.name}</p>
          {site.tagline && <p className="mt-2 max-w-xs text-white/70">{site.tagline}</p>}
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
          <ul className="mt-3 space-y-1.5">{links.map((l) => <li key={l.slug}><a href={l.url} className="hover:underline">{l.name}</a></li>)}</ul>
        </div>
      </div>
      <p className="border-t border-white/15 py-5 text-center text-xs text-white/60">{`© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`}</p>
    </footer>
  );
}
