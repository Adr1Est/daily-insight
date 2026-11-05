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

// Calendario de lanzamientos importantes: noviembre 2026 – diciembre 2027
// Fechas comprobadas el 5 de noviembre de 2026. Pueden cambiar por retrasos.

export const RELEASES: Release[] = [
  // ── Noviembre 2026 ──────────────────────────────────────────────
  {
    date: "2026-11-05",
    game: "The Legend of Zelda: Ocarina of Time (remake)",
    platform: "Switch 2",
    year: 2026,
    note: "Sale hoy",
  },
  { date: "2026-11-06", game: "Stellar Blade", platform: "Switch 2", year: 2026, note: "Port" },
  {
    date: "2026-11-10",
    game: "Shrek 2 Remastered",
    platform: "PS5, Xbox Series X|S, Switch 2, Switch, PC",
    year: 2026,
  },
  {
    date: "2026-11-12",
    game: "Metaphor: ReFantazio",
    platform: "Switch 2",
    year: 2026,
    note: "Port",
  },
  {
    date: "2026-11-12",
    game: "Sonic Pico Park",
    platform: "PS5, Xbox Series X|S, Switch 2, Switch, PC",
    year: 2026,
  },
  {
    date: "2026-11-19",
    game: "Grand Theft Auto VI",
    platform: "PS5, Xbox Series X|S",
    year: 2026,
    note: "Lanzamiento del año; PC sin fecha",
  },

  // ── Diciembre 2026 ──────────────────────────────────────────────
  {
    date: "2026-12-03",
    game: "Dragon Quest Monsters: The Withered World",
    platform: "PS5, Switch 2, Switch",
    year: 2026,
  },
  {
    date: "2026-12-03",
    game: "Rayman Legends Retold",
    platform: "PS5, Xbox Series X|S, Switch 2, PC",
    year: 2026,
  },
  { date: "2026-12-03", game: "Warhammer 40,000: Dawn of War IV", platform: "PC", year: 2026 },
  {
    date: "2026-12-03",
    game: "Xenoblade Chronicles 3 – Switch 2 Edition",
    platform: "Switch 2",
    year: 2026,
  },
  {
    date: "2026-12-04",
    game: "Monster Hunter Wilds",
    platform: "Switch 2",
    year: 2026,
    note: "Port",
  },
  {
    date: "2026-12-10",
    game: "Professor Layton and the New World of Steam",
    platform: "PS5, Switch 2, Switch, PC",
    year: 2026,
  },
  {
    date: "2026-12-10",
    game: "Attack on Titan 3",
    platform: "PS5, Xbox Series X|S, Switch 2, PC",
    year: 2026,
  },
  {
    date: "2026-12-11",
    game: "Path of Exile II",
    platform: "PS5, Xbox Series X|S, PC",
    year: 2026,
    note: "Versión 1.0",
  },

  // ── Enero 2027 ──────────────────────────────────────────────────
  {
    date: "2027-01-14",
    game: "Danganronpa 2x2",
    platform: "PS5, Xbox Series X|S, Switch 2, Switch, PC",
    year: 2027,
  },
  {
    date: "2027-01-26",
    game: "Forza Horizon 6",
    platform: "PS5",
    year: 2027,
    note: "Ya disponible en Xbox y PC",
  },
  { date: "2027-01-28", game: "Until Dawn 2", platform: "PS5", year: 2027 },
  { date: "2027-01-28", game: "Metroid Ravenous", platform: "Switch 2", year: 2027 },
  {
    date: "2027-01-28",
    game: "Witchbrook",
    platform: "PS5, Xbox Series X|S, Switch, PC",
    year: 2027,
  },

  // ── Febrero 2027 ────────────────────────────────────────────────
  { date: "2027-02-04", game: "Metro 2039", platform: "PS5, Xbox Series X|S, PC", year: 2027 },
  {
    date: "2027-02-12",
    game: "Tomb Raider: Legacy of Atlantis",
    platform: "PS5, Xbox Series X|S, Switch 2, PC",
    year: 2027,
    note: "Remake del original",
  },
  {
    date: "2027-02-18",
    game: "Persona 4 Revival",
    platform: "PS5, Xbox Series X|S, PC",
    year: 2027,
  },
  {
    date: "2027-02-23",
    game: "Fable",
    platform: "PS5, Xbox Series X|S, PC",
    year: 2027,
    note: "Acceso anticipado Premium desde el 5 de feb.",
  },

  // ── Marzo 2027 ──────────────────────────────────────────────────
  {
    date: "2027-03-04",
    game: "Wo Long 2: Wings of Ember",
    platform: "PS5, Xbox Series X|S, Switch 2, PC",
    year: 2027,
  },
  { date: "2027-03-18", game: "007 First Light", platform: "Switch 2", year: 2027, note: "Port" },

  // ── Abril 2027 ──────────────────────────────────────────────────
  {
    date: "2027-04-08",
    game: "Final Fantasy VII Revelation",
    platform: "PS5, Xbox Series X|S, Switch 2, PC",
    year: 2027,
    note: "Final de la trilogía Remake",
  },

  // ── Mayo 2027 ───────────────────────────────────────────────────
  {
    date: "2027-05-20",
    game: "God of War: Laufey",
    platform: "PS5",
    year: 2027,
    note: "Retrasado (antes 16 de feb.)",
  },
  { date: "2027-05-20", game: "Persona 4 Revival", platform: "Switch 2", year: 2027 },
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
