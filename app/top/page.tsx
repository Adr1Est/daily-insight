import Link from "next/link";

import shelfStyles from "@/components/shelf/shelf.module.css";
import styles from "@/components/top/top.module.css";
import TopList from "@/components/top/TopList";
import { getTopInsights, TOP_SIZE } from "@/lib/data";

// Los votos no invalidan la página (llegan a cualquier hora): se regenera cada 5 minutos.
export const revalidate = 300;

export const metadata = {
  title: `Top ${TOP_SIZE} · Daily Bug`,
  description: `Las ${TOP_SIZE} curiosidades de videojuegos más votadas de Daily Bug.`,
};

export default async function Top() {
  const bugs = await getTopInsights();

  return (
    <main className={styles.main}>
      <h1 className={`${styles.heading} sign-float`}>Top {TOP_SIZE}</h1>
      <p className={styles.intro}>Los bugs más votados · me gusta menos no me gusta</p>
      {bugs.length > 0 ? (
        <TopList bugs={bugs} />
      ) : (
        <div className={shelfStyles.status}>
          <p className={shelfStyles.statusTitle}>Aún no hay votos</p>
          <p>Vota los bugs de la estantería con el pulgar y aquí aparecerán los favoritos.</p>
          <Link href="/bugs" className={shelfStyles.statusButton}>
            Ir a la estantería
          </Link>
        </div>
      )}
    </main>
  );
}
