import type { Announcement } from "@/lib/types";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <h2 className="text-2xl font-bold">Anuncios</h2>
      <ul className="mt-6 space-y-4">
        {announcements.map((a) => <AnnouncementCard key={a.documentId} item={a} />)}
      </ul>
    </section>
  );
}
