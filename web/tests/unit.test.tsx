import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { dehydrate, HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hostFrom, normalizeHost, resolveTenant } from "@/lib/tenants";
import { qk } from "@/lib/queries";
import { HomeView } from "@/components/views";

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
    expect(qk.home("university")).toEqual(["home", "university"]);
    expect(qk.career("arts", "diseno")).toEqual(["career", "arts", "diseno"]);
    for (const k of ["site", "home", "careers", "professors", "announcements"] as const)
      expect(qk[k]("arts")).not.toEqual(qk[k]("engineering"));
    expect(qk.page("arts", "nosotros")).not.toEqual(qk.page("engineering", "nosotros"));
  });
});

const site = { documentId: "s", name: "Facultad de Artes", slug: "arts", title: "Facultad de Artes", tagline: "t", description: "Desc", heroImage: null, email: null, address: null, primaryColor: "#B5523B", secondaryColor: "#FBEFEA" };
const refs = { arts: { name: "Facultad de Artes", slug: "arts" }, university: { name: "Universidad Tecnológica del Este", slug: "university" } };
const about = { slug: "nosotros", title: "Sobre la Facultad de Artes", intro: "Un espacio abierto para crear.", body: null, imageUrl: null, stats: [{ value: "30+", label: "exposiciones al año" }], values: null };
const info = { site, pages: {}, links: [{ slug: "university", name: "Universidad Tecnológica del Este", tagline: null, heroImage: null, url: "https://ute1.allison.sh" }] };
const home = {
  about,
  events: [{ documentId: "e1", slug: "concierto", title: "Concierto de invierno", description: "x", startsAt: "2027-03-02T21:00:00.000Z", endsAt: null, eventType: "Concierto", place: "Casa de las Artes", online: false, free: true, price: "", audience: ["Público en general"], tags: ["Música"], unit: null, imageUrl: null, sites: [refs.arts, refs.university] }],
  careers: [{ documentId: "c1", slug: "diseno", name: "Diseño", description: "d", overview: null, duration: "10 semestres", degree: "Diseñador", modality: null, imageUrl: null, sites: [refs.arts, refs.university] }],
  professors: [{ documentId: "p1", name: "Javiera Núñez", title: "Dra.", specialty: "Pintura", bio: null, photoUrl: null, sites: [refs.arts] }],
  announcements: [{ documentId: "a1", title: "Exposición anual", description: "x", date: "2026-10-28", category: "Extensión", tags: ["Exposiciones"], imageUrl: null, sites: [refs.arts] }],
};

describe("hidratación de React Query", () => {
  it("renderiza HTML con contenido desde datos prefetcheados, sin pedir nada al navegador", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const server = new QueryClient();
    server.setQueryData(qk.site("arts"), info);
    server.setQueryData(qk.home("arts"), home);
    const state = dehydrate(server);

    const browser = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
    const html = renderToString(
      <QueryClientProvider client={browser}>
        <HydrationBoundary state={state}><HomeView slug="arts" /></HydrationBoundary>
      </QueryClientProvider>,
    );
    expect(html).toContain("Facultad de Artes");
    expect(html).toContain("Diseño");
    expect(html).toContain("Javiera Núñez");
    expect(html).toContain("Exposición anual");
    expect(html).toContain("También en"); expect(html).toContain("Universidad"); // etiqueta de contenido compartido, con enlace al otro sitio
    expect(html).toContain("https://ute1.allison.sh/carreras/diseno"); // navegación entre sitios
    expect(html).toContain("Concierto de invierno"); expect(html).toContain("Exposiciones"); // agenda y etiquetas
    expect(html).toContain("exposiciones al año"); // estadísticas editables desde Strapi
    expect(html).toContain("Sobre la Facultad de Artes");
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
