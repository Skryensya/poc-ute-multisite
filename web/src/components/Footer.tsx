import type { SiteInfo } from "@/lib/types";

export default function Footer({ info: { site, links } }: { info: SiteInfo }) {
  return (
    <footer className="bg-primary text-sm text-white/90">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-white">{site.name}</p>
          {site.tagline && <p className="mt-1 text-white/70">{site.tagline}</p>}
        </div>
        <div>
          <p className="font-semibold text-white">Contacto</p>
          {site.address && <p className="mt-1">{site.address}</p>}
          {site.email && <p>{site.email}</p>}
        </div>
        <div>
          <p className="font-semibold text-white">Nuestros sitios</p>
          {links.map((l) => <p key={l.slug}><a href={l.url} className="underline">{l.name}</a></p>)}
        </div>
      </div>
      <p className="border-t border-white/20 py-4 text-center text-xs text-white/60">© 2026 Universidad Tecnológica Experimental · Sitio de demostración</p>
    </footer>
  );
}
