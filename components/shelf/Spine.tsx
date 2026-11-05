import Link from "next/link";

import { spineAccent } from "@/components/box/spineAccent";
import styles from "@/components/shelf/shelf.module.css";
import { kindLabel } from "@/lib/insights/kinds";
import type { BugType } from "@/types/bug";

interface SpineProps {
  bug: BugType;
  /** Con href el lomo es un enlace; si no, un botón que abre la caja. */
  href?: string;
  onOpen?: () => void;
  isToday?: boolean;
  isOut?: boolean;
  controls?: string;
  id?: string;
}

export default function Spine({
  bug,
  href,
  onOpen,
  isToday = false,
  isOut = false,
  controls,
  id,
}: SpineProps) {
  const label = `${kindLabel(bug.kind)}: ${bug.game}, ${bug.platform}, ${bug.bugYear}`;
  const style = { "--accent": spineAccent(bug.platform) } as React.CSSProperties;
  // Las cajas con títulos largos tienen el lomo más grueso, para imprimir el título en dos líneas.
  const thick = bug.game.length > 18 || undefined;

  const content = (
    <>
      <span className={styles.spineTitle}>{bug.game}</span>
      <span className={styles.spineMeta}>{bug.bugYear}</span>
      {isToday && (
        <span className={styles.spineToday} aria-hidden="true">
          Hoy
        </span>
      )}
      {isOut && (
        <span className={styles.spineOut} aria-hidden="true">
          Fuera
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={styles.spine}
        style={style}
        aria-label={label}
        id={id}
        data-thick={thick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={styles.spine}
      style={style}
      onClick={onOpen}
      aria-label={label}
      aria-expanded={isOut}
      aria-controls={isOut ? controls : undefined}
      id={id}
      data-thick={thick}
    >
      {content}
    </button>
  );
}
