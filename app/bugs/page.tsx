export const dynamic = 'force-dynamic';

import styles from '@/app/bugs/bugs.module.css';
import CustomTableRow from '../ui/bugs/CustomTableRow';
import prisma from '@/lib/prisma';

export default async function BugsList(){

  const bugs = await prisma.insight.findMany({
    orderBy: {
      id: "desc"
    }
  });

  return(
    <table className={`${styles.table} `}>
      <thead className='text-xl'>
        <tr>
          <th className={styles.th}>Fecha</th>
          <th className={styles.th}>Videojuego</th>
          <th className={styles.th}>Plataforma</th>
          <th className={styles.th}>Bug</th>
          <th className={styles.th}>Año</th>
        </tr>
      </thead>
      <tbody>
        {bugs
          ? bugs.map(bug => (
              <CustomTableRow
                key={bug.id}
                date={`${bug.day} de ${bug.month} de ${bug.year}`}
                game={bug.game}
                platform={bug.platform}
                bug={bug.data}
                bugYear={bug.bugYear}
              />
            ))
          : (<CustomTableRow
                date="Sin datos"
                game="Sin datos"
                platform="Sin datos"
                bug="Sin datos"
                bugYear={0}
              />)}
      </tbody>
    </table>
  )
}