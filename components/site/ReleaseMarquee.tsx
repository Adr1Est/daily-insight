"use client";

import { useSyncExternalStore } from "react";

import styles from "@/components/site/site.module.css";
import { madridIsoDate, nextReleases } from "@/lib/insights/calendar";

const subscribe = () => () => {};

const longDate = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/**
 * Rótulo luminoso sobre la cabecera con el próximo lanzamiento del calendario. Se calcula en el
 * navegador: las páginas son estáticas y la cabecera de /ajustes no se regenera nunca, así que en el
 * servidor la fecha se quedaría vieja. Sin lanzamientos próximos no se pinta.
 */
export default function ReleaseMarquee() {
  // La fecha de Madrid como instantánea: null en el servidor y al hidratar, la de hoy después.
  const today = useSyncExternalStore(
    subscribe,
    () => madridIsoDate(new Date()),
    () => null,
  );
  if (!today) return null;

  const next = nextReleases(new Date(`${today}T12:00:00Z`));
  if (!next) return null;

  const when = next.daysLeft === 1 ? "Mañana" : `En ${next.daysLeft} días`;
  const date = longDate.format(new Date(`${next.date}T00:00:00Z`));
  const content = (
    <>
      <span className={styles.marqueeLead}>Próximo lanzamiento</span>
      <span>
        {when} · {date}
      </span>
      {next.releases.map((release) => (
        <span key={release.game} className={styles.marqueeGame}>
          <span className={styles.marqueeStar} aria-hidden="true">
            ★
          </span>
          {release.game}
          <span className={styles.marqueeMeta}>
            {release.platform}
            {release.note ? ` · ${release.note}` : ""}
          </span>
        </span>
      ))}
    </>
  );

  return (
    <aside className={styles.marquee} aria-label="Próximo lanzamiento">
      {/* Dos copias seguidas para que el bucle no tenga corte; la segunda es solo decorativa. */}
      <div className={styles.marqueeTrack}>
        <p className={styles.marqueeItem}>{content}</p>
        <p className={styles.marqueeItem} aria-hidden="true">
          {content}
        </p>
      </div>
    </aside>
  );
}
