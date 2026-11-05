export interface BugType {
  id: number;
  game: string;
  platform: string;
  bugYear: number;
  data: string;
  day: number;
  month: string;
  year: number;
  createdAt: Date;
  /** Me gusta − no me gusta. En las páginas estáticas puede ir hasta una hora por detrás. */
  score: number;
}
