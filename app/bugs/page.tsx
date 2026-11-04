import EmptyShelf from "@/components/shelf/EmptyShelf";
import Shelf from "@/components/shelf/Shelf";
import styles from "@/components/shelf/shelf.module.css";
import { getInsightsPage, isMockMode } from "@/lib/data";
import { PAGE_SIZE } from "@/lib/pagination";

// Los datos cambian una vez al día: página estática que el cron invalida al publicar (y cada hora como red de seguridad).
// Solo se renderiza la primera página; el resto (y la búsqueda) llega paginado desde /api/bugs.
export const revalidate = 3600;

export const metadata = {
  title: "La estantería · Daily Bug",
  description: "Todos los bugs de la historia de los videojuegos publicados en Daily Bug.",
};

export default async function BugsList() {
  const firstPage = await getInsightsPage({ limit: PAGE_SIZE });

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>La estantería</h1>
      {firstPage.total > 0 ? (
        <Shelf initialPage={firstPage} isSample={isMockMode()} />
      ) : (
        <EmptyShelf />
      )}
    </main>
  );
}
