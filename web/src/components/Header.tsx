"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HUB } from "@/lib/tenants";
import type { SiteInfo } from "@/lib/types";
import { navFor } from "./nav";

const initials = (name: string) => name.split(" ").filter((w) => w.length > 3).map((w) => w[0]).join("").slice(0, 3).toUpperCase();

export default function Header({ info: { site, links } }: { info: SiteInfo }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  // La universidad primero: desde una facultad siempre se puede volver al sitio central.
  const sorted = [...links].sort((a, b) => Number(b.slug === HUB) - Number(a.slug === HUB));
  return (
    <header className="sticky top-0 z-20 bg-primary text-white shadow">
      <div className="hidden bg-black/20 text-xs sm:block">
        <div className="mx-auto flex max-w-6xl gap-x-5 px-4 py-1.5">
          {sorted.map((x) => (
            <a key={x.slug} href={x.url} className="opacity-80 hover:underline hover:opacity-100">
              {x.slug === HUB && site.slug !== HUB ? `← ${x.name}` : x.name}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display flex items-center gap-3 font-bold">
          <span className="grid h-9 min-w-9 place-items-center rounded-(--r-btn) bg-white px-1.5 font-sans text-sm font-extrabold tracking-tight text-primary">{initials(site.name)}</span>
          <span className="text-base leading-tight sm:text-lg">{site.name}</span>
        </Link>
        <button type="button" className="rounded-md p-2 hover:bg-white/10 lg:hidden" aria-expanded={open} aria-controls="menu" aria-label="Menú" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <nav id="menu" className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 bg-primary px-4 pb-4 shadow lg:static lg:flex lg:flex-row lg:gap-0.5 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          {navFor(site.slug).map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
              className={`rounded-(--r-btn) px-3 py-2 text-sm font-medium transition hover:bg-white/10 ${active(href) ? "bg-white/15" : ""}`}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
