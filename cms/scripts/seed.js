// Seed idempotente por REST. Funciona desde cualquier lugar (o dentro del contenedor):
//   CMS_URL=https://cms.example.com CMS_TOKEN=<token full-access> node scripts/seed.js
// Claves naturales: slug / name / title / code. Reejecutar actualiza, nunca duplica.
const BASE = (process.env.CMS_URL || 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = process.env.CMS_TOKEN;
if (!TOKEN) { console.error('Falta CMS_TOKEN (token API full-access)'); process.exit(1); }

const img = (seed, w = 800, h = 500) => `https://picsum.photos/seed/ute-${seed}/${w}/${h}`;
const face = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const U = 'university', E = 'engineering', A = 'arts';

const SITES = [
  { slug: U, name: 'Universidad Tecnológica Experimental', title: 'Universidad Tecnológica Experimental',
    tagline: 'Conocimiento, tecnología y creación desde 1966',
    description: 'Una universidad pública comprometida con la excelencia académica, la investigación y la vinculación con la sociedad. Dos facultades, un solo campus y una comunidad que se atreve a experimentar.',
    heroImage: img('campus', 1600, 700), email: 'contacto@ute.allison.sh', address: 'Av. Universidad 1500, Campus Central',
    primaryColor: '#1F3A8A', secondaryColor: '#E8EDFB' },
  { slug: E, name: 'Facultad de Ingeniería', title: 'Facultad de Ingeniería', tagline: 'Formamos profesionales para construir el futuro',
    description: 'Formamos profesionales en tecnología e innovación, con laboratorios propios, vínculo con la industria y una fuerte cultura de proyectos.',
    heroImage: img('ingenieria', 1600, 700), email: 'ingenieria@ute.allison.sh', address: 'Edificio Torre Ingeniería, Campus Central',
    primaryColor: '#007EA7', secondaryColor: '#EAF7FB' },
  { slug: A, name: 'Facultad de Artes', title: 'Facultad de Artes', tagline: 'Un espacio para crear, expresar y pensar',
    description: 'Un espacio de creación, expresión y pensamiento crítico para las artes visuales, el diseño y la música, con talleres abiertos y una galería propia.',
    heroImage: img('artes', 1600, 700), email: 'artes@ute.allison.sh', address: 'Casa de las Artes, Campus Norte',
    primaryColor: '#B5523B', secondaryColor: '#FBEFEA' },
];

// malla: 6 semestres x 3 ramos (se muestran como "primeros 6 semestres")
const CAREERS = [
  { slug: 'ingenieria-civil-informatica', prefix: 'INF', name: 'Ingeniería Civil Informática', duration: '12 semestres', degree: 'Ingeniero Civil en Informática', modality: 'Presencial diurno', sites: [E, U],
    description: 'Diseño y construcción de sistemas de software y soluciones digitales a gran escala.',
    overview: 'Formamos ingenieros capaces de diseñar, construir y operar sistemas de software complejos. Combina matemáticas, computación y gestión de proyectos, con prácticas en empresas desde el cuarto año.',
    malla: [['Cálculo I', 'Álgebra Lineal', 'Introducción a la Programación'], ['Cálculo II', 'Estructuras de Datos', 'Física General'], ['Bases de Datos', 'Algoritmos', 'Arquitectura de Computadores'], ['Ingeniería de Software', 'Redes de Computadores', 'Sistemas Operativos'], ['Inteligencia Artificial', 'Desarrollo Web y Móvil', 'Gestión de Proyectos TI'], ['Seguridad Informática', 'Computación en la Nube', 'Taller de Titulación']] },
  { slug: 'ingenieria-civil-industrial', prefix: 'IND', name: 'Ingeniería Civil Industrial', duration: '12 semestres', degree: 'Ingeniero Civil Industrial', modality: 'Presencial diurno', sites: [E],
    description: 'Gestión y optimización de procesos productivos y organizaciones.',
    overview: 'Una carrera que une ingeniería y gestión para mejorar procesos, cadenas logísticas y organizaciones, con foco en análisis de datos y toma de decisiones.',
    malla: [['Cálculo I', 'Introducción a la Ingeniería', 'Química General'], ['Estadística', 'Microeconomía', 'Dibujo Técnico'], ['Investigación de Operaciones', 'Contabilidad', 'Procesos Productivos'], ['Gestión de Operaciones', 'Finanzas Corporativas', 'Logística'], ['Control de Calidad', 'Gestión de la Innovación', 'Simulación'], ['Evaluación de Proyectos', 'Gestión Estratégica', 'Taller de Titulación']] },
  { slug: 'ingenieria-electronica', prefix: 'ELE', name: 'Ingeniería Electrónica', duration: '10 semestres', degree: 'Ingeniero Civil Electrónico', modality: 'Presencial diurno', sites: [E],
    description: 'Sistemas electrónicos, control, telecomunicaciones y automatización.',
    overview: 'Aprende a diseñar sistemas electrónicos y de control, desde microcontroladores hasta redes de sensores, con laboratorios de última generación.',
    malla: [['Cálculo I', 'Física Mecánica', 'Introducción a la Electrónica'], ['Circuitos Eléctricos', 'Álgebra Lineal', 'Programación para Ingeniería'], ['Electrónica Analógica', 'Electrónica Digital', 'Señales y Sistemas'], ['Microcontroladores', 'Teoría de Control', 'Electromagnetismo'], ['Telecomunicaciones', 'Sistemas Embebidos', 'Instrumentación'], ['Internet de las Cosas', 'Robótica', 'Taller de Titulación']] },
  { slug: 'diseno', prefix: 'DIS', name: 'Diseño', duration: '10 semestres', degree: 'Diseñador', modality: 'Presencial diurno', sites: [A, U],
    description: 'Diseño gráfico, de producto y de experiencias con enfoque creativo y social.',
    overview: 'Un recorrido por el diseño gráfico, de producto y de interfaces, trabajando en talleres con clientes reales y exhibiciones abiertas al público.',
    malla: [['Fundamentos del Diseño', 'Dibujo y Representación', 'Historia del Arte y el Diseño'], ['Teoría del Color', 'Tipografía', 'Taller de Diseño I'], ['Diseño de Producto', 'Fotografía', 'Taller de Diseño II'], ['Diseño de Interfaces', 'Materiales y Procesos', 'Taller de Diseño III'], ['Diseño de Experiencias', 'Marketing y Marca', 'Prototipado'], ['Gestión del Diseño', 'Portafolio Profesional', 'Proyecto de Título']] },
  { slug: 'licenciatura-en-artes-visuales', prefix: 'AVI', name: 'Licenciatura en Artes Visuales', duration: '8 semestres', degree: 'Licenciado en Artes Visuales', modality: 'Presencial vespertino', sites: [A, U],
    description: 'Pintura, escultura, grabado y nuevos medios en un taller permanente de creación.',
    overview: 'Formación práctica en pintura, escultura, grabado y nuevos medios, con curaduría y exposición de obra en la galería de la Facultad.',
    malla: [['Dibujo I', 'Historia del Arte', 'Teoría de la Imagen'], ['Pintura I', 'Escultura I', 'Grabado I'], ['Fotografía y Video', 'Pintura II', 'Teoría del Arte Contemporáneo'], ['Instalación', 'Escultura II', 'Curaduría y Montaje'], ['Arte y Nuevos Medios', 'Taller de Obra', 'Crítica y Escritura'], ['Gestión Cultural', 'Proyecto de Exposición', 'Seminario de Título']] },
  { slug: 'licenciatura-en-musica', prefix: 'MUS', name: 'Licenciatura en Música', duration: '8 semestres', degree: 'Licenciado en Música', modality: 'Presencial diurno', sites: [A],
    description: 'Interpretación, composición y producción musical.',
    overview: 'Formación integral en interpretación, composición y producción, con orquesta, coro y ensambles universitarios.',
    malla: [['Lenguaje Musical I', 'Instrumento Principal I', 'Historia de la Música'], ['Lenguaje Musical II', 'Armonía I', 'Coro'], ['Armonía II', 'Instrumento Principal II', 'Conjunto Instrumental'], ['Composición I', 'Análisis Musical', 'Producción Musical'], ['Composición II', 'Etnomusicología', 'Dirección Musical'], ['Pedagogía Musical', 'Recital de Título', 'Seminario de Título']] },
  { slug: 'innovacion-y-tecnologia-creativa', prefix: 'INN', name: 'Innovación y Tecnología Creativa', duration: '8 semestres', degree: 'Licenciado en Innovación y Tecnología Creativa', modality: 'Presencial diurno', sites: [E, A, U],
    description: 'Programa interdisciplinario que une ingeniería y artes para crear experiencias interactivas.',
    overview: 'Un programa único que se dicta entre las dos facultades: ingenieros y artistas trabajan juntos en proyectos de realidad aumentada, sonido digital e instalaciones interactivas.',
    malla: [['Pensamiento Creativo', 'Programación Creativa', 'Fundamentos de Diseño'], ['Electrónica para Artistas', 'Narrativa Interactiva', 'Cálculo Aplicado'], ['Diseño de Experiencias', 'Computación Gráfica', 'Prototipado Rápido'], ['Realidad Aumentada', 'Sonido Digital', 'Taller Interdisciplinario I'], ['Inteligencia Artificial Creativa', 'Emprendimiento Creativo', 'Taller Interdisciplinario II'], ['Proyecto de Innovación', 'Ética y Tecnología', 'Proyecto de Título']] },
];

const P = (name, title, specialty, bio, photoUrl, careers, sites) => ({ name, title, specialty, bio, photoUrl, careers, sites });
const PROFESSORS = [
  P('Carolina Muñoz Reyes', 'Dra. en Ciencias de la Computación', 'Inteligencia artificial y sistemas distribuidos', 'Lidera el laboratorio de IA aplicada y ha publicado más de 40 artículos en conferencias internacionales.', face('women', 44), ['ingenieria-civil-informatica', 'innovacion-y-tecnologia-creativa'], [E, U]),
  P('Felipe Araya Soto', 'Dr. en Ingeniería Industrial', 'Optimización y logística', 'Consultor de cadenas de suministro para la minería y el retail; dirige el magíster en gestión de operaciones.', face('men', 32), ['ingenieria-civil-industrial'], [E]),
  P('Valentina Rojas Pinto', 'Mg. en Ingeniería Electrónica', 'Sistemas embebidos e IoT', 'Desarrolla redes de sensores para agricultura de precisión junto a empresas de la región.', face('women', 65), ['ingenieria-electronica', 'innovacion-y-tecnologia-creativa'], [E]),
  P('Matías Contreras Vega', 'Dr. en Ingeniería Eléctrica', 'Control y automatización', 'Investiga control predictivo aplicado a robótica móvil. Coordina el taller de robótica.', face('men', 45), ['ingenieria-electronica'], [E]),
  P('Javiera Núñez Salas', 'Dra. en Artes', 'Pintura contemporánea', 'Artista visual con exposiciones en Santiago, Buenos Aires y Madrid. Dirige la galería de la Facultad.', face('women', 68), ['licenciatura-en-artes-visuales'], [A, U]),
  P('Tomás Herrera Lagos', 'Mg. en Diseño', 'Diseño de producto', 'Diseñador industrial con patentes en mobiliario sustentable. Dicta los talleres de diseño II y III.', face('men', 76), ['diseno'], [A, U]),
  P('Francisca Valdés Ortiz', 'Dra. en Musicología', 'Composición y teoría musical', 'Compositora con obras estrenadas por orquestas sinfónicas. Dirige el coro universitario.', face('women', 12), ['licenciatura-en-musica'], [A]),
  P('Ignacio Paredes Bravo', 'Mg. en Artes Electrónicas', 'Arte interactivo y medios digitales', 'Crea instalaciones interactivas que combinan sonido, luz y sensores. Profesor en ambas facultades.', face('men', 22), ['innovacion-y-tecnologia-creativa', 'diseno'], [E, A, U]),
  P('Lucía Vargas Ibarra', 'Dra. en Ciencias de la Ingeniería', 'Diseño de experiencias y tecnología', 'Investiga la intersección entre diseño y tecnología. Coordina el programa interdisciplinario.', face('women', 90), ['innovacion-y-tecnologia-creativa', 'ingenieria-civil-informatica', 'diseno'], [E, A, U]),
];

const ANNOUNCEMENTS = [
  { title: 'Postulaciones abiertas para el año académico 2027', date: '2026-11-02', category: 'Admisión', imageUrl: img('admision'), sites: [U, E, A],
    description: 'Ya puedes postular a todas nuestras carreras. El proceso cierra el 15 de enero e incluye becas de excelencia y de continuidad.' },
  { title: 'Feria de Innovación y Tecnología Creativa', date: '2026-11-12', category: 'Evento', imageUrl: img('feria'), sites: [E, A],
    description: 'Estudiantes de Ingeniería y Artes presentan juntos sus proyectos interdisciplinarios en el hall central. Entrada liberada.' },
  { title: 'Nueva infraestructura para laboratorios de ingeniería', date: '2026-10-20', category: 'Infraestructura', imageUrl: img('laboratorios'), sites: [E],
    description: 'Inauguramos nuevos laboratorios de electrónica y computación para estudiantes de la Facultad.' },
  { title: 'Equipo de Ingeniería gana el campeonato nacional de robótica', date: '2026-10-08', category: 'Logros', imageUrl: img('robotica'), sites: [E, U],
    description: 'Estudiantes de Ingeniería Electrónica se quedaron con el primer lugar entre 24 universidades.' },
  { title: 'Exposición anual de estudiantes de Artes Visuales', date: '2026-10-28', category: 'Cultura', imageUrl: img('exposicion'), sites: [A],
    description: 'Más de 60 obras de estudiantes se exhiben en la galería de la Facultad durante todo noviembre.' },
  { title: 'Temporada de conciertos de la Orquesta Universitaria', date: '2026-11-05', category: 'Cultura', imageUrl: img('orquesta'), sites: [A, U],
    description: 'Cuatro conciertos gratuitos en el auditorio central, con obras de compositores y compositoras de la Facultad.' },
  { title: 'La Universidad celebra 60 años', date: '2026-09-15', category: 'Institucional', imageUrl: img('aniversario'), sites: [U],
    description: 'Una semana de actividades abiertas a la comunidad para celebrar seis décadas de historia universitaria.' },
];

async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/${path}`, {
    method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify({ data: body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json.error ?? json)}`);
  return json.data;
}

