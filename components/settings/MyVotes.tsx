"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/components/settings/settings.module.css";

interface MyVote {
  id: number;
  game: string;
  platform: string;
  bugYear: number;
  value: 1 | -1;
}

type Status = "loading" | "ready" | "error";

const PREVIEW = 10;
const CONFIRM_MS = 5000;

/** Los votos de este navegador y el botón para olvidarlos (borra los votos y la cookie). */
export default function MyVotes() {
  const [votes, setVotes] = useState<MyVote[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [showAll, setShowAll] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/votes", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { votes: MyVote[] }) => {
        setVotes(data.votes);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => {
      controller.abort();
      clearTimeout(confirmTimer.current);
    };
  }, []);

  // Doble pulsación para confirmar: la primera arma el botón durante unos segundos.
  async function forget() {
    if (!confirming) {
      setConfirming(true);
      setMessage("");
      confirmTimer.current = setTimeout(() => setConfirming(false), CONFIRM_MS);
      return;
    }
    clearTimeout(confirmTimer.current);
    setConfirming(false);
    try {
      const res = await fetch("/api/votes", { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      const { deleted }: { deleted: number } = await res.json();
      setVotes([]);
      setMessage(
        deleted === 1 ? "Hemos olvidado tu voto." : `Hemos olvidado tus ${deleted} votos.`,
      );
    } catch {
      setMessage("No se pudieron borrar tus votos. Prueba otra vez.");
    }
  }

  const ups = votes.filter((vote) => vote.value === 1).length;
  const shown = showAll ? votes : votes.slice(0, PREVIEW);

  return (
    <section className={styles.row} aria-labelledby="ajuste-votos" aria-busy={status === "loading"}>
      <div className={styles.label}>
        <h2 id="ajuste-votos">Mis votos</h2>
        <p>
          Se guardan con un identificador anónimo de este navegador. Olvidarlos borra los votos y
          ese identificador.
        </p>
      </div>

      <div className={styles.stack}>
        {status === "loading" && <p className={styles.note}>Buscando tus votos…</p>}
        {status === "error" && (
          <p className={styles.note}>No se pudieron cargar tus votos. Recarga la página.</p>
        )}
        {status === "ready" && votes.length === 0 && (
          <p className={styles.note}>
            {message || "Aún no has votado ningún bug."}{" "}
            <Link href="/bugs">Ir a la estantería</Link>
          </p>
        )}

        {votes.length > 0 && (
          <>
            <p className={styles.count}>
              Has votado {votes.length} {votes.length === 1 ? "bug" : "bugs"} · {ups} me gusta ·{" "}
              {votes.length - ups} no me gusta
            </p>
            <ul className={styles.votes}>
              {shown.map((vote) => (
                <li key={vote.id}>
                  <Link href={`/bugs#bug-${vote.id}`} className={styles.vote}>
                    <span className={styles.thumb}>
                      {vote.value === 1 ? (
                        <ThumbsUp size={20} aria-label="Me gusta" />
                      ) : (
                        <ThumbsDown size={20} aria-label="No me gusta" />
                      )}
                    </span>
                    <span className={styles.voteGame}>
                      <span className={styles.voteTitle}>{vote.game}</span>
                      <span className={styles.voteMeta}>
                        {vote.platform} · {vote.bugYear}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {votes.length > PREVIEW && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Ver menos" : `Ver los ${votes.length}`}
              </button>
            )}
            <button
              type="button"
              className={styles.button}
              data-armed={confirming || undefined}
              onClick={forget}
            >
              {confirming ? "¿Seguro? Pulsa otra vez" : "Olvidar mis votos"}
            </button>
            <p className={styles.note} role="status">
              {message}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
