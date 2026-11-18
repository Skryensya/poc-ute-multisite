/** Markdown mínimo (títulos, listas, negrita, cursiva, enlaces) de los campos de texto enriquecido de Strapi. Sin HTML crudo. */
const inline = (t: string) =>
  t.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((p, i) => {
    if (p.startsWith("**") && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    // solo http(s) o rutas propias: nunca javascript:
    if (link) return /^(https?:\/\/|\/)/.test(link[2]) ? <a key={i} href={link[2]} className="text-primary underline">{link[1]}</a> : link[1];
    return p;
  });

export default function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-slate-700">
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.trim().split("\n");
        const head = /^(#{2,3}) (.*)$/.exec(lines[0]);
        if (head) return head[1] === "##"
          ? <h2 key={i} className="pt-4 text-2xl font-bold text-primary">{inline(head[2])}</h2>
          : <h3 key={i} className="pt-2 text-lg font-semibold">{inline(head[2])}</h3>;
        if (lines.every((l) => /^[-*] /.test(l)))
          return <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-primary">{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
