"use client";
import { useState } from "react";

/** Una faceta de filtro (como las de la agenda de la UC): cada elemento puede tener varios valores. */
export interface Facet<T> { key: string; label: string; values: (item: T) => string[]; format?: (value: string) => string; order?: "count" | "key" }

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const COLLAPSED = 6;

/**
 * Buscador + filtros por varias facetas. Dentro de una faceta se suman (O); entre facetas se combinan (Y).
 * Los conteos de cada opción se calculan con los demás filtros ya aplicados, así nunca prometen resultados que no hay.
 */
export default function Explorer<T>({ items, facets, text, noun, empty, children }: {
  items: T[]; facets: Facet<T>[]; text: (item: T) => string; noun: [string, string]; empty: string; children: (shown: T[]) => React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [more, setMore] = useState<Record<string, boolean>>({});
  const [panel, setPanel] = useState(false); // filtros plegados en móvil; siempre visibles en escritorio

  const matches = (item: T, skip?: string) =>
    (!q.trim() || norm(text(item)).includes(norm(q.trim()))) &&
    facets.every((f) => f.key === skip || !sel[f.key]?.length || f.values(item).some((v) => sel[f.key].includes(v)));
  const shown = items.filter((i) => matches(i));
  const active = facets.flatMap((f) => (sel[f.key] ?? []).map((v) => [f, v] as const));

  const toggle = (key: string, v: string) =>
    setSel((s) => ({ ...s, [key]: s[key]?.includes(v) ? s[key].filter((x) => x !== v) : [...(s[key] ?? []), v] }));
  const clear = () => { setSel({}); setQ(""); };

  const groups = facets.map((f) => {
    const counts = new Map<string, number>();
    for (const i of items) if (matches(i, f.key)) for (const v of new Set(f.values(i))) counts.set(v, (counts.get(v) ?? 0) + 1);
    for (const v of sel[f.key] ?? []) if (!counts.has(v)) counts.set(v, 0);
    const opts = [...counts].filter(([v, n]) => n > 0 || sel[f.key]?.includes(v))
      .sort((a, b) => (f.order === "key" ? a[0].localeCompare(b[0]) : b[1] - a[1] || a[0].localeCompare(b[0])));
    return { f, opts };
  }).filter((g) => g.opts.length > 1 || sel[g.f.key]?.length);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside>
        <button type="button" aria-expanded={panel} onClick={() => setPanel(!panel)}
          className="mb-3 flex w-full items-center justify-between rounded-(--r-btn) bg-soft px-4 py-2.5 text-sm font-semibold text-primary lg:hidden">
          {`Filtros${active.length ? ` (${active.length})` : ""}`}<span aria-hidden="true">{panel ? "▴" : "▾"}</span>
        </button>
        <div className={`${panel ? "block" : "hidden"} lg:block`}>
          <div className="space-y-6">
            {groups.map(({ f, opts }) => {
              const open = more[f.key], list = open ? opts : opts.slice(0, COLLAPSED);
              return (
                <fieldset key={f.key}>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{f.label}</legend>
                  <ul className="space-y-1">
                    {list.map(([v, n]) => (
                      <li key={v}>
                        <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-slate-50">
                          <input type="checkbox" className="accent-(--primary)" checked={!!sel[f.key]?.includes(v)} onChange={() => toggle(f.key, v)} />
                          <span className="flex-1">{f.format ? f.format(v) : v}</span>
                          <span className="text-xs text-slate-400">{n}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  {opts.length > COLLAPSED && (
                    <button type="button" className="mt-1 px-1 text-xs font-medium text-primary hover:underline" onClick={() => setMore((m) => ({ ...m, [f.key]: !open }))}>
                      {open ? "Ver menos" : `Ver ${opts.length - COLLAPSED} más`}
                    </button>
                  )}
                </fieldset>
              );
            })}
          </div>
        </div>
      </aside>
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar"
            className="w-full rounded-(--r-btn) border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 sm:w-72" />
          <p className="text-sm text-slate-500" aria-live="polite">{`${shown.length} ${noun[shown.length === 1 ? 0 : 1]}`}</p>
          {(active.length > 0 || q) && <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={clear}>Limpiar filtros</button>}
        </div>
        {active.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {active.map(([f, v]) => (
              <button key={`${f.key}:${v}`} type="button" onClick={() => toggle(f.key, v)} aria-label={`Quitar filtro ${f.format ? f.format(v) : v}`}
                className="rounded-(--r-btn) bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90">{`${f.format ? f.format(v) : v} ✕`}</button>
            ))}
          </div>
        )}
        {shown.length ? children(shown) : <p className="rounded-(--r-card) bg-slate-50 p-10 text-center text-slate-500">{empty}</p>}
      </div>
    </div>
  );
}
