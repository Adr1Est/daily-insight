"use client";

import styles from "@/components/shelf/shelf.module.css";

/** Vuelve a pedir la página actual (página sin conexión). */
export default function RetryButton() {
  return (
    <button type="button" className={styles.statusButton} onClick={() => location.reload()}>
      Reintentar
    </button>
  );
}
