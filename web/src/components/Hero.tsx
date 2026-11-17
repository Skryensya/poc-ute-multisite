export default function Hero({ title, description }: { title: string; description: string }) {
  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-bold text-primary sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">{description}</p>
      </div>
    </section>
  );
}
