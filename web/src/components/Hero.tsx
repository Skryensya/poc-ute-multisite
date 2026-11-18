import Link from "next/link";
import { themeOf } from "@/lib/theme";
import type { Site } from "@/lib/types";

const Img = ({ site, className }: { site: Site; className: string }) =>
  site.heroImage ? <img src={site.heroImage} alt="" className={`${className} object-cover`} /> : null;

/** Tres portadas distintas según el tema del sitio: centrada e institucional, técnica en dos columnas y editorial. */
export default function Hero({ site }: { site: Site }) {
  const theme = themeOf(site.slug);

  if (theme === "tech") return (
    <section className="relative isolate overflow-hidden bg-slate-900 text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-32 pt-14 lg:grid-cols-2 lg:pb-36 lg:pt-20">
        <div>
          {site.tagline && <p className="eyebrow text-xs uppercase tracking-[0.2em] text-primary brightness-150">{`// ${site.tagline}`}</p>}
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{site.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/carreras" className="rounded-(--r-btn) bg-primary px-6 py-3 font-semibold text-white transition hover:brightness-110">Explorar carreras</Link>
            <Link href="/nosotros" className="rounded-(--r-btn) border border-slate-500 px-6 py-3 font-semibold transition hover:border-white">Conócenos</Link>
          </div>
        </div>
        <div className="relative">
          <div className="border border-primary/70 p-2"><Img site={site} className="aspect-[16/10] w-full" /></div>
          <span aria-hidden="true" className="absolute -bottom-2 -right-2 h-5 w-5 bg-primary" />
          <span aria-hidden="true" className="absolute -left-2 -top-2 h-5 w-5 border-l-2 border-t-2 border-primary" />
        </div>
      </div>
    </section>
  );

  if (theme === "editorial") return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-28 pt-12 lg:grid-cols-[1.25fr_1fr] lg:pt-20">
      <div>
        {site.tagline && <p className="font-display text-lg italic text-primary">{site.tagline}</p>}
        <h1 className="font-display mt-3 text-5xl leading-[1.05] sm:text-7xl">{site.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-slate-600">{site.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/carreras" className="rounded-(--r-btn) bg-primary px-7 py-3 font-semibold text-white transition hover:brightness-110">Explorar carreras</Link>
          <Link href="/nosotros" className="rounded-(--r-btn) border border-primary px-7 py-3 font-semibold text-primary transition hover:bg-primary/10">Conócenos</Link>
        </div>
      </div>
      <div className="relative">
        <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full rounded-b-3xl rounded-t-[999px] bg-primary/15" />
        <Img site={site} className="relative aspect-[4/5] w-full rounded-b-3xl rounded-t-[999px]" />
      </div>
    </section>
  );

  return (
    <section className="relative isolate overflow-hidden text-center text-white">
      <Img site={site} className="absolute inset-0 -z-20 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/70" />
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-24 sm:pb-40 sm:pt-32">
        {site.tagline && <p className="text-sm font-semibold uppercase tracking-widest text-white/80">{site.tagline}</p>}
        <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-6xl">{site.title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">{site.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/carreras" className="rounded-(--r-btn) bg-white px-6 py-3 font-semibold text-primary transition hover:bg-soft">Explorar carreras</Link>
          <Link href="/nosotros" className="rounded-(--r-btn) border border-white/70 px-6 py-3 font-semibold transition hover:bg-white/10">Conócenos</Link>
        </div>
      </div>
    </section>
  );
}
