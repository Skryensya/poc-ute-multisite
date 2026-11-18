import Link from "next/link";
import type { SiteInfo } from "@/lib/types";

const nav = [["/", "Inicio"], ["/carreras", "Carreras"], ["/profesores", "Profesores"], ["/anuncios", "Anuncios"]];

export default function Header({ info: { site, links } }: { info: SiteInfo }) {
  return (
    <header className="sticky top-0 z-20 bg-primary text-white shadow">
      <div className="bg-black/20 text-xs">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-4 px-4 py-1.5">
          <span className="opacity-70">Nuestros sitios:</span>
          {links.map((l) => <a key={l.slug} href={l.url} className="hover:underline">{l.name}</a>)}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold">{site.name}</Link>
        <nav className="flex gap-5 text-sm font-medium">
          {nav.map(([href, label]) => <Link key={href} href={href} className="hover:underline underline-offset-4">{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
