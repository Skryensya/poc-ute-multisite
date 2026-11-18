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

type Node = { kind: "h2" | "h3" | "ul" | "p"; lines: string[] };

/** Agrupa líneas consecutivas: un título es su propio nodo, las viñetas forman una lista y el resto un párrafo. */
function parse(text: string): Node[] {
  const out: Node[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) { out.push({ kind: "p", lines: [] }); continue; } // línea en blanco: corta el párrafo
    const head = /^(#{2,3}) (.*)$/.exec(line);
    if (head) { out.push({ kind: head[1] === "##" ? "h2" : "h3", lines: [head[2]] }, { kind: "p", lines: [] }); continue; }
    const item = /^[-*] (.*)$/.exec(line);
    const last = out[out.length - 1];
    if (item) {
      if (last?.kind === "ul") last.lines.push(item[1]); else out.push({ kind: "ul", lines: [item[1]] });
    } else if (last?.kind === "p") last.lines.push(line);
    else out.push({ kind: "p", lines: [line] });
  }
  return out.filter((n) => n.lines.length);
}

export default function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-slate-700">
      {parse(text).map((n, i) => {
        if (n.kind === "h2") return <h2 key={i} className="pt-4 text-2xl font-bold text-primary">{inline(n.lines[0])}</h2>;
        if (n.kind === "h3") return <h3 key={i} className="pt-2 text-lg font-semibold">{inline(n.lines[0])}</h3>;
        if (n.kind === "ul") return <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-primary">{n.lines.map((l, j) => <li key={j}>{inline(l)}</li>)}</ul>;
        return <p key={i}>{inline(n.lines.join(" "))}</p>;
      })}
    </div>
  );
}
