import Link from "next/link";
import type { Site } from "@/lib/types";

export default function Hero({ site }: { site: Site }) {
  return (
    <section className="relative isolate overflow-hidden text-center text-white">
      {site.heroImage && <img src={site.heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/70" />
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-24 sm:pb-40 sm:pt-32">
        {site.tagline && <p className="text-sm font-semibold uppercase tracking-widest text-white/80">{site.tagline}</p>}
        <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-6xl">{site.title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">{site.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/carreras" className="rounded-(--r-btn) bg-white px-6 py-3 font-semibold text-primary transition hover:bg-soft">Explorar carreras</Link>
          <Link href="/agenda" className="rounded-(--r-btn) border border-white/70 px-6 py-3 font-semibold transition hover:bg-white/10">Ver la agenda</Link>
        </div>
      </div>
    </section>
  );
}
