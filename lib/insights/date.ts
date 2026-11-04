export interface SpanishDate {
  day: number;
  /** Nombre del mes en español con la primera letra en mayúscula, como en la BD («Noviembre»). */
  month: string;
  year: number;
}

/** Fecha de publicación calculada en el servidor (no por el modelo), en hora de Madrid. */
export function spanishDate(date: Date = new Date(), timeZone = "Europe/Madrid"): SpanishDate {
  const parts = new Intl.DateTimeFormat("es-ES", { timeZone, day: "numeric", month: "long", year: "numeric" }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  const month = get("month");

  return {
    day: Number(get("day")),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    year: Number(get("year")),
  };
}