async function upsert(plural, key, value, data) {
  const q = `filters[${key}][$eq]=${encodeURIComponent(value)}&status=draft&pagination[pageSize]=1`;
  const [found] = await api('GET', `${plural}?${q}`);
  const row = found
    ? await api('PUT', `${plural}/${found.documentId}?status=published`, data)
    : await api('POST', `${plural}?status=published`, data);
  return row.documentId;
}

async function main() {
  const ids = { site: {}, career: {} };
  for (const { slug, ...s } of SITES) ids.site[slug] = await upsert('sites', 'slug', slug, { slug, ...s });
  const set = (arr, map) => ({ set: arr.map((k) => map[k]) });

  for (const { malla, prefix, sites, ...c } of CAREERS) {
    ids.career[c.slug] = await upsert('careers', 'slug', c.slug, { ...c, sites: set(sites, ids.site) });
    for (const [i, ramos] of malla.entries()) {
      for (const [j, name] of ramos.entries()) {
        const code = `${prefix}-${(i + 1) * 100 + j + 1}`;
        await upsert('courses', 'code', code, { code, name, semester: i + 1, credits: j === 2 ? 6 : 5, career: set([c.slug], ids.career) });
      }
    }
  }
  for (const { careers, sites, ...p } of PROFESSORS) {
    await upsert('professors', 'name', p.name, { ...p, careers: set(careers, ids.career), sites: set(sites, ids.site) });
  }
  for (const { sites, ...a } of ANNOUNCEMENTS) {
    await upsert('announcements', 'title', a.title, { ...a, sites: set(sites, ids.site) });
  }
  const courses = CAREERS.reduce((n, c) => n + c.malla.flat().length, 0);
  console.log(`Seed OK: ${SITES.length} sitios, ${CAREERS.length} carreras, ${courses} ramos, ${PROFESSORS.length} profesores, ${ANNOUNCEMENTS.length} anuncios.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
