import styles from "@/components/shelf/shelf.module.css";

export default function Loading() {
  return (
    <main className={styles.statusMain}>
      <div className={styles.status} role="status">
        <p className={styles.statusTitle}>Rebobinando…</p>
        <p>Buscando la caja en el almacén.</p>
      </div>
    </main>
  );
}
