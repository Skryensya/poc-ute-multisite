// Integración: requiere la app corriendo contra un Strapi con el seed aplicado.
//   SMOKE_URL=http://localhost:3000 npm test        (se fuerza el header Host por dominio)
// Sin SMOKE_URL estas pruebas se omiten.
import { describe, expect, it } from "vitest";
import http from "node:http";

const base = process.env.SMOKE_URL;
const get = (path: string, host: string) =>
  new Promise<{ status: number; body: string }>((resolve, reject) => {
    const u = new URL(path, base);
    http.get({ hostname: u.hostname, port: u.port, path: u.pathname, headers: { host } }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode!, body }));
    }).on("error", reject);
  });

const UTE1 = "ute1.allison.sh", UTE2 = "ute2.allison.sh", UTE3 = "ute3.allison.sh";

describe.skipIf(!base)("mismo `/`, distinto contenido por dominio", () => {
  it("branding y nombre por dominio", async () => {
    const [a, b, c] = await Promise.all([UTE1, UTE2, UTE3].map((h) => get("/", h)));
    expect(a.body).toContain("Universidad Tecnológica Experimental"); expect(a.body).toContain("#1F3A8A");
    expect(b.body).toContain("Facultad de Ingeniería"); expect(b.body).toContain("#007EA7");
    expect(c.body).toContain("Facultad de Artes"); expect(c.body).toContain("#B5523B");
  });
  it("carreras: compartidas aparecen en todos los asignados; exclusivas no se filtran", async () => {
    const [u, e, a] = (await Promise.all([UTE1, UTE2, UTE3].map((h) => get("/", h)))).map((r) => r.body);
    for (const b of [u, e, a]) expect(b).toContain("Innovación y Tecnología Creativa"); // compartida
    expect(e).toContain("Ingeniería Electrónica"); expect(a).not.toContain("Ingeniería Electrónica"); expect(u).not.toContain("Ingeniería Electrónica");
    expect(a).toContain("Licenciatura en Música"); expect(e).not.toContain("Licenciatura en Música"); expect(u).not.toContain("Licenciatura en Música");
  });
  it("anuncios: compartido en los 3; exclusivos aislados", async () => {
    const [u, e, a] = (await Promise.all([UTE1, UTE2, UTE3].map((h) => get("/", h)))).map((r) => r.body);
    for (const b of [u, e, a]) expect(b).toContain("Postulaciones abiertas para el año académico 2027");
    expect(e).toContain("Nueva infraestructura para laboratorios"); expect(a).not.toContain("Nueva infraestructura"); expect(u).not.toContain("Nueva infraestructura");
    expect(a).toContain("Exposición anual de estudiantes"); expect(e).not.toContain("Exposición anual"); expect(u).not.toContain("Exposición anual");
  });
  it("enlaces entre sitios", async () => {
    const [u, e] = await Promise.all([UTE1, UTE2].map((h) => get("/", h)));
    expect(u.body).toContain("https://ute2.allison.sh"); expect(u.body).toContain("https://ute3.allison.sh");
    expect(e.body).toContain("https://ute1.allison.sh");
  });
  it("hostname desconocido → 404 en / y en /api/home", async () => {
    expect((await get("/", "otro.example.com")).status).toBe(404);
    expect((await get("/api/home", "otro.example.com")).status).toBe(404);
  });
  it("/api/home devuelve solo los datos del sitio y no expone secretos", async () => {
    const r = await get("/api/home", UTE3);
    const json = JSON.parse(r.body);
    expect(json.site.slug).toBe("arts");
    expect(json.careers.map((c: { name: string }) => c.name)).not.toContain("Ingeniería Electrónica");
    for (const k of ["STRAPI_API_TOKEN", "Bearer"]) expect(r.body).not.toContain(k);
    const token = process.env.STRAPI_API_TOKEN;
    if (token) {
      expect((await get("/", UTE1)).body).not.toContain(token);
      expect(r.body).not.toContain(token);
    }
  });
});
