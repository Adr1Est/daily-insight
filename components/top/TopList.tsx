import Link from "next/link";

import { formatScore } from "@/components/box/formatScore";
import styles from "@/components/top/top.module.css";
import type { BugType } from "@/types/bug";

/** Lista de éxitos del videoclub: cada fila lleva a su caja en la estantería. */
export default function TopList({ bugs }: { bugs: BugType[] }) {
  return (
    <ol className={styles.chart}>
      {bugs.map((bug, index) => {
        const rank = index + 1;
        return (
          <li key={bug.id}>
            <Link
              href={`/bugs#bug-${bug.id}`}
              className={styles.row}
              data-podium={rank <= 3 || undefined}
              aria-label={`${rank}. ${bug.game}, ${bug.platform}, ${bug.bugYear}: ${bug.score} puntos`}
            >
              <span className={styles.rank} aria-hidden="true">
                {String(rank).padStart(2, "0")}
              </span>
              <span className={styles.game}>
                <span className={styles.title}>{bug.game}</span>
                <span className={styles.meta}>
                  {bug.platform} · {bug.bugYear}
                </span>
              </span>
              <span className={styles.score} aria-hidden="true">
                {formatScore(bug.score)}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
