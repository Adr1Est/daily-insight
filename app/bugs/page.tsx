export const dynamic = 'force-dynamic';

import { getAllInsights, isMockMode } from "@/lib/data";
import Shelf from "@/app/ui/shelf/Shelf";
import EmptyShelf from "@/app/ui/shelf/EmptyShelf";
import styles from "@/app/ui/shelf/shelf.module.css";

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
