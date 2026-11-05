import type { Metadata } from "next";

import RetryButton from "@/components/shelf/RetryButton";
import styles from "@/components/shelf/shelf.module.css";

// La sirve el service worker (public/sw.js) cuando no hay red ni copia de la página pedida.
export const metadata: Metadata = {
  title: "Sin conexión · Daily Bug",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <main className={styles.statusMain}>
      <div className={styles.status} role="status">
        <p className={styles.statusTitle}>Sin señal en el videoclub</p>
        <p>
          No hay conexión y esta caja no estaba guardada. Las páginas que ya has visitado siguen
          disponibles; vuelve a intentarlo cuando tengas red.
        </p>
        <RetryButton />
      </div>
    </main>
  );
}
