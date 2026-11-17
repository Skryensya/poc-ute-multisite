import type { SiteLink } from "@/lib/types";

export default function Footer({ name, links }: { name: string; links: SiteLink[] }) {
  return (
    <footer className="bg-primary text-sm text-white/90">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-4 py-6">
        <span>© 2026 {name}. Sitio de demostración.</span>
        <span>
          {links.map((l, i) => (
            <span key={l.slug}>{i > 0 && " · "}<a href={l.url} className="underline">{l.name}</a></span>
          ))}
        </span>
      </div>
    </footer>
  );
}
