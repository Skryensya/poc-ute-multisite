import type { Career } from "@/lib/types";

export default function CareerCard({ career }: { career: Career }) {
  return (
    <li className="rounded-lg border border-slate-200 p-5">
      <h3 className="font-semibold text-primary">{career.name}</h3>
      <p className="mt-2 text-sm text-slate-600">{career.description}</p>
      <p className="mt-3 text-xs text-slate-500">
        {[career.degree, career.duration].filter(Boolean).join(" · ")}
      </p>
    </li>
  );
}
