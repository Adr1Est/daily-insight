import type { InsightKind } from "@/lib/insights/kinds";

export interface BugType {
  id: number;
  game: string;
  platform: string;
  /** Año del hecho (el nombre es histórico: antes solo había bugs). */
  bugYear: number;
  kind: InsightKind;
  data: string;
  day: number;
  month: string;
  year: number;
  createdAt: Date;
  /** Me gusta − no me gusta. En las páginas estáticas puede ir hasta una hora por detrás. */
  score: number;
  /** Lanzamiento del calendario que motivó la curiosidad ese día (null si no hubo). */
  releaseGame: string | null;
  releasePlatform: string | null;
  /** Año de salida: igual a `year` en un estreno, anterior en un aniversario. */
  releaseYear: number | null;
}
