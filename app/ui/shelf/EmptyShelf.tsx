import styles from "@/app/ui/shelf/shelf.module.css";

export default function EmptyShelf(){
  return (
    <div className={styles.status}>
      <p className={styles.statusTitle}>La estantería está vacía</p>
      <p>Todavía no ha llegado ningún bug. Cada día se repone una caja nueva.</p>
    </div>
  );
}
