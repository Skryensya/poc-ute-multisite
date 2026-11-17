import type { SiteLink } from "@/lib/types";

export default function Header({ name, links }: { name: string; links: SiteLink[] }) {
  return (
    <header className="bg-primary text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <span className="text-lg font-bold">{name}</span>
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((l) => (
            <a key={l.slug} href={l.url} className="underline-offset-4 hover:underline">{l.name}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
