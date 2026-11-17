"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, homeKey } from "@/lib/queries";
import Header from "./Header";
import Hero from "./Hero";
import CareerList from "./CareerList";
import AnnouncementList from "./AnnouncementList";
import Footer from "./Footer";

export default function Home({ slug }: { slug: string }) {
  // Los datos ya vienen hidratados desde el servidor: sin loading ni refetch inmediato (staleTime).
  const { data } = useQuery({ queryKey: homeKey(slug), queryFn: fetchHome });
  if (!data) return null;
  const { site, careers, announcements, links } = data;
  const style = { "--primary": site.primaryColor, "--secondary": site.secondaryColor } as React.CSSProperties;
  return (
    <div style={style} className="flex min-h-screen flex-col">
      <Header name={site.name} links={links} />
      <main className="flex-1">
        <Hero title={site.title} description={site.description} />
        <CareerList careers={careers} />
        <AnnouncementList announcements={announcements} />
      </main>
      <Footer name={site.name} links={links} />
    </div>
  );
}
