import { ArrowRight } from "lucide-react";
import Link from "next/link";

import styles from "@/app/home.module.css";
import boxStyles from "@/components/box/box.module.css";
import BoxCover from "@/components/box/BoxCover";
import EmptyShelf from "@/components/shelf/EmptyShelf";
import Spine from "@/components/shelf/Spine";
import { getLatestInsights, isMockMode } from "@/lib/data";

// Los datos cambian una vez al día: página estática que el cron invalida al publicar (y cada hora como red de seguridad).
export const revalidate = 3600;

export default async function Home() {
  const [today, ...previous] = await getLatestInsights(5);

  if (!today) {
    return (
      <main className={styles.main}>
        <EmptyShelf />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.stage}>
        <BoxCover
          bug={today}
          isToday
          isSample={isMockMode()}
          headingId="bug-de-hoy"
          action={
            <Link href="/bugs" className={boxStyles.action}>
              Ver toda la estantería <ArrowRight size={20} aria-hidden="true" />
            </Link>
          }
        />

        {previous.length > 0 && (
          <nav className={styles.peek} aria-label="Bugs anteriores">
            <ul>
              {previous.map((bug) => (
                <li key={bug.id}>
                  <Spine bug={bug} href={`/bugs#bug-${bug.id}`} />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className={styles.shelf} aria-hidden="true" />
    </main>
  );
}
