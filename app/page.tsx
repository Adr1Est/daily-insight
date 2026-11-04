export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestInsights, isMockMode } from "@/lib/data";
import BoxCover from "@/app/ui/box/BoxCover";
import Spine from "@/app/ui/shelf/Spine";
import EmptyShelf from "@/app/ui/shelf/EmptyShelf";
import boxStyles from "@/app/ui/box/box.module.css";
import styles from "@/app/home.module.css";

export default async function Home() {
  const [today, ...previous] = await getLatestInsights(5);

  if(!today){
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
              {previous.map(bug => (
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
