import Link from "next/link";
import type { Site } from "@/lib/types";

export default function Hero({ site }: { site: Site }) {
  return (
    <section className="relative isolate overflow-hidden text-white">
      {site.heroImage && <img src={site.heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:pb-36 sm:pt-28">
        {site.tagline && <p className="text-sm font-semibold uppercase tracking-widest text-white/80">{site.tagline}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">{site.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/90">{site.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/carreras" className="rounded-full bg-white px-6 py-3 font-semibold text-primary transition hover:bg-soft">Explorar carreras</Link>
          <Link href="/nosotros" className="rounded-full border border-white/70 px-6 py-3 font-semibold transition hover:bg-white/10">Conócenos</Link>
        </div>
      </div>
    </section>
  );
}
