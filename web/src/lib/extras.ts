import type { Tenant } from "./tenants";

/**
 * Páginas propias de cada sitio, definidas en el FRONT (no en Strapi): la universidad tiene Admisión,
 * Ingeniería sus Laboratorios y Artes su Galería. El resto del contenido (noticias, agenda, carreras...) vive en Strapi.
 * shortcut: el texto de estas páginas es código; si los editores deben cambiarlo, moverlo a un tipo `Page` de Strapi.
 */
const px = (id: number, w = 800, h = 520) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export interface ExtraItem { title: string; text: string; image?: string; meta?: string[] }
export interface Extra {
  path: string; label: string; title: string; intro: string; layout: "steps" | "cards";
  items: ExtraItem[]; cta?: { label: string; href: string }; teaser: string;
}

export const extras: Partial<Record<Tenant, Extra>> = {
  university: {
    path: "/admision", label: "Admisión", title: "Admisión 2027", layout: "steps",
    intro: "Postular es un proceso corto. Estos son los pasos y las fechas para ingresar a cualquiera de nuestras carreras.",
    teaser: "Fechas, requisitos y becas para ingresar el próximo año.",
    items: [
      { title: "Elige tu carrera", text: "Revisa las carreras de ambas facultades, sus mallas y los programas interdisciplinarios.", meta: ["Hasta el 15 de enero"] },
      { title: "Postula en línea", text: "Completa el formulario con tus datos y el puntaje de tu prueba de ingreso. Puedes ordenar hasta tres preferencias.", meta: ["Del 2 al 15 de enero"] },
      { title: "Revisa los resultados", text: "Las listas de selección se publican en este sitio y se avisa por correo a cada postulante.", meta: ["20 de enero"] },
      { title: "Matricúlate y pide tu beca", text: "Confirma tu cupo y postula a las becas de excelencia y de continuidad de estudios.", meta: ["Del 21 al 28 de enero"] },
    ],
    cta: { label: "Ver carreras", href: "/carreras" },
  },
  engineering: {
    path: "/laboratorios", label: "Laboratorios", title: "Laboratorios y talleres", layout: "cards",
    intro: "Espacios de práctica abiertos a estudiantes desde el primer año, con equipos propios y horarios de libre uso.",
    teaser: "Seis espacios para construir, medir y probar.",
    items: [
      { title: "Laboratorio de Computación y Datos", text: "Estaciones de trabajo, servidores de práctica y entornos de ciencia de datos.", image: px(7988086), meta: ["40 puestos", "Informática"] },
      { title: "Laboratorio de Electrónica", text: "Mesas de soldadura, osciloscopios y fuentes para circuitos analógicos y digitales.", image: px(9242271), meta: ["24 puestos", "Electrónica"] },
      { title: "Laboratorio de Robótica", text: "Brazos, robots móviles y una cancha de pruebas para el equipo de competencia.", image: px(3861960), meta: ["Libre uso", "Electrónica · Industrial"] },
      { title: "Laboratorio de Redes y Seguridad", text: "Red aislada para practicar configuración, monitoreo y defensa sin riesgos.", image: px(8720589), meta: ["20 puestos", "Informática"] },
      { title: "Taller de Prototipado", text: "Impresión 3D, corte láser y herramientas para llevar una idea a un prototipo.", image: px(2517330), meta: ["Con reserva", "Todas las carreras"] },
      { title: "Laboratorio de Procesos y Logística", text: "Simuladores de bodega y líneas de producción a escala para practicar gestión de operaciones.", image: px(40382472), meta: ["30 puestos", "Industrial"] },
    ],
    cta: { label: "Ver la agenda de actividades", href: "/agenda" },
  },
  arts: {
    path: "/galeria", label: "Galería", title: "Galería de la Facultad", layout: "cards",
    intro: "Obras, talleres y espacios de la Casa de las Artes. La muestra se renueva con cada temporada.",
    teaser: "Un recorrido por salas, talleres y escenarios de la Casa de las Artes.",
    items: [
      { title: "Sala de exposiciones", text: "Muestras de estudiantes y artistas invitados, con montaje a cargo de Curaduría.", image: px(1604991), meta: ["Entrada liberada"] },
      { title: "Sala histórica", text: "Pinturas y obras de la colección de la Facultad.", image: px(14595876), meta: ["Visitas guiadas"] },
      { title: "Taller de pintura y escultura", text: "Espacio de trabajo permanente con luz natural y atelier compartido.", image: px(5393546), meta: ["Artes Visuales"] },
      { title: "Taller de diseño", text: "Mesas colectivas para proyectos de gráfica, producto y experiencias.", image: px(5104713), meta: ["Diseño"] },
      { title: "Cuaderno de bocetos", text: "Proceso de trabajo de estudiantes de Diseño: de la idea al prototipo.", image: px(8546649), meta: ["Diseño"] },
      { title: "Sala de ensayo", text: "Cuerdas, coro y conjuntos instrumentales ensayan para la temporada.", image: px(4513456), meta: ["Música"] },
      { title: "Auditorio", text: "Conciertos de la Orquesta Universitaria y funciones abiertas a la comunidad.", image: px(4028878), meta: ["Música · Teatro"] },
      { title: "Laboratorio de arte y tecnología", text: "Realidad virtual, sonido digital e instalaciones interactivas.", image: px(5207240), meta: ["Innovación y Tecnología Creativa"] },
    ],
    cta: { label: "Ver la agenda cultural", href: "/agenda" },
  },
};

export const extraOf = (slug: string): Extra | undefined => extras[slug as Tenant];
