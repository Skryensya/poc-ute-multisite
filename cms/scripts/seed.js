// Seed idempotente por REST. Funciona desde cualquier lugar (o dentro del contenedor):
//   CMS_URL=https://cms.example.com CMS_TOKEN=<token full-access> node scripts/seed.js
// Claves naturales: slug / name / title / code. Reejecutar actualiza, nunca duplica.
const BASE = (process.env.CMS_URL || 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = process.env.CMS_TOKEN;
if (!TOKEN) { console.error('Falta CMS_TOKEN (token API full-access)'); process.exit(1); }

// Fotos de Pexels (licencia libre), una por tema: el ID identifica la foto; se recorta al tamaño pedido.
const img = (id, w = 800, h = 500) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
const CAREER_IMG = { // carrera → foto
  'ingenieria-civil-informatica': 7988086, 'ingenieria-civil-industrial': 40382472, 'ingenieria-electronica': 9242271,
  diseno: 8546649, 'licenciatura-en-artes-visuales': 14595876, 'licenciatura-en-musica': 4513456, 'innovacion-y-tecnologia-creativa': 5207240,
};
const face = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const U = 'university', E = 'engineering', A = 'arts';

const SITES = [
  { slug: U, name: 'Universidad Tecnológica del Este', title: 'Universidad Tecnológica del Este',
    tagline: 'Conocimiento, tecnología y creación desde 1966',
    description: 'Una universidad pública comprometida con la excelencia académica, la investigación y la vinculación con la sociedad. Dos facultades, un solo campus y una comunidad que se atreve a crear.',
    heroImage: img(7972518, 1600, 700), email: 'contacto@ute.allison.sh', address: 'Av. Universidad 1500, Campus Central',
    primaryColor: '#1F3A8A', secondaryColor: '#E8EDFB' },
  { slug: E, name: 'Facultad de Ingeniería', title: 'Facultad de Ingeniería', tagline: 'Formamos profesionales para construir el futuro',
    description: 'Formamos profesionales en tecnología e innovación, con laboratorios propios, vínculo con la industria y una fuerte cultura de proyectos.',
    heroImage: img(3861960, 1600, 700), email: 'ingenieria@ute.allison.sh', address: 'Edificio Torre Ingeniería, Campus Central',
    primaryColor: '#007EA7', secondaryColor: '#EAF7FB' },
  { slug: A, name: 'Facultad de Artes', title: 'Facultad de Artes', tagline: 'Un espacio para crear, expresar y pensar',
    description: 'Un espacio de creación, expresión y pensamiento crítico para las artes visuales, el diseño y la música, con talleres abiertos y una galería propia.',
    heroImage: img(1604991, 1600, 700), email: 'artes@ute.allison.sh', address: 'Casa de las Artes, Campus Norte',
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
  { title: 'Postulaciones abiertas para el año académico 2027', date: '2026-11-02', category: 'Admisión', imageUrl: img(7972512), sites: [U, E, A],
    description: 'Ya puedes postular a todas nuestras carreras. El proceso cierra el 15 de enero e incluye becas de excelencia y de continuidad.' },
  { title: 'Feria de Innovación y Tecnología Creativa', date: '2026-11-12', category: 'Evento', imageUrl: img(8721342), sites: [E, A],
    description: 'Estudiantes de Ingeniería y Artes presentan juntos sus proyectos interdisciplinarios en el hall central. Entrada liberada.' },
  { title: 'Nueva infraestructura para laboratorios de ingeniería', date: '2026-10-20', category: 'Infraestructura', imageUrl: img(3912373), sites: [E],
    description: 'Inauguramos nuevos laboratorios de electrónica y computación para estudiantes de la Facultad.' },
  { title: 'Equipo de Ingeniería gana el campeonato nacional de robótica', date: '2026-10-08', category: 'Logros', imageUrl: img(2517330), sites: [E, U],
    description: 'Estudiantes de Ingeniería Electrónica se quedaron con el primer lugar entre 24 universidades.' },
  { title: 'Exposición anual de estudiantes de Artes Visuales', date: '2026-10-28', category: 'Cultura', imageUrl: img(17907844), sites: [A],
    description: 'Más de 60 obras de estudiantes se exhiben en la galería de la Facultad durante todo noviembre.' },
  { title: 'Temporada de conciertos de la Orquesta Universitaria', date: '2026-11-05', category: 'Cultura', imageUrl: img(4028878), sites: [A, U],
    description: 'Cuatro conciertos gratuitos en el auditorio central, con obras de compositores y compositoras de la Facultad.' },
  { title: 'La Universidad celebra 60 años', date: '2026-09-15', category: 'Institucional', imageUrl: img(17893014), sites: [U],
    description: 'Una semana de actividades abiertas a la comunidad para celebrar seis décadas de historia universitaria.' },
];

// Páginas editables por sitio: `nosotros` completa; las demás aportan título e introducción de cada sección.
const PAGES = {
  [U]: {
    nosotros: { title: 'Sobre la Universidad', imageUrl: img(7972518, 1200, 800),
      intro: 'Desde 1966 formamos personas que transforman su entorno a través del conocimiento, la tecnología y la creación.',
      stats: [{ value: '60', label: 'años de historia' }, { value: '2', label: 'facultades' }, { value: '12.000', label: 'estudiantes' }, { value: '7', label: 'carreras de pregrado' }],
      values: [
        { title: 'Excelencia', text: 'Exigimos rigor académico y lo acompañamos con apoyo real a cada estudiante.' },
        { title: 'Vocación pública', text: 'Somos una universidad del Estado: investigamos y enseñamos para el país.' },
        { title: 'Diálogo entre disciplinas', text: 'La ingeniería y las artes comparten aulas, laboratorios y proyectos.' },
        { title: 'Comunidad', text: 'Un solo campus donde estudiantes, académicos y vecinos se encuentran.' }],
      body: `## Nuestra historia\n\nLa Universidad Tecnológica del Este nació en 1966 como una escuela técnica al servicio de la industria regional. Hoy es una universidad pública y compleja, con dos facultades y un campus que reúne laboratorios, talleres, una galería de arte y un auditorio abierto a la ciudad.\n\n## Misión\n\nFormar profesionales y creadores con sólido criterio ético, capaces de resolver problemas reales, y generar conocimiento que mejore la vida de las personas y del territorio.\n\n## Qué nos distingue\n\n- Programas interdisciplinarios dictados en conjunto por Ingeniería y Artes.\n- Laboratorios propios y vínculo permanente con la industria y el sector cultural.\n- Becas de excelencia y de continuidad para más de un tercio de los estudiantes.` },
    carreras: { title: 'Carreras', intro: 'Programas de pregrado de la Universidad. Algunas carreras se dictan en conjunto con nuestras facultades.' },
    profesores: { title: 'Cuerpo académico', intro: 'Académicos de ambas facultades que combinan docencia, investigación y trabajo con la comunidad.' },
    anuncios: { title: 'Noticias y anuncios', intro: 'Admisión, actividades y logros de toda la comunidad universitaria.' } },
  [E]: {
    nosotros: { title: 'Sobre la Facultad de Ingeniería', imageUrl: img(3912373, 1200, 800),
      intro: 'Formamos ingenieras e ingenieros que diseñan, construyen y mejoran los sistemas que hacen funcionar al país.',
      stats: [{ value: '3', label: 'carreras de ingeniería' }, { value: '14', label: 'laboratorios' }, { value: '92%', label: 'empleabilidad al primer año' }, { value: '80+', label: 'empresas con convenio' }],
      values: [
        { title: 'Aprender haciendo', text: 'Cada semestre incluye un proyecto con problemas reales de la industria.' },
        { title: 'Base científica sólida', text: 'Matemáticas, física y computación como cimiento de todo el plan de estudios.' },
        { title: 'Trabajo en equipo', text: 'Proyectos colaborativos, a veces junto a estudiantes de Artes.' }],
      body: `## Quiénes somos\n\nLa Facultad de Ingeniería reúne a las carreras de Informática, Industrial y Electrónica. Trabajamos en una torre propia dentro del Campus Central, con laboratorios de computación, electrónica y robótica disponibles para estudiantes desde el primer año.\n\n## Cómo formamos\n\nNuestro modelo combina clases, talleres y prácticas. Desde el cuarto año los estudiantes realizan prácticas en empresas y desarrollan su proyecto de título con un académico guía y un socio externo.\n\n## Investigación y vínculo\n\nTenemos líneas de trabajo en inteligencia artificial, optimización logística, sistemas embebidos y automatización. Muchas nacen de problemas planteados por empresas de la región, con las que mantenemos más de ochenta convenios.` },
    carreras: { title: 'Carreras de Ingeniería', intro: 'Tres carreras de ingeniería civil y un programa interdisciplinario con la Facultad de Artes.' },
    profesores: { title: 'Académicos de Ingeniería', intro: 'Doctores y magísteres con experiencia en investigación aplicada y en la industria.' },
    anuncios: { title: 'Noticias de la Facultad', intro: 'Laboratorios, logros de estudiantes y actividades de Ingeniería.' } },
  [A]: {
    nosotros: { title: 'Sobre la Facultad de Artes', imageUrl: img(5104713, 1200, 800),
      intro: 'Un espacio abierto para crear, expresarse y pensar críticamente a través de las artes visuales, el diseño y la música.',
      stats: [{ value: '4', label: 'carreras artísticas' }, { value: '12', label: 'talleres abiertos' }, { value: '30+', label: 'exposiciones al año' }, { value: '1', label: 'galería propia' }],
      values: [
        { title: 'Creación', text: 'El taller es el centro de la formación: se aprende produciendo obra.' },
        { title: 'Pensamiento crítico', text: 'Teoría, historia y escritura acompañan toda práctica artística.' },
        { title: 'Apertura', text: 'Exposiciones y conciertos gratuitos para la comunidad y la ciudad.' }],
      body: `## Quiénes somos\n\nLa Facultad de Artes funciona en la Casa de las Artes, en el Campus Norte. Reúne a Diseño, Artes Visuales y Música en talleres compartidos, una galería y salas de ensayo.\n\n## Cómo formamos\n\nLa formación es práctica y tutorial: grupos pequeños, académicos que también son artistas en ejercicio y exhibiciones públicas de los trabajos de estudiantes durante todo el año.\n\n## Con la ciudad\n\nLa galería, la orquesta y el coro universitario ofrecen temporadas abiertas. Además, el programa de Innovación y Tecnología Creativa se dicta junto a la Facultad de Ingeniería y vincula arte, sonido digital e interacción.` },
    carreras: { title: 'Carreras de Artes', intro: 'Diseño, artes visuales, música y un programa interdisciplinario con Ingeniería.' },
    profesores: { title: 'Académicos de Artes', intro: 'Artistas, diseñadores y compositores que enseñan desde su práctica profesional.' },
    anuncios: { title: 'Noticias de la Facultad', intro: 'Exposiciones, conciertos y novedades de la Facultad de Artes.' } },
};

async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/${path}`, {
    method, headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify({ data: body }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json.error ?? json)}`);
  return json.data;
}

async function upsert(plural, key, value, data, extra = '') {
  const q = `filters[${key}][$eq]=${encodeURIComponent(value)}${extra}&status=draft&pagination[pageSize]=1`;
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
    ids.career[c.slug] = await upsert('careers', 'slug', c.slug, { ...c, imageUrl: img(CAREER_IMG[c.slug]), sites: set(sites, ids.site) });
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
  for (const [site, pages] of Object.entries(PAGES)) {
    for (const [slug, p] of Object.entries(pages)) {
      await upsert('pages', 'slug', slug, { slug, ...p, site: set([site], ids.site) }, `&filters[site][slug][$eq]=${site}`);
    }
  }
  const courses = CAREERS.reduce((n, c) => n + c.malla.flat().length, 0);
  console.log(`Seed OK: ${SITES.length} sitios, ${CAREERS.length} carreras, ${courses} ramos, ${PROFESSORS.length} profesores, ${ANNOUNCEMENTS.length} anuncios, ${Object.values(PAGES).reduce((n, p) => n + Object.keys(p).length, 0)} páginas.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
