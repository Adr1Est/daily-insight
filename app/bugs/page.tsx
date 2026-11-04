// Los datos cambian una vez al día: página estática que el cron invalida al publicar (y cada hora como red de seguridad).
export const revalidate = 3600;

import { getAllInsights, isMockMode } from "@/lib/data";
import Shelf from "@/components/shelf/Shelf";
import EmptyShelf from "@/components/shelf/EmptyShelf";
import styles from "@/components/shelf/shelf.module.css";

export const metadata = {
  title: "La estantería · Daily Bug",
  description: "Todos los bugs de la historia de los videojuegos publicados en Daily Bug.",
};

export default async function BugsList(){
  const bugs = await getAllInsights();

  return(
    <main className={styles.main}>
      <h1 className={styles.heading}>La estantería</h1>
      {bugs.length > 0 ? <Shelf bugs={bugs} isSample={isMockMode()} /> : <EmptyShelf />}
    </main>
  )
}
