import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { dehydrate, HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hostFrom, normalizeHost, resolveTenant } from "@/lib/tenants";
import { homeKey } from "@/lib/queries";
import Home from "@/components/Home";
import type { HomeData } from "@/lib/types";

describe("resolución de tenant", () => {
  it("mapea cada dominio a su sitio", () => {
    expect(resolveTenant("ute1.allison.sh")).toBe("university");
    expect(resolveTenant("ute2.allison.sh")).toBe("engineering");
    expect(resolveTenant("ute3.allison.sh")).toBe("arts");
  });
  it("normaliza mayúsculas, puerto y punto final", () => {
    expect(normalizeHost("UTE2.Allison.sh:443")).toBe("ute2.allison.sh");
    expect(resolveTenant("ute3.allison.sh.")).toBe("arts");
  });
  it("hostname desconocido → null (sin tenant por defecto)", () => {
    for (const h of ["evil.com", "", null, undefined, "ute1.allison.sh.evil.com", "constructor", "__proto__"])
      expect(resolveTenant(h)).toBeNull();
  });
  it("ignora X-Forwarded-Host (solo se lee Host)", () => {
    const h = new Headers({ host: "evil.com", "x-forwarded-host": "ute1.allison.sh" });
    expect(resolveTenant(hostFrom(h))).toBeNull();
  });
});

describe("claves de query", () => {
  it("son específicas de cada tenant", () => {
    expect(homeKey("university")).toEqual(["site-home", "university"]);
    expect(homeKey("arts")).not.toEqual(homeKey("engineering"));
  });
});

const data: HomeData = {
  site: { documentId: "s", name: "Facultad de Artes", slug: "arts", title: "Facultad de Artes", description: "Desc", primaryColor: "#B5523B", secondaryColor: "#FBEFEA" },
  careers: [{ documentId: "c1", name: "Diseño", description: "d", duration: "10 semestres", degree: "Diseñador" }],
  announcements: [{ documentId: "a1", title: "Exposición anual", description: "x", date: "2026-10-28" }],
  links: [{ slug: "university", name: "Universidad Tecnológica Experimental", url: "https://ute1.allison.sh" }],
};

describe("hidratación de React Query", () => {
  it("renderiza HTML con contenido desde datos prefetcheados, sin pedir nada al navegador", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const server = new QueryClient();
    server.setQueryData(homeKey("arts"), data);
    const state = dehydrate(server);

    const browser = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
    const html = renderToString(
      <QueryClientProvider client={browser}>
        <HydrationBoundary state={state}><Home slug="arts" /></HydrationBoundary>
      </QueryClientProvider>,
    );
    expect(html).toContain("Facultad de Artes");
    expect(html).toContain("Diseño");
    expect(html).toContain("Exposición anual");
    expect(html).toContain("--primary:#B5523B");
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
