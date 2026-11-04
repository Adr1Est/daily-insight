"use client";

import styles from "@/components/shelf/shelf.module.css";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.statusMain}>
      <div className={styles.status} role="alert">
        <p className={styles.statusTitle}>No hemos podido abrir la estantería</p>
        <p>Ha fallado la conexión con el almacén de bugs. Vuelve a intentarlo en unos segundos.</p>
        <button type="button" className={styles.statusButton} onClick={reset}>
          Reintentar
        </button>
      </div>
    </main>
  );
}
