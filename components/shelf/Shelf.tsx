"use client";

import { Search, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import boxStyles from "@/components/box/box.module.css";
import BoxCover from "@/components/box/BoxCover";
import styles from "@/components/shelf/shelf.module.css";
import Spine from "@/components/shelf/Spine";
import type { InsightsPage } from "@/lib/pagination";
import type { BugType } from "@/types/bug";

const PULLED_ID = "caja-abierta";
const SEARCH_DELAY_MS = 300;

const idFromHash = (hash: string): number | null => {
  const match = /^#bug-(\d+)$/.exec(hash);
  return match ? Number(match[1]) : null;
};

/** Pide una página a /api/bugs. Lanza si la respuesta no es correcta (incluido el aborto). */
async function fetchPage(
  params: { q?: string; cursor?: number },
  signal?: AbortSignal,
): Promise<InsightsPage> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.cursor) search.set("cursor", String(params.cursor));
  const response = await fetch(`/api/bugs?${search}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

interface ShelfPage extends InsightsPage {
  /** Búsqueda a la que corresponde la página («» = todo el archivo). */
  q: string;
}

type Status = "idle" | "searching" | "loading-more" | "error";

export default function Shelf({
  initialPage,
  isSample = false,
}: {
  initialPage: InsightsPage;
  isSample?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<ShelfPage>({ ...initialPage, q: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Caja abierta por enlace (#bug-N) que no está entre las cargadas.
  const [linkedBug, setLinkedBug] = useState<BugType | null>(null);

  const pulledRef = useRef<HTMLElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const request = useRef<AbortController | null>(null);
  const latestId = initialPage.items[0]?.id;
  const initialIds = useRef(new Set(initialPage.items.map((bug) => bug.id)));

  // Los lomos de la portada enlazan a /bugs#bug-N: esa caja llega ya abierta, aunque no esté cargada.
  useEffect(() => {
    const syncFromHash = () => {
      const id = idFromHash(window.location.hash);
      setSelectedId(id);
      if (id === null || initialIds.current.has(id)) return;
      fetch(`/api/bugs/${id}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((bug: BugType | null) => setLinkedBug(bug))
        .catch(() => setLinkedBug(null));
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selected =
    page.items.find((bug) => bug.id === selectedId) ??
    (linkedBug?.id === selectedId ? linkedBug : undefined);

  // Al sacar una caja, se lleva la vista y el foco a ella.
  useEffect(() => {
    if (!selected) return;
    pulledRef.current?.scrollIntoView({ block: "start" });
    pulledRef.current?.focus({ preventScroll: true });
  }, [selected]);

  /** Busca en la base de datos (paginado). Sin texto, vuelve a la primera página del archivo. */
  const runSearch = async (q: string) => {
    request.current?.abort();
    if (!q) {
      setPage({ ...initialPage, q: "" });
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setStatus("searching");
    try {
      const result = await fetchPage({ q }, controller.signal);
      setPage({ ...result, q });
      setStatus("idle");
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  };

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(value.trim()), SEARCH_DELAY_MS);
  };

  const clearSearch = () => {
    clearTimeout(searchTimer.current);
    setQuery("");
    runSearch("");
  };

  const loadMore = async () => {
    if (page.nextCursor === null) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setStatus("loading-more");
    try {
      const result = await fetchPage({ q: page.q, cursor: page.nextCursor }, controller.signal);
      setPage((current) => {
        const known = new Set(current.items.map((bug) => bug.id));
        return {
          ...result,
          q: current.q,
          items: [...current.items, ...result.items.filter((bug) => !known.has(bug.id))],
        };
      });
      setStatus("idle");
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  };

  const retry = () => (page.q !== query.trim() ? runSearch(query.trim()) : loadMore());

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

  const remaining = page.matching - page.items.length;
  const countText =
    status === "searching"
      ? "Buscando…"
      : page.q
        ? `${page.matching} de ${page.total} cajas coinciden`
        : `${page.items.length} de ${page.total} cajas`;

  return (
    <>
      <search className={styles.search}>
        <label htmlFor="buscar" className={styles.searchLabel}>
          Buscar en la estantería
        </label>
        <div className={styles.searchField}>
          <Search size={20} aria-hidden="true" />
          <input
            id="buscar"
            type="search"
            className={styles.searchInput}
            placeholder="Juego, plataforma, año o texto"
            value={query}
            onChange={onQueryChange}
            autoComplete="off"
            maxLength={100}
          />
        </div>
        <p className={styles.searchCount} aria-live="polite">
          {countText}
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

      {page.items.length > 0 ? (
        <ul
          className={styles.rack}
          aria-label="Cajas de la estantería"
          aria-busy={status !== "idle" && status !== "error"}
        >
          {page.items.map((bug) => (
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
        status !== "searching" &&
        status !== "error" && (
          <div className={styles.status}>
            <p className={styles.statusTitle}>Ninguna caja coincide con «{page.q}»</p>
            <p>Prueba con el nombre de un juego, una consola o un año.</p>
            <button type="button" className={styles.statusButton} onClick={clearSearch}>
              Ver todas las cajas
            </button>
          </div>
        )
      )}

      {status === "error" ? (
        <div className={styles.status} role="alert">
          <p className={styles.statusTitle}>No se pudieron cargar las cajas</p>
          <p>Ha fallado la conexión con el almacén de bugs. Vuelve a intentarlo.</p>
          <button type="button" className={styles.statusButton} onClick={retry}>
            Reintentar
          </button>
        </div>
      ) : (
        page.nextCursor !== null && (
          <div className={styles.more}>
            <button
              type="button"
              className={styles.statusButton}
              onClick={loadMore}
              disabled={status === "loading-more"}
            >
              {status === "loading-more" ? "Cargando…" : "Cargar más cajas"}
            </button>
            <p className={styles.moreCount}>Quedan {remaining} en el almacén</p>
          </div>
        )
      )}
    </>
  );
}
