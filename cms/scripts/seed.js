// Seed idempotente: `npm run seed` (dentro del contenedor: `node scripts/seed.js`).
// Claves naturales: Site.slug, Career.name, Announcement.title. Reejecutar actualiza, nunca duplica.
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const SITES = [
  { slug: 'university', name: 'Universidad Tecnológica Experimental', title: 'Universidad Tecnológica Experimental',
    description: 'Una universidad pública comprometida con la excelencia académica, la investigación y la vinculación con la sociedad.',
    primaryColor: '#1F3A8A', secondaryColor: '#E8EDFB' },
  { slug: 'engineering', name: 'Facultad de Ingeniería', title: 'Facultad de Ingeniería',
    description: 'Formamos profesionales en tecnología e innovación.',
    primaryColor: '#007EA7', secondaryColor: '#EAF7FB' },
  { slug: 'arts', name: 'Facultad de Artes', title: 'Facultad de Artes',
    description: 'Un espacio de creación, expresión y pensamiento crítico para las artes visuales, el diseño y la música.',
    primaryColor: '#B5523B', secondaryColor: '#FBEFEA' },
];

const U = 'university', E = 'engineering', A = 'arts';
const CAREERS = [
  { name: 'Ingeniería Civil Informática', duration: '12 semestres', degree: 'Ingeniero Civil en Informática',
    description: 'Diseño y construcción de sistemas de software y soluciones digitales a gran escala.', sites: [E, U] },
  { name: 'Ingeniería Civil Industrial', duration: '12 semestres', degree: 'Ingeniero Civil Industrial',
    description: 'Gestión y optimización de procesos productivos y organizaciones.', sites: [E] },
  { name: 'Ingeniería Electrónica', duration: '10 semestres', degree: 'Ingeniero Civil Electrónico',
    description: 'Sistemas electrónicos, control, telecomunicaciones y automatización.', sites: [E] },
  { name: 'Diseño', duration: '10 semestres', degree: 'Diseñador',
    description: 'Diseño gráfico, de producto y de experiencias con enfoque creativo y social.', sites: [A, U] },
  { name: 'Licenciatura en Artes Visuales', duration: '8 semestres', degree: 'Licenciado en Artes Visuales',
    description: 'Pintura, escultura, grabado y nuevos medios en un taller permanente de creación.', sites: [A] },
  { name: 'Licenciatura en Música', duration: '8 semestres', degree: 'Licenciado en Música',
    description: 'Interpretación, composición y producción musical.', sites: [A] },
  { name: 'Innovación y Tecnología Creativa', duration: '8 semestres', degree: 'Licenciado en Innovación y Tecnología Creativa',
    description: 'Programa interdisciplinario que une ingeniería y artes para crear experiencias interactivas.', sites: [E, A, U] },
];

const ANNOUNCEMENTS = [
  { title: 'Postulaciones abiertas para el año académico 2027', date: '2026-11-02',
    description: 'Ya puedes postular a todas nuestras carreras. El proceso cierra el 15 de enero.', sites: [U, E, A] },
  { title: 'Nueva infraestructura para laboratorios de ingeniería', date: '2026-10-20',
    description: 'Inauguramos nuevos laboratorios de electrónica y computación para estudiantes de la Facultad.', sites: [E] },
  { title: 'Exposición anual de estudiantes de Artes Visuales', date: '2026-10-28',
    description: 'Más de 60 obras de estudiantes se exhiben en la galería de la Facultad durante todo noviembre.', sites: [A] },
];

async function upsert(strapi, uid, key, value, data) {
  const docs = strapi.documents(uid);
  const found = await docs.findFirst({ filters: { [key]: value }, status: 'draft' });
  const row = found
    ? await docs.update({ documentId: found.documentId, data })
    : await docs.create({ data });
  // Publica la versión actual del documento.
  await docs.publish({ documentId: row.documentId });
  return row.documentId;
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  try {
    const ids = {};
    for (const s of SITES) ids[s.slug] = await upsert(app, 'api::site.site', 'slug', s.slug, s);
    const rel = (slugs) => ({ set: slugs.map((s) => ids[s]) });
    for (const c of CAREERS) {
      await upsert(app, 'api::career.career', 'name', c.name, { ...c, sites: rel(c.sites) });
    }
    for (const a of ANNOUNCEMENTS) {
      await upsert(app, 'api::announcement.announcement', 'title', a.title, { ...a, sites: rel(a.sites) });
    }
    console.log(`Seed OK: ${SITES.length} sitios, ${CAREERS.length} carreras, ${ANNOUNCEMENTS.length} anuncios.`);
  } finally {
    await app.destroy();
  }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
