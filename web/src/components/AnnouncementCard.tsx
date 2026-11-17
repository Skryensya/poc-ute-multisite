import type { Announcement } from "@/lib/types";

const fmt = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" });

export default function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <li className="border-l-4 border-primary bg-soft p-5">
      <time className="text-xs text-slate-500" dateTime={item.date}>{fmt.format(new Date(item.date))}</time>
      <h3 className="mt-1 font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm text-slate-700">{item.description}</p>
    </li>
  );
}
