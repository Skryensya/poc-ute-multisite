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
    expect(u).toContain("Universidad Tecnológica del Este"); expect(u).toContain("#1F3A8A");
    expect(e).toContain("Facultad de Ingeniería"); expect(e).toContain("#007EA7");
    expect(a).toContain("Facultad de Artes"); expect(a).toContain("#B5523B");
  });
  it("mismo núcleo en los tres sitios: misma navegación", async () => {
    for (const b of await page("/")) for (const l of ["Carreras", "Profesores", "Noticias", "Agenda", "Sobre nosotros"]) expect(b).toContain(l);
  });
  it("carreras: la facultad muestra las suyas; el sitio central, todas", async () => {
    const [u, e, a] = await page("/carreras");
    for (const b of [u, e, a]) expect(b).toContain("Innovación y Tecnología Creativa");
    expect(e).toContain("Ingeniería Electrónica"); expect(a).not.toContain("Ingeniería Electrónica");
    expect(a).toContain("Licenciatura en Música"); expect(e).not.toContain("Licenciatura en Música");
    expect(u).toContain("Ingeniería Electrónica"); expect(u).toContain("Licenciatura en Música");
    expect(e).toContain("También en");
  });
  it("profesores: cada facultad los suyos; el sitio central, todos", async () => {
    const [u, e, a] = await page("/profesores");
    for (const b of [u, e, a]) expect(b).toContain("Lucía Vargas Ibarra");
    expect(e).toContain("Felipe Araya Soto"); expect(a).not.toContain("Felipe Araya Soto");
    expect(a).toContain("Francisca Valdés Ortiz"); expect(e).not.toContain("Francisca Valdés Ortiz");
    expect(u).toContain("Felipe Araya Soto"); expect(u).toContain("Francisca Valdés Ortiz");
  });
  it("noticias con filtros y etiquetas; /anuncios redirige", async () => {
    const [u, e, a] = await page("/noticias");
    for (const b of [u, e, a]) expect(b).toContain("Postulaciones abiertas para el año académico 2027");
    expect(e).toContain("Feria de Innovación"); expect(u).toContain("Feria de Innovación");
    expect(e).toContain("Nueva infraestructura para laboratorios"); expect(a).not.toContain("Nueva infraestructura");
    expect(a).toContain("Exposición anual de estudiantes"); expect(e).not.toContain("Exposición anual");
    for (const b of [u, e, a]) for (const f of ["Temas", "Tipo", "Mes"]) expect(b).toContain(f);
    expect(u).toContain("Facultad"); // filtro por facultad solo en el sitio central
    expect(e).toContain("Robótica"); expect(a).toContain("Exposiciones"); // etiquetas propias de cada facultad
    expect((await get("/anuncios", UTE2)).status).toBe(308);
  });
  it("cada noticia tiene su página con cuerpo, autor y relacionadas", async () => {
    const slug = "nueva-infraestructura-para-laboratorios-de-ingenieria";
    expect((await page("/noticias"))[1]).toContain(`/noticias/${slug}`);
    const d = await get(`/noticias/${slug}`, UTE2);
    expect(d.status).toBe(200); expect(d.body).toContain("min de lectura"); expect(d.body).toContain("Por ");
    expect((await get(`/noticias/${slug}`, UTE3)).status).toBe(404); // noticia exclusiva de Ingeniería
    expect((await get(`/noticias/${slug}`, UTE1)).status).toBe(200); // el sitio central agrega todas
    expect((await get("/noticias/no-existe", UTE2)).status).toBe(404);
  });
  it("agenda: filtros de la agenda UC; cada facultad ve la suya y el sitio central todas", async () => {
    const [u, e, a] = await page("/agenda");
    for (const f of ["Tipo de actividad", "Lugar", "Público", "Precio", "Modalidad"]) for (const b of [u, e, a]) expect(b).toContain(f);
    expect(e).toContain("Congreso de Industria 4.0"); expect(a).not.toContain("Congreso de Industria 4.0"); expect(u).toContain("Congreso de Industria 4.0");
    expect(a).toContain("Ceremonia de premiación del concurso de cuentos"); expect(e).not.toContain("Ceremonia de premiación del concurso de cuentos");
    expect(u).toContain("https://ute2.allison.sh/agenda/"); expect(u).toContain("https://ute3.allison.sh/agenda/"); // desde la universidad se llega a cada facultad
    // la agenda completa solo se revisa en el sitio central; las facultades llevan su filtro fijo y un enlace allí
    expect(e).toContain("Ver la agenda completa de Universidad Tecnológica del Este"); expect(e).toContain("Filtro fijo de este sitio");
    expect(u).not.toContain("Filtro fijo de este sitio"); expect(u).not.toContain("Ver la agenda completa");
    const href = /href="(\/agenda\/[a-z0-9-]+)"/.exec(e)![1];
    const detail = await get(href, UTE2);
    expect(detail.status).toBe(200); expect(detail.body).toContain("Dirigido a"); expect(detail.body).toContain("Organiza");
    for (const t of ["Programa", "Qué vas a ver", "participa"]) expect(detail.body).toContain(t); // contenido ampliado de la ficha
  });
  it("páginas propias de cada sitio (definidas en el front)", async () => {
    expect((await get("/admision", UTE1)).status).toBe(200); expect((await get("/admision", UTE2)).status).toBe(404);
    expect((await get("/laboratorios", UTE2)).status).toBe(200); expect((await get("/laboratorios", UTE3)).status).toBe(404);
    expect((await get("/galeria", UTE3)).status).toBe(200); expect((await get("/galeria", UTE1)).status).toBe(404);
  });
  it("detalle de carrera: malla completa y aislamiento por facultad", async () => {
    const e = await get("/carreras/ingenieria-civil-informatica", UTE2);
    expect(e.status).toBe(200); expect(e.body).toContain("Semestre 12"); expect(e.body).toContain("Proyecto de Título"); expect(e.body).toContain("Estructuras de Datos");
    expect((await get("/carreras/ingenieria-civil-informatica", UTE3)).status).toBe(404); // no pertenece a Artes
    expect((await get("/carreras/ingenieria-electronica", UTE3)).status).toBe(404);
    expect((await get("/carreras/ingenieria-electronica", UTE1)).status).toBe(200); // el sitio central agrega todas
    const innE = (await get("/carreras/innovacion-y-tecnologia-creativa", UTE2)).body;
    const innA = (await get("/carreras/innovacion-y-tecnologia-creativa", UTE3)).body;
    expect(innE).toContain("Valentina Rojas Pinto"); expect(innA).not.toContain("Valentina Rojas Pinto");
  });
  it("sobre nosotros: contenido propio de cada sitio", async () => {
    const [u, e, a] = await page("/nosotros");
    expect(u).toContain("Sobre la Universidad"); expect(u).toContain("nació en 1966");
    expect(e).toContain("Sobre la Facultad de Ingeniería"); expect(e).toContain("líneas de investigación");
    expect(a).toContain("Sobre la Facultad de Artes"); expect(a).toContain("Casa de las Artes");
    expect(e).not.toContain("Casa de las Artes"); expect(a).not.toContain("líneas de investigación");
  });
  it("navegación entre sitios: de la facultad a la universidad y entre facultades", async () => {
    const [u, e, a] = await page("/");
    expect(u).toContain("https://ute2.allison.sh"); expect(u).toContain("https://ute3.allison.sh");
    expect(e).toContain("https://ute1.allison.sh"); expect(e).toContain("https://ute3.allison.sh");
    expect(a).toContain("https://ute1.allison.sh"); expect(a).toContain("Ir al sitio central");
  });
  it("hostname desconocido → 404 en todas las rutas y en la API", async () => {
    for (const p of ["/", "/carreras", "/profesores", "/noticias", "/agenda", "/nosotros", "/api/content/home"])
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
