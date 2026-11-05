import styles from "@/components/box/box.module.css";
import { spineAccent } from "@/components/box/spineAccent";
import VoteControl from "@/components/box/VoteControl";
import type { BugType } from "@/types/bug";

interface BoxCoverProps {
  bug: BugType;
  /** Muestra la pegatina «¡Hoy!»: solo el bug más reciente. */
  isToday?: boolean;
  headingLevel?: "h1" | "h2";
  headingId?: string;
  /** Acción al pie de la contraportada (enlace a la estantería, devolver la caja...). */
  action?: React.ReactNode;
  /** Datos de ejemplo (DATA_SOURCE=mock): el crédito lo indica en lugar de atribuirlo a la IA. */
  isSample?: boolean;
}

export default function BoxCover({
  bug,
  isToday = false,
  headingLevel = "h1",
  headingId,
  action,
  isSample = false,
}: BoxCoverProps) {
  const Heading = headingLevel;
  const published = `${bug.day} de ${bug.month.toLowerCase()} de ${bug.year}`;

  return (
    <article
      className={styles.box}
      aria-labelledby={headingId}
      style={{ "--accent": spineAccent(bug.platform) } as React.CSSProperties}
    >
      {/* El lomo repite lo que ya dice la ficha: es decorativo para lectores de pantalla. */}
      <div className={styles.spine} aria-hidden="true">
        <span className={styles.pal}>PAL</span>
        <span className={styles.spineTitle} data-long={bug.game.length > 16 || undefined}>
          {bug.game}
        </span>
        <span className={styles.spinePlatform}>
          {bug.platform} · {bug.bugYear}
        </span>
      </div>

      <div className={styles.back}>
        <div className={styles.stickers}>
          {isToday && <span className={styles.today}>¡Hoy!</span>}
          <p className={styles.number}>
            <span>Bug nº</span>
            <b>{bug.id}</b>
            <span>
              {bug.day} {bug.month.slice(0, 3)} {bug.year}
            </span>
          </p>
        </div>

        <Heading id={headingId} className={styles.title}>
          {bug.game}
        </Heading>

        <dl className={styles.facts}>
          <div>
            <dt>Plataforma</dt>
            <dd>{bug.platform}</dd>
          </div>
          <div>
            <dt>Año del bug</dt>
            <dd>{bug.bugYear}</dd>
          </div>
          <div>
            <dt>En la estantería</dt>
            <dd>{published}</dd>
          </div>
        </dl>

        <p className={styles.text}>{bug.data}</p>

        <footer className={styles.foot}>
          <p className={styles.credit}>
            {isSample ? "Datos de ejemplo · no generados por la IA" : "Texto generado con IA"}
          </p>
          <VoteControl key={bug.id} bugId={bug.id} initialScore={bug.score} />
          {action}
        </footer>
      </div>
    </article>
  );
}
