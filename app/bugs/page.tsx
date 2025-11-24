import styles from '@/app/bugs/bugs.module.css'
import CustomTableRow from '../ui/bugs/CustomTableRow'

export default function BugsList(){
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
        <CustomTableRow
          date="21 de noviembre de 2025"
          game="Pokemon"
          platform='Game Boy'
          bug="El glitch MissingNo. en Pokémon Rojo/Azul permite duplicar objetos del inventario al encontrar a MissingNo. tras el truco del Viejo y Surf en la costa, causando corrupción de datos y efectos variados."
          bugYear={1986}
        />
      </tbody>
      
    </table>
  )
}