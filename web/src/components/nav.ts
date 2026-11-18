import { extraOf } from "@/lib/extras";

/** Navegación común + la página propia de cada sitio (definida en el front) antes de "Sobre nosotros". */
export function navFor(slug: string): readonly (readonly [string, string])[] {
  const extra = extraOf(slug);
  return [
    ["/", "Inicio"], ["/carreras", "Carreras"], ["/profesores", "Profesores"], ["/noticias", "Noticias"], ["/agenda", "Agenda"],
    ...(extra ? [[extra.path, extra.label] as const] : []), ["/nosotros", "Sobre nosotros"],
  ];
}
