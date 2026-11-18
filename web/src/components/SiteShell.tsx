"use client";
import { qk } from "@/lib/queries";
import type { SiteInfo } from "@/lib/types";
import { useContent } from "./useContent";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteShell({ slug, children }: { slug: string; children: React.ReactNode }) {
  const info = useContent<SiteInfo>(qk.site(slug), "site");
  if (!info) return null;
  const style = { "--primary": info.site.primaryColor, "--secondary": info.site.secondaryColor } as React.CSSProperties;
  return (
    <div style={style} className="flex min-h-screen flex-col">
      <Header info={info} />
      <main className="flex-1">{children}</main>
      <Footer info={info} />
    </div>
  );
}
