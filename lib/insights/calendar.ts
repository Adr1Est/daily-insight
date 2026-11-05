// Calendario de lanzamientos importantes. El día que coincide con una entrada, la curiosidad del
// día trata de ese juego (de cualquier tipo que encaje) en lugar de un tema al azar.
//
// - date "MM-DD": aniversario, se repite cada año (p. ej. "09-13").
// - date "AAAA-MM-DD": una sola vez (p. ej. el día de salida de un juego nuevo).
// Las fechas son de Madrid, como la fecha de publicación. Si dos entradas caen el mismo día, gana
// la de fecha completa.

export interface Release {
  date: string;
  /** Título oficial en España. */
  game: string;
  platform: string;
  /** Año de lanzamiento. */
  year: number;
  /** Contexto opcional para el modelo («primer juego de la saga», «sale hoy»…). */
  note?: string;
}

export const RELEASES: Release[] = [
  // Ejemplos de formato; descoméntalos o sustitúyelos por tu calendario.
  // { date: "09-13", game: "Super Mario Bros.", platform: "NES", year: 1985 },
  // { date: "05-22", game: "Pac-Man", platform: "Arcade", year: 1980 },
  // { date: "11-21", game: "The Legend of Zelda: Ocarina of Time", platform: "Nintendo 64", year: 1998 },
  // { date: "2026-11-19", game: "Nombre del juego", platform: "PS5, Xbox Series X|S", year: 2026, note: "Sale hoy" },
];

const FULL = /^\d{4}-\d{2}-\d{2}$/;
const ANNIVERSARY = /^\d{2}-\d{2}$/;

/** Fecha de Madrid como «AAAA-MM-DD». */
export function madridIsoDate(date: Date, timeZone = "Europe/Madrid"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** La entrada del calendario de hoy, si la hay. */
export function findRelease(date: Date, releases: Release[] = RELEASES): Release | null {
  const iso = madridIsoDate(date);
  const monthDay = iso.slice(5);
  return (
    releases.find((r) => FULL.test(r.date) && r.date === iso) ??
    releases.find((r) => ANNIVERSARY.test(r.date) && r.date === monthDay) ??
    null
  );
}

/** true si es un lanzamiento de este mismo año: el modelo aún no puede conocer el juego. */
export const isNewRelease = (release: Release, date: Date) =>
  release.year >= Number(madridIsoDate(date).slice(0, 4));
