'use client';

import styles from '@/app/bugs/bugs.module.css';
import CustomTableRow from '../ui/bugs/CustomTableRow';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { BugType } from '@/app/types/bug.types';

export default function BugsList(){

  const [bugList, setBugList] = useState<BugType[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilter(value);
    console.log(value);
  }

  const filteredBugList = useMemo(() => {
    if(!filter) return bugList;
    return bugList.filter(bug => bug.game.toLowerCase().includes(filter.toLowerCase()) ||
      bug.data.toLowerCase().includes(filter.toLowerCase()) ||
      bug.platform.toLowerCase().includes(filter.toLowerCase()) ||
      String(bug.bugYear).includes(String(filter))
    );
  }, [filter, bugList]);

  useEffect(() => {
    fetch('/api/getBugs')
      .then(response => {
        if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => setBugList(data))
      .catch(error => {
        console.error(`Error al cargar bugList: ${error}`);
        setError(error);
      });
  }, []);

  return(
    <div className='relative'>

      <input 
        type="text" 
        id="searchFilterInput" 
        className='w-full border mb-1 p-1 sticky top-0 bg-emerald-950' 
        placeholder='Busca tu bug favorito...' 
        onChange={handleFilter}
        value={filter}
      />

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
          {filteredBugList.length !== 0 && !error
            ? filteredBugList.map((bug: BugType) => (
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
                />)
          }
        </tbody>
      </table>
    </div>
  )
}