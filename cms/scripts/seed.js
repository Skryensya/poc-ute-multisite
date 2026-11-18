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
const EVENTS = require('./data/events.json'); // 100 eventos (parodias de la agenda UC), ver data/
const NEWS = require('./data/news.json'); // noticias con etiquetas

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

// Fotos por tema: la primera etiqueta que coincide decide el grupo; el índice reparte dentro del grupo.
const POOLS = {
  tech: [7988086, 8720589, 3862142, 9242271, 3912373, 2517330, 3861960, 40382472, 5539293, 10638069],
  arts: [1604991, 14595876, 17907844, 5393546, 5104713, 8546649],
  music: [4028878, 5933199, 4513456],
  campus: [7972518, 7972512, 17893014, 7972506, 17615703, 16255363],
  vr: [5207240, 8721342],
};
const TAG_POOL = { 'Música': 'music', 'Teatro': 'arts', 'Cine': 'arts', 'Exposiciones': 'arts', 'Diseño': 'arts', 'Patrimonio': 'arts', 'Talleres': 'arts', 'Literatura': 'arts', 'Niños y familias': 'arts',
  'Arte y tecnología': 'vr', 'Innovación': 'vr', 'Inteligencia artificial': 'tech', 'Robótica': 'tech', 'Datos': 'tech', 'Ciberseguridad': 'tech', 'Sustentabilidad': 'tech', 'Industria': 'tech', 'Emprendimiento': 'tech', 'Electrónica': 'tech', 'Mujeres en ingeniería': 'tech' };
const photoFor = (tags, sites, i) => {
  const group = tags.map((t) => TAG_POOL[t]).find(Boolean) ?? (sites.includes(E) && !sites.includes(U) ? 'tech' : sites.includes(A) && !sites.includes(U) ? 'arts' : 'campus');
  return img(POOLS[group][i % POOLS[group].length]);
};
// malla: plan completo (un arreglo de ramos por semestre); 30 créditos por semestre repartidos entre sus ramos
const CAREERS = [
  { slug: 'ingenieria-civil-informatica', prefix: 'INF', name: 'Ingeniería Civil Informática', duration: '12 semestres', degree: 'Ingeniero Civil en Informática', modality: 'Presencial diurno', sites: [E, U],
    description: 'Diseño y construcción de sistemas de software y soluciones digitales a gran escala.',
    overview: 'Formamos ingenieros capaces de diseñar, construir y operar sistemas de software complejos. Combina matemáticas, computación y gestión de proyectos, con prácticas en empresas desde el cuarto año.',
    malla: [['Cálculo I', 'Álgebra y Geometría', 'Introducción a la Programación', 'Introducción a la Ingeniería', 'Comunicación Oral y Escrita'], ['Cálculo II', 'Álgebra Lineal', 'Programación Orientada a Objetos', 'Física Mecánica', 'Matemática Discreta'], ['Cálculo III', 'Estructuras de Datos', 'Física Electromagnética', 'Probabilidad y Estadística', 'Arquitectura de Computadores'], ['Ecuaciones Diferenciales', 'Algoritmos y Complejidad', 'Bases de Datos', 'Sistemas Operativos', 'Inglés Técnico'], ['Ingeniería de Software I', 'Redes de Computadores', 'Análisis y Diseño de Sistemas', 'Cálculo Numérico', 'Economía para Ingenieros'], ['Ingeniería de Software II', 'Sistemas Distribuidos', 'Interacción Humano-Computador', 'Inferencia Estadística', 'Electivo de Formación General'], ['Inteligencia Artificial', 'Desarrollo Web y Móvil', 'Gestión de Proyectos TI', 'Teoría de la Computación', 'Electivo Profesional I'], ['Aprendizaje Automático', 'Seguridad Informática', 'Computación en la Nube', 'Arquitectura de Software', 'Electivo Profesional II'], ['Ingeniería de Datos', 'Gestión de Servicios TI', 'Ética y Responsabilidad Profesional', 'Electivo Profesional III', 'Práctica Profesional'], ['Emprendimiento Tecnológico', 'Auditoría Informática', 'Taller de Titulación I'], ['Electivo Profesional IV', 'Taller de Titulación II', 'Práctica Integrada'], ['Seminario de Titulación', 'Proyecto de Título']] },
  { slug: 'ingenieria-civil-industrial', prefix: 'IND', name: 'Ingeniería Civil Industrial', duration: '12 semestres', degree: 'Ingeniero Civil Industrial', modality: 'Presencial diurno', sites: [E],
    description: 'Gestión y optimización de procesos productivos y organizaciones.',
    overview: 'Una carrera que une ingeniería y gestión para mejorar procesos, cadenas logísticas y organizaciones, con foco en análisis de datos y toma de decisiones.',
    malla: [['Cálculo I', 'Álgebra y Geometría', 'Introducción a la Ingeniería Industrial', 'Química General', 'Comunicación Oral y Escrita'], ['Cálculo II', 'Álgebra Lineal', 'Física Mecánica', 'Dibujo Técnico', 'Programación para Ingeniería'], ['Cálculo III', 'Probabilidad y Estadística', 'Microeconomía', 'Contabilidad', 'Ciencia de los Materiales'], ['Inferencia Estadística', 'Macroeconomía', 'Procesos Productivos', 'Termodinámica', 'Inglés Técnico'], ['Investigación de Operaciones I', 'Costos y Presupuestos', 'Ingeniería de Métodos', 'Gestión de Personas', 'Electivo de Formación General'], ['Investigación de Operaciones II', 'Finanzas Corporativas', 'Gestión de Operaciones', 'Logística y Cadena de Suministro', 'Modelos Estocásticos'], ['Control de Calidad', 'Simulación de Procesos', 'Marketing', 'Ingeniería Económica', 'Seguridad y Prevención de Riesgos'], ['Planificación de la Producción', 'Gestión de la Innovación', 'Análisis de Datos para la Decisión', 'Derecho Laboral y Comercial', 'Electivo Profesional I'], ['Evaluación de Proyectos', 'Gestión Estratégica', 'Sustentabilidad Industrial', 'Electivo Profesional II', 'Práctica Profesional'], ['Gestión de Proyectos', 'Negociación y Liderazgo', 'Taller de Titulación I'], ['Electivo Profesional III', 'Taller de Titulación II', 'Práctica Integrada'], ['Seminario de Titulación', 'Proyecto de Título']] },
  { slug: 'ingenieria-electronica', prefix: 'ELE', name: 'Ingeniería Electrónica', duration: '10 semestres', degree: 'Ingeniero Civil Electrónico', modality: 'Presencial diurno', sites: [E],
    description: 'Sistemas electrónicos, control, telecomunicaciones y automatización.',
    overview: 'Aprende a diseñar sistemas electrónicos y de control, desde microcontroladores hasta redes de sensores, con laboratorios de última generación.',
    malla: [['Cálculo I', 'Álgebra y Geometría', 'Introducción a la Ingeniería Electrónica', 'Física Mecánica', 'Comunicación Oral y Escrita'], ['Cálculo II', 'Álgebra Lineal', 'Física Electromagnética', 'Programación para Ingeniería', 'Circuitos Eléctricos I'], ['Ecuaciones Diferenciales', 'Circuitos Eléctricos II', 'Electrónica Analógica I', 'Electrónica Digital I', 'Probabilidad y Estadística'], ['Señales y Sistemas', 'Electrónica Analógica II', 'Electrónica Digital II', 'Electromagnetismo Aplicado', 'Inglés Técnico'], ['Microcontroladores', 'Teoría de Control I', 'Sistemas de Comunicaciones', 'Instrumentación Electrónica', 'Cálculo Numérico'], ['Teoría de Control II', 'Sistemas Embebidos', 'Procesamiento Digital de Señales', 'Electrónica de Potencia', 'Electivo de Formación General'], ['Telecomunicaciones', 'Redes de Sensores', 'Robótica', 'Diseño de Circuitos Impresos', 'Electivo Profesional I'], ['Internet de las Cosas', 'Automatización Industrial', 'Gestión de Proyectos de Ingeniería', 'Electivo Profesional II', 'Práctica Profesional'], ['Ética y Responsabilidad Profesional', 'Electivo Profesional III', 'Taller de Titulación I'], ['Seminario de Titulación', 'Proyecto de Título']] },
  { slug: 'diseno', prefix: 'DIS', name: 'Diseño', duration: '10 semestres', degree: 'Diseñador', modality: 'Presencial diurno', sites: [A, U],
    description: 'Diseño gráfico, de producto y de experiencias con enfoque creativo y social.',
    overview: 'Un recorrido por el diseño gráfico, de producto y de interfaces, trabajando en talleres con clientes reales y exhibiciones abiertas al público.',
    malla: [['Fundamentos del Diseño', 'Dibujo y Representación', 'Historia del Arte y el Diseño', 'Taller de Diseño I', 'Comunicación Oral y Escrita'], ['Teoría del Color', 'Tipografía', 'Geometría y Forma', 'Taller de Diseño II', 'Fotografía I'], ['Diseño de Producto I', 'Fotografía II', 'Materiales y Procesos', 'Taller de Diseño III', 'Historia del Diseño'], ['Diseño de Interfaces I', 'Diseño de Producto II', 'Modelado Digital', 'Taller de Diseño IV', 'Inglés Técnico'], ['Diseño de Interfaces II', 'Diseño Editorial', 'Ergonomía y Usabilidad', 'Taller de Diseño V', 'Metodología de la Investigación'], ['Diseño de Experiencias', 'Marketing y Marca', 'Prototipado', 'Taller de Diseño VI', 'Electivo de Formación General'], ['Diseño de Servicios', 'Sustentabilidad y Diseño', 'Gestión del Diseño', 'Taller de Diseño VII', 'Electivo Profesional I'], ['Diseño Social', 'Portafolio Profesional', 'Emprendimiento Creativo', 'Electivo Profesional II', 'Práctica Profesional'], ['Taller de Titulación I', 'Seminario de Investigación', 'Electivo Profesional III'], ['Proyecto de Título', 'Exposición de Título']] },
  { slug: 'licenciatura-en-artes-visuales', prefix: 'AVI', name: 'Licenciatura en Artes Visuales', duration: '8 semestres', degree: 'Licenciado en Artes Visuales', modality: 'Presencial vespertino', sites: [A, U],
    description: 'Pintura, escultura, grabado y nuevos medios en un taller permanente de creación.',
    overview: 'Formación práctica en pintura, escultura, grabado y nuevos medios, con curaduría y exposición de obra en la galería de la Facultad.',
    malla: [['Dibujo I', 'Historia del Arte I', 'Teoría de la Imagen', 'Taller de Pintura I', 'Comunicación Oral y Escrita'], ['Dibujo II', 'Historia del Arte II', 'Taller de Escultura I', 'Taller de Grabado I', 'Fotografía y Video I'], ['Pintura II', 'Escultura II', 'Grabado II', 'Teoría del Arte Contemporáneo', 'Fotografía y Video II'], ['Instalación', 'Pintura III', 'Curaduría y Montaje', 'Estética', 'Inglés Técnico'], ['Arte y Nuevos Medios', 'Taller de Obra I', 'Crítica y Escritura', 'Arte Latinoamericano', 'Electivo de Formación General'], ['Taller de Obra II', 'Arte Público y Territorio', 'Gestión Cultural', 'Metodología de la Investigación Artística', 'Electivo Profesional I'], ['Taller de Obra III', 'Proyecto de Exposición', 'Electivo Profesional II', 'Seminario de Título I', 'Práctica Profesional'], ['Seminario de Título II', 'Exposición de Título']] },
  { slug: 'licenciatura-en-musica', prefix: 'MUS', name: 'Licenciatura en Música', duration: '8 semestres', degree: 'Licenciado en Música', modality: 'Presencial diurno', sites: [A],
    description: 'Interpretación, composición y producción musical.',
    overview: 'Formación integral en interpretación, composición y producción, con orquesta, coro y ensambles universitarios.',
    malla: [['Lenguaje Musical I', 'Instrumento Principal I', 'Historia de la Música I', 'Coro I', 'Comunicación Oral y Escrita'], ['Lenguaje Musical II', 'Instrumento Principal II', 'Armonía I', 'Historia de la Música II', 'Conjunto Instrumental I'], ['Armonía II', 'Instrumento Principal III', 'Entrenamiento Auditivo', 'Conjunto Instrumental II', 'Coro II'], ['Contrapunto', 'Instrumento Principal IV', 'Análisis Musical', 'Producción Musical I', 'Inglés Técnico'], ['Composición I', 'Etnomusicología', 'Dirección Musical', 'Producción Musical II', 'Electivo de Formación General'], ['Composición II', 'Pedagogía Musical', 'Música Latinoamericana', 'Instrumento Principal V', 'Electivo Profesional I'], ['Pedagogía Musical Aplicada', 'Recital de Título I', 'Electivo Profesional II', 'Seminario de Título I', 'Práctica Profesional'], ['Recital de Título', 'Seminario de Título II']] },
  { slug: 'innovacion-y-tecnologia-creativa', prefix: 'INN', name: 'Innovación y Tecnología Creativa', duration: '8 semestres', degree: 'Licenciado en Innovación y Tecnología Creativa', modality: 'Presencial diurno', sites: [E, A, U],
    description: 'Programa interdisciplinario que une ingeniería y artes para crear experiencias interactivas.',
    overview: 'Un programa único que se dicta entre las dos facultades: ingenieros y artistas trabajan juntos en proyectos de realidad aumentada, sonido digital e instalaciones interactivas.',
    malla: [['Pensamiento Creativo', 'Programación Creativa', 'Fundamentos de Diseño', 'Cálculo Aplicado', 'Comunicación Oral y Escrita'], ['Electrónica para Artistas', 'Narrativa Interactiva', 'Algoritmos para Creadores', 'Dibujo y Representación', 'Estadística Aplicada'], ['Diseño de Experiencias', 'Computación Gráfica', 'Prototipado Rápido', 'Historia de los Medios', 'Física del Sonido y la Luz'], ['Realidad Aumentada', 'Sonido Digital', 'Taller Interdisciplinario I', 'Interacción Humano-Computador', 'Inglés Técnico'], ['Inteligencia Artificial Creativa', 'Emprendimiento Creativo', 'Taller Interdisciplinario II', 'Instalación Interactiva', 'Electivo de Formación General'], ['Visualización de Datos', 'Ética y Tecnología', 'Taller Interdisciplinario III', 'Producción Audiovisual', 'Electivo Profesional I'], ['Proyecto de Innovación', 'Gestión de Proyectos Creativos', 'Electivo Profesional II', 'Seminario de Título I', 'Práctica Profesional'], ['Seminario de Título II', 'Proyecto de Título']] },
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
  P('Rodrigo Salazar Fuentes', 'Dr. en Ciencias de la Computación', 'Ingeniería de software y calidad', 'Investiga prácticas de desarrollo ágil en equipos medianos. Dicta Ingeniería de Software I y II.', face('men', 11), ['ingenieria-civil-informatica'], [E, U]),
  P('Camila Espinoza Torres', 'Mg. en Ciencias de la Computación', 'Bases de datos y ciencia de datos', 'Trabaja en analítica para el sector público. Coordina el área de datos de la carrera.', face('women', 28), ['ingenieria-civil-informatica'], [E]),
  P('Andrés Fuentes Maldonado', 'Mg. en Redes y Telecomunicaciones', 'Redes y ciberseguridad', 'Ex ingeniero de infraestructura en el sector financiero. Dirige el laboratorio de redes.', face('men', 54), ['ingenieria-civil-informatica'], [E]),
  P('Daniela Pizarro Aguilera', 'Dra. en Matemática Aplicada', 'Cálculo numérico y optimización', 'Enseña matemáticas de primer año y modelamiento numérico para Informática e Industrial.', face('women', 33), ['ingenieria-civil-informatica', 'ingenieria-civil-industrial'], [E]),
  P('Sebastián Lagos Ortega', 'Mg. en Gestión de Operaciones', 'Cadena de suministro y logística', 'Ha implementado sistemas de planificación de la demanda en empresas de consumo masivo.', face('men', 61), ['ingenieria-civil-industrial'], [E]),
  P('Paula Ibáñez Cortés', 'Dra. en Estadística', 'Estadística y control de calidad', 'Aplica métodos estadísticos a procesos de manufactura y salud pública.', face('women', 21), ['ingenieria-civil-industrial'], [E]),
  P('Cristóbal Reyes Navarro', 'Dr. en Ingeniería Electrónica', 'Procesamiento de señales', 'Desarrolla algoritmos para el análisis de señales biomédicas y de audio.', face('men', 18), ['ingenieria-electronica'], [E]),
  P('Marcela Tapia Rivas', 'Mg. en Automatización', 'Automatización industrial y robótica', 'Diseña celdas robotizadas para pequeñas plantas de manufactura.', face('women', 52), ['ingenieria-electronica', 'ingenieria-civil-industrial'], [E]),
  P('Gabriel Soto Cárdenas', 'Mg. en Artes Visuales', 'Escultura y arte público', 'Ha realizado intervenciones en espacios públicos de la región. Dicta los talleres de escultura.', face('men', 85), ['licenciatura-en-artes-visuales'], [A, U]),
  P('Antonia Mella Fuentes', 'Dra. en Historia del Arte', 'Historia y teoría del arte latinoamericano', 'Curadora independiente e investigadora del arte chileno del siglo XX.', face('women', 72), ['licenciatura-en-artes-visuales', 'diseno'], [A, U]),
  P('Benjamín Castro Rojas', 'Mg. en Diseño Gráfico', 'Tipografía y diseño editorial', 'Diseñador de libros y revistas culturales. Dicta Tipografía y Diseño Editorial.', face('men', 41), ['diseno'], [A, U]),
  P('Constanza Vidal Herrera', 'Mg. en Diseño de Interacción', 'Diseño de interfaces y experiencias', 'Lidera proyectos de diseño de servicios digitales con organizaciones públicas.', face('women', 5), ['diseno', 'innovacion-y-tecnologia-creativa'], [A, U]),
  P('Martín Orellana Peña', 'Dr. en Composición Musical', 'Composición y orquestación', 'Sus obras para orquesta y coro se han estrenado en salas de la región. Dicta Composición I y II.', face('men', 36), ['licenciatura-en-musica'], [A]),
  P('Isidora Bustos Mora', 'Mg. en Dirección Coral', 'Dirección coral y canto', 'Dirige el coro de cámara de la Facultad y los talleres de técnica vocal.', face('women', 8), ['licenciatura-en-musica'], [A]),
  P('Nicolás Guzmán Leiva', 'Mg. en Música y Tecnología', 'Producción musical y sonido digital', 'Productor y diseñador sonoro. Dicta Producción Musical y Sonido Digital.', face('men', 67), ['licenciatura-en-musica', 'innovacion-y-tecnologia-creativa'], [A]),
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
  { title: 'Becas de excelencia y continuidad: postula hasta el 30 de noviembre', date: '2026-11-10', category: 'Admisión', imageUrl: img(7972506), sites: [U, E, A],
    description: 'Estudiantes de todas las carreras pueden postular a las becas de excelencia académica y de continuidad de estudios. Las bases están disponibles en cada facultad.' },
  { title: 'Charla abierta: inteligencia artificial en la industria', date: '2026-11-14', category: 'Evento', imageUrl: img(8720589), sites: [E],
    description: 'Académicos y profesionales conversan sobre casos reales de inteligencia artificial en empresas de la región. Auditorio de la Torre de Ingeniería, 18:30 horas.' },
  { title: 'Taller de grabado abierto a la comunidad', date: '2026-11-08', category: 'Cultura', imageUrl: img(5393546), sites: [A, U],
    description: 'Cada sábado de noviembre, estudiantes y académicos de Artes Visuales enseñan técnicas básicas de grabado. Cupos limitados, inscripción gratuita.' },
  { title: 'Convenio de prácticas con empresas del sector logístico', date: '2026-10-30', category: 'Vinculación', imageUrl: img(40382472), sites: [E],
    description: 'La Facultad firmó acuerdos para que estudiantes de Ingeniería Civil Industrial realicen su práctica profesional en centros de distribución de la región.' },
  { title: 'Concurso de diseño sustentable', date: '2026-10-22', category: 'Concurso', imageUrl: img(8546649), sites: [A],
    description: 'Estudiantes de Diseño presentan propuestas de productos y servicios con foco en reducción de residuos. Los proyectos ganadores se exhiben en la galería.' },
  { title: 'Ceremonia de titulación 2026', date: '2026-12-05', category: 'Institucional', imageUrl: img(17615703), sites: [U, E, A],
    description: 'La Universidad celebra a quienes completan sus estudios este año. Las invitaciones se entregan a cada titulado a través de su facultad.' },
  { title: 'Encuentro de egresados de Ingeniería y Artes', date: '2026-12-12', category: 'Evento', imageUrl: img(16255363), sites: [U, E, A],
    description: 'Una tarde para reencontrarse, conocer los proyectos actuales de ambas facultades y conversar con estudiantes que están por egresar.' },
];

// Cifras que salen de los datos reales de este mismo seed, para que la portada no contradiga el contenido.
const count = (list, site) => list.filter((x) => x.sites.includes(site)).length;

// Páginas editables por sitio: `nosotros` completa; las demás aportan título e introducción de cada sección.
const PAGES = {
  [U]: {
    nosotros: { title: 'Sobre la Universidad', imageUrl: img(7972518, 1200, 800),
      intro: 'Desde 1966 formamos personas que transforman su entorno a través del conocimiento, la tecnología y la creación.',
      stats: [{ value: '60', label: 'años de historia' }, { value: '2', label: 'facultades' }, { value: String(CAREERS.length), label: 'carreras de pregrado' }, { value: String(PROFESSORS.length), label: 'académicos' }],
      values: [
        { title: 'Excelencia', text: 'Exigimos rigor académico y lo acompañamos con apoyo real a cada estudiante.' },
        { title: 'Vocación pública', text: 'Somos una universidad del Estado: investigamos y enseñamos para el país.' },
        { title: 'Diálogo entre disciplinas', text: 'La ingeniería y las artes comparten aulas, laboratorios y proyectos.' },
        { title: 'Comunidad', text: 'Un solo campus donde estudiantes, académicos y vecinos se encuentran.' }],
      body: `## Nuestra historia\n\nLa Universidad Tecnológica del Este nació en 1966 como una escuela técnica al servicio de la industria regional. Hoy es una universidad pública y compleja, con dos facultades y un campus que reúne laboratorios, talleres, una galería de arte y un auditorio abierto a la ciudad.\n\n## Misión\n\nFormar profesionales y creadores con sólido criterio ético, capaces de resolver problemas reales, y generar conocimiento que mejore la vida de las personas y del territorio.\n\n## Qué nos distingue\n\n- Programas interdisciplinarios dictados en conjunto por Ingeniería y Artes.\n- Laboratorios propios y vínculo permanente con la industria y el sector cultural.\n- Becas de excelencia académica y de continuidad de estudios.` },
    carreras: { title: 'Carreras', intro: 'Programas de pregrado de la Universidad. Algunas carreras se dictan en conjunto con nuestras facultades.' },
    profesores: { title: 'Cuerpo académico', intro: 'Académicos de ambas facultades que combinan docencia, investigación y trabajo con la comunidad.' },
    anuncios: { title: 'Noticias y anuncios', intro: 'Admisión, actividades y logros de toda la comunidad universitaria.' } },
  [E]: {
    nosotros: { title: 'Sobre la Facultad de Ingeniería', imageUrl: img(3912373, 1200, 800),
      intro: 'Formamos ingenieras e ingenieros que diseñan, construyen y mejoran los sistemas que hacen funcionar al país.',
      stats: [{ value: String(count(CAREERS, E)), label: 'programas de pregrado' }, { value: String(count(PROFESSORS, E)), label: 'académicos' }, { value: '6', label: 'laboratorios' }, { value: '4', label: 'líneas de investigación' }],
      values: [
        { title: 'Aprender haciendo', text: 'Cada semestre incluye un proyecto con problemas reales de la industria.' },
        { title: 'Base científica sólida', text: 'Matemáticas, física y computación como cimiento de todo el plan de estudios.' },
        { title: 'Trabajo en equipo', text: 'Proyectos colaborativos, a veces junto a estudiantes de Artes.' }],
      body: `## Quiénes somos\n\nLa Facultad de Ingeniería reúne a las carreras de Informática, Industrial y Electrónica. Trabajamos en una torre propia dentro del Campus Central, con laboratorios de computación, electrónica y robótica disponibles para estudiantes desde el primer año.\n\n## Cómo formamos\n\nNuestro modelo combina clases, talleres y prácticas. Hacia el final de la carrera los estudiantes realizan una práctica profesional y desarrollan su proyecto de título con un académico guía.\n\n## Investigación y vínculo\n\nTenemos líneas de trabajo en inteligencia artificial, optimización logística, sistemas embebidos y automatización. Muchas nacen de problemas planteados por empresas de la región, con las que mantenemos convenios de práctica y colaboración.` },
    carreras: { title: 'Carreras de Ingeniería', intro: 'Tres carreras de ingeniería civil y un programa interdisciplinario con la Facultad de Artes.' },
    profesores: { title: 'Académicos de Ingeniería', intro: 'Doctores y magísteres con experiencia en investigación aplicada y en la industria.' },
    anuncios: { title: 'Noticias de la Facultad', intro: 'Laboratorios, logros de estudiantes y actividades de Ingeniería.' } },
  [A]: {
    nosotros: { title: 'Sobre la Facultad de Artes', imageUrl: img(5104713, 1200, 800),
      intro: 'Un espacio abierto para crear, expresarse y pensar críticamente a través de las artes visuales, el diseño y la música.',
      stats: [{ value: String(count(CAREERS, A)), label: 'programas de pregrado' }, { value: String(count(PROFESSORS, A)), label: 'académicos' }, { value: '12', label: 'talleres abiertos' }, { value: '1', label: 'galería propia' }],
      values: [
        { title: 'Creación', text: 'El taller es el centro de la formación: se aprende produciendo obra.' },
        { title: 'Pensamiento crítico', text: 'Teoría, historia y escritura acompañan toda práctica artística.' },
        { title: 'Apertura', text: 'Exposiciones y conciertos gratuitos para la comunidad y la ciudad.' }],
      body: `## Quiénes somos\n\nLa Facultad de Artes funciona en la Casa de las Artes, en el Campus Norte. Reúne a Diseño, Artes Visuales y Música en talleres compartidos, una galería y salas de ensayo.\n\n## Cómo formamos\n\nLa formación es práctica y tutorial: grupos pequeños, académicos que también son artistas en ejercicio y exhibiciones públicas de los trabajos de estudiantes durante el año.\n\n## Con la ciudad\n\nLa galería, la orquesta y el coro universitario ofrecen temporadas abiertas. Además, el programa de Innovación y Tecnología Creativa se dicta junto a la Facultad de Ingeniería y vincula arte, sonido digital e interacción.` },
    carreras: { title: 'Carreras de Artes', intro: 'Diseño, artes visuales, música y un programa interdisciplinario con Ingeniería.' },
    profesores: { title: 'Académicos de Artes', intro: 'Artistas, diseñadores y compositores que enseñan desde su práctica profesional.' },
    anuncios: { title: 'Noticias de la Facultad', intro: 'Exposiciones, conciertos y novedades de la Facultad de Artes.' } },
};

// Noticias del primer seed: se les agregan etiquetas y se normaliza la categoría al vocabulario de las nuevas.
const OLD_TAGS = {
  'Postulaciones abiertas': ['Admisión', 'Vida universitaria'], 'Feria de Innovación': ['Innovación', 'Arte y tecnología'],
  'Nueva infraestructura': ['Electrónica', 'Innovación'], 'Equipo de Ingeniería gana': ['Robótica', 'Electrónica'],
  'Exposición anual': ['Exposiciones', 'Talleres'], 'Temporada de conciertos': ['Música'], 'La Universidad celebra': ['Vida universitaria', 'Egresados'],
  'Becas de excelencia': ['Admisión', 'Bienestar'], 'Charla abierta': ['Inteligencia artificial', 'Industria'], 'Taller de grabado': ['Talleres', 'Exposiciones'],
  'Convenio de prácticas': ['Industria', 'Emprendimiento'], 'Concurso de diseño': ['Diseño', 'Sustentabilidad'], 'Ceremonia de titulación': ['Egresados', 'Vida universitaria'],
  'Encuentro de egresados': ['Egresados', 'Vida universitaria'],
};
const CAT_MAP = { Evento: 'Extensión', Logros: 'Premios y logros', Cultura: 'Extensión', Vinculación: 'Alianzas', Concurso: 'Premios y logros', Infraestructura: 'Infraestructura' };
const oldTags = (title) => OLD_TAGS[Object.keys(OLD_TAGS).find((k) => title.startsWith(k))] ?? [];

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
        await upsert('courses', 'code', code, { code, name, semester: i + 1, credits: Math.round(30 / ramos.length), career: set([c.slug], ids.career) });
      }
    }
  }
  for (const { careers, sites, ...p } of PROFESSORS) {
    await upsert('professors', 'name', p.name, { ...p, careers: set(careers, ids.career), sites: set(sites, ids.site) });
  }
  const allNews = [
    ...ANNOUNCEMENTS.map(({ sites, ...a }) => ({ ...a, sites, category: CAT_MAP[a.category] ?? a.category, tags: oldTags(a.title) })),
    ...NEWS.map((n, i) => ({ ...n, imageUrl: photoFor(n.tags, n.sites, i) })),
  ];
  for (const { sites, ...a } of allNews) {
    await upsert('announcements', 'title', a.title, { ...a, sites: set(sites, ids.site) });
  }
  for (const [i, { sites, ...e }] of EVENTS.entries()) {
    await upsert('events', 'slug', e.slug, { ...e, imageUrl: photoFor(e.tags, sites, i), sites: set(sites, ids.site) });
  }
  for (const [site, pages] of Object.entries(PAGES)) {
    for (const [slug, p] of Object.entries(pages)) {
      await upsert('pages', 'slug', slug, { slug, ...p, site: set([site], ids.site) }, `&filters[site][slug][$eq]=${site}`);
    }
  }
  const allNewsCount = ANNOUNCEMENTS.length + NEWS.length;
  const courses = CAREERS.reduce((n, c) => n + c.malla.flat().length, 0);
  console.log(`Seed OK: ${SITES.length} sitios, ${CAREERS.length} carreras, ${courses} ramos, ${PROFESSORS.length} profesores, ${allNewsCount} noticias, ${EVENTS.length} eventos, ${Object.values(PAGES).reduce((n, p) => n + Object.keys(p).length, 0)} páginas.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
