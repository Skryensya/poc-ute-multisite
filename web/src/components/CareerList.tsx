import type { Career } from "@/lib/types";
import CareerCard from "./CareerCard";

export default function CareerList({ careers }: { careers: Career[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-2xl font-bold">Carreras</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {careers.map((c) => <CareerCard key={c.documentId} career={c} />)}
      </ul>
    </section>
  );
}
