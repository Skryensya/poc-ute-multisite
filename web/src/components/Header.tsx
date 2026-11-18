"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { themeOf, type Theme } from "@/lib/theme";
import type { SiteInfo } from "@/lib/types";
import { nav } from "./nav";

const initials = (name: string) => name.split(" ").filter((w) => w.length > 3).map((w) => w[0]).join("").slice(0, 3).toUpperCase();

// Cada sitio tiene su propia cabecera: institucional (color), técnica (oscura) y editorial (papel).
const look: Record<Theme, { bar: string; top: string; mark: string; brand: string; link: (on: boolean) => string; menu: string }> = {
  classic: {
    bar: "bg-primary text-white shadow", top: "bg-black/20", brand: "font-display font-bold",
    mark: "rounded-md bg-white text-primary",
    link: (on) => `rounded-(--r-btn) hover:bg-white/10 ${on ? "bg-white/15" : ""}`, menu: "bg-primary",
  },
  tech: {
    bar: "border-b-2 border-primary bg-slate-900 text-white", top: "bg-black/40", brand: "font-bold tracking-tight",
    mark: "rounded-sm bg-primary text-white",
    link: (on) => `rounded-sm eyebrow text-xs uppercase tracking-wider hover:text-white ${on ? "bg-primary text-white" : "text-slate-300"}`, menu: "bg-slate-900",
  },
  editorial: {
    bar: "border-b border-primary/15 bg-(--page) text-slate-900", top: "bg-primary text-white", brand: "font-display text-xl italic",
    mark: "rounded-full bg-primary text-white",
    link: (on) => `rounded-full hover:bg-primary/10 ${on ? "bg-primary/10 text-primary" : ""}`, menu: "bg-(--page)",
  },
};

export default function Header({ info: { site, links } }: { info: SiteInfo }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const l = look[themeOf(site.slug)];
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className={`sticky top-0 z-20 ${l.bar}`}>
      <div className={`hidden text-xs sm:block ${l.top}`}>
        <div className="mx-auto flex max-w-6xl gap-x-5 px-4 py-1.5">
          {links.map((x) => <a key={x.slug} href={x.url} className="opacity-80 hover:underline hover:opacity-100">{x.name}</a>)}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className={`flex items-center gap-3 ${l.brand}`}>
          <span className={`grid h-9 min-w-9 place-items-center px-1.5 text-sm font-extrabold tracking-tight ${l.mark}`}>{initials(site.name)}</span>
          <span className="text-base leading-tight sm:text-lg">{site.name}</span>
        </Link>
        <button type="button" className="rounded-md p-2 hover:bg-black/10 md:hidden" aria-expanded={open} aria-controls="menu" aria-label="Menú" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <nav id="menu" className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 px-4 pb-4 shadow md:static md:flex md:flex-row md:gap-1 md:bg-transparent md:p-0 md:shadow-none ${l.menu}`}>
          {nav.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
              className={`px-3 py-2 text-sm font-medium transition ${l.link(active(href))}`}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
