"use client";
import { qk } from "@/lib/queries";
import { themeOf } from "@/lib/theme";
import type { SiteInfo } from "@/lib/types";
import { useContent } from "./useContent";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteShell({ slug, children }: { slug: string; children: React.ReactNode }) {
  const info = useContent<SiteInfo>(qk.site(slug), "site");
  if (!info) return null;
  const style = { "--primary": info.site.primaryColor, "--secondary": info.site.secondaryColor } as React.CSSProperties;
  return (
    <div style={style} data-theme={themeOf(slug)} className="flex min-h-screen flex-col bg-(--page)">
      <a href="#contenido" className="sr-only z-30 bg-white px-4 py-2 text-primary focus:not-sr-only focus:absolute focus:left-2 focus:top-2">Saltar al contenido</a>
      <Header info={info} />
      <main id="contenido" className="flex-1">{children}</main>
      <Footer info={info} />
    </div>
  );
}
