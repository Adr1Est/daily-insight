'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { BugType } from "@/app/types/bug.types";
import BoxCover from "@/app/ui/box/BoxCover";
import Spine from "@/app/ui/shelf/Spine";
import boxStyles from "@/app/ui/box/box.module.css";
import styles from "@/app/ui/shelf/shelf.module.css";

const PULLED_ID = "caja-abierta";

const idFromHash = (hash: string): number | null => {
  const match = /^#bug-(\d+)$/.exec(hash);
  return match ? Number(match[1]) : null;
};

export default function Shelf({ bugs, isSample = false }: { bugs: BugType[]; isSample?: boolean }){

  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const pulledRef = useRef<HTMLElement>(null);
  const latestId = bugs[0]?.id;

  // Los lomos de la portada enlazan a /bugs#bug-N: esa caja llega ya abierta.
  useEffect(() => {
    const syncFromHash = () => setSelectedId(idFromHash(window.location.hash));
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selected = bugs.find(bug => bug.id === selectedId);

  // Al sacar una caja, se lleva la vista y el foco a ella.
  useEffect(() => {
    if(selectedId === null) return;
    pulledRef.current?.scrollIntoView({ block: "start" });
    pulledRef.current?.focus({ preventScroll: true });
  }, [selectedId]);

  const filteredBugs = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if(!query) return bugs;
    return bugs.filter(bug =>
      bug.game.toLowerCase().includes(query) ||
      bug.data.toLowerCase().includes(query) ||
      bug.platform.toLowerCase().includes(query) ||
      String(bug.bugYear).includes(query)
    );
  }, [filter, bugs]);

  const open = (id: number) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#bug-${id}`);
  };

  const close = () => {
    const id = selectedId;
    setSelectedId(null);
    window.history.replaceState(null, "", window.location.pathname);
    document.getElementById(`lomo-${id}`)?.focus();
  };

  return(
    <>
      <search className={styles.search}>
        <label htmlFor="buscar" className={styles.searchLabel}>Buscar en la estantería</label>
        <div className={styles.searchField}>
          <Search size={20} aria-hidden="true" />
          <input
            id="buscar"
            type="search"
            className={styles.searchInput}
            placeholder="Juego, plataforma, año o texto"
            value={filter}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFilter(event.target.value)}
            autoComplete="off"
          />
        </div>
        <p className={styles.searchCount} aria-live="polite">
          {filter.trim()
            ? `${filteredBugs.length} de ${bugs.length} cajas`
            : `${bugs.length} cajas`}
        </p>
      </search>

      {selected && (
        <section
          ref={pulledRef}
          id={PULLED_ID}
          className={styles.pulled}
          tabIndex={-1}
          aria-label={`Caja abierta: ${selected.game}`}
        >
          <BoxCover
            bug={selected}
            isToday={selected.id === latestId}
            isSample={isSample}
            headingLevel="h2"
            action={
              <button type="button" className={boxStyles.action} onClick={close}>
                <X size={20} aria-hidden="true" /> Devolver a la estantería
              </button>
            }
          />
        </section>
      )}

      {filteredBugs.length > 0 ? (
        <ul className={styles.rack} aria-label="Cajas de la estantería">
          {filteredBugs.map(bug => (
            <li key={bug.id}>
              <Spine
                bug={bug}
                id={`lomo-${bug.id}`}
                isToday={bug.id === latestId}
                isOut={bug.id === selectedId}
                controls={PULLED_ID}
                onOpen={() => (bug.id === selectedId ? close() : open(bug.id))}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.status}>
          <p className={styles.statusTitle}>Ninguna caja coincide con «{filter.trim()}»</p>
          <p>Prueba con el nombre de un juego, una consola o un año.</p>
          <button type="button" className={styles.statusButton} onClick={() => setFilter("")}>
            Ver todas las cajas
          </button>
        </div>
      )}
    </>
  )
}
