import styles from '@/app/ui/bugs/CustomTableRox.module.css'

interface Bug {
  date: string;
  game: string;
  platform: string;
  bug: string;
  bugYear: number;
}

export default function CustomTableRow({date, game, platform, bug, bugYear}: Bug){
  return(
    <tr>
      <td className={styles.td}>{date}</td>
      <td className={styles.td}>{game}</td>
      <td className={styles.td}>{platform}</td>
      <td className={styles.td}>{bug}</td>
      <td className={styles.td}>{bugYear}</td>
    </tr>
  )
}