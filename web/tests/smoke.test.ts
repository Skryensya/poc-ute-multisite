// Integración: requiere la app corriendo contra un Strapi con el seed aplicado.
//   SMOKE_URL=http://localhost:3000 npm test        (se fuerza el header Host por dominio)
// Sin SMOKE_URL estas pruebas se omiten.
import { describe, expect, it } from "vitest";
import http from "node:http";

const base = process.env.SMOKE_URL;
const get = (path: string, host: string) =>
  new Promise<{ status: number; body: string }>((resolve, reject) => {
    const u = new URL(path, base);
    http.get({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, headers: { host } }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode!, body }));
    }).on("error", reject);
  });
const page = async (path: string) =>
  (await Promise.all([UTE1, UTE2, UTE3].map((h) => get(path, h)))).map((r) => r.body) as [string, string, string];

const UTE1 = "ute1.allison.sh", UTE2 = "ute2.allison.sh", UTE3 = "ute3.allison.sh";

describe.skipIf(!base)("mismo código, distinto contenido por dominio", () => {
  it("branding por dominio", async () => {
    const [u, e, a] = await page("/");
    expect(u).toContain("Universidad Tecnológica Experimental"); expect(u).toContain("#1F3A8A");
    expect(e).toContain("Facultad de Ingeniería"); expect(e).toContain("#007EA7");
    expect(a).toContain("Facultad de Artes"); expect(a).toContain("#B5523B");
  });
  it("carreras: compartidas en los asignados; exclusivas aisladas", async () => {
    const [u, e, a] = await page("/carreras");
    for (const b of [u, e, a]) expect(b).toContain("Innovación y Tecnología Creativa");
    expect(e).toContain("Ingeniería Electrónica"); expect(a).not.toContain("Ingeniería Electrónica"); expect(u).not.toContain("Ingeniería Electrónica");
    expect(a).toContain("Licenciatura en Música"); expect(e).not.toContain("Licenciatura en Música"); expect(u).not.toContain("Licenciatura en Música");
    expect(e).toContain("Compartido con"); expect(e).toContain("Solo en este sitio");
  });
  it("profesores: compartidos y exclusivos", async () => {
    const [u, e, a] = await page("/profesores");
    for (const b of [u, e, a]) expect(b).toContain("Lucía Vargas Ibarra"); // en los 3
    expect(e).toContain("Felipe Araya Soto"); expect(a).not.toContain("Felipe Araya Soto"); expect(u).not.toContain("Felipe Araya Soto");
    expect(a).toContain("Francisca Valdés Ortiz"); expect(e).not.toContain("Francisca Valdés Ortiz"); expect(u).not.toContain("Francisca Valdés Ortiz");
  });
  it("anuncios: compartido en 3, en 2 y exclusivos", async () => {
    const [u, e, a] = await page("/anuncios");
    for (const b of [u, e, a]) expect(b).toContain("Postulaciones abiertas para el año académico 2027");
    expect(e).toContain("Feria de Innovación"); expect(a).toContain("Feria de Innovación"); expect(u).not.toContain("Feria de Innovación");
    expect(e).toContain("Nueva infraestructura para laboratorios"); expect(a).not.toContain("Nueva infraestructura"); expect(u).not.toContain("Nueva infraestructura");
    expect(a).toContain("Exposición anual de estudiantes"); expect(e).not.toContain("Exposición anual");
  });
  it("detalle de carrera: malla y aislamiento por sitio", async () => {
    const e = await get("/carreras/ingenieria-civil-informatica", UTE2);
    expect(e.status).toBe(200); expect(e.body).toContain("Semestre 6"); expect(e.body).toContain("Estructuras de Datos");
    expect((await get("/carreras/ingenieria-civil-informatica", UTE3)).status).toBe(404); // no pertenece a Artes
    expect((await get("/carreras/ingenieria-electronica", UTE1)).status).toBe(404);
    // Carrera compartida: cada sitio muestra solo SUS profesores
    const innE = (await get("/carreras/innovacion-y-tecnologia-creativa", UTE2)).body;
    const innA = (await get("/carreras/innovacion-y-tecnologia-creativa", UTE3)).body;
    expect(innE).toContain("Valentina Rojas Pinto"); expect(innA).not.toContain("Valentina Rojas Pinto");
  });
  it("enlaces entre sitios", async () => {
    const [u, e] = await page("/");
    expect(u).toContain("https://ute2.allison.sh"); expect(u).toContain("https://ute3.allison.sh");
    expect(e).toContain("https://ute1.allison.sh");
  });
  it("hostname desconocido → 404 en todas las rutas y en la API", async () => {
    for (const p of ["/", "/carreras", "/profesores", "/anuncios", "/api/content/home"])
      expect((await get(p, "otro.example.com")).status).toBe(404);
  });
  it("API: solo datos del sitio, kind validado y sin secretos", async () => {
    const r = await get("/api/content/professors", UTE3);
    const names = JSON.parse(r.body).map((p: { name: string }) => p.name);
    expect(names).not.toContain("Felipe Araya Soto");
    expect((await get("/api/content/inexistente", UTE3)).status).toBe(404);
    for (const k of ["STRAPI_API_TOKEN", "Bearer"]) expect(r.body).not.toContain(k);
    const token = process.env.STRAPI_API_TOKEN;
    if (token) for (const b of [r.body, ...(await page("/"))]) expect(b).not.toContain(token);
  });
});
