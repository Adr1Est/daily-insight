/** Puntuación con signo, como un marcador: +12, −3, 0 (con el signo menos tipográfico). */
export const formatScore = (score: number): string =>
  score > 0 ? `+${score}` : score < 0 ? `−${Math.abs(score)}` : "0";
