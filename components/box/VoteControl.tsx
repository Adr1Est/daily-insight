"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "@/components/box/box.module.css";

type VoteValue = -1 | 0 | 1;

interface VoteControlProps {
  bugId: number;
  /** Puntuación de la página estática; se refresca al montar con la de la API. */
  initialScore: number;
}

/** +12, −3, 0: con signo, como un marcador. */
const formatScore = (score: number) =>
  score > 0 ? `+${score}` : score < 0 ? `−${Math.abs(score)}` : "0";

/** Valoración de la caja: me gusta, puntuación (me gusta − no me gusta) y no me gusta. */
export default function VoteControl({ bugId, initialScore }: VoteControlProps) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<VoteValue>(0);
  const pending = useRef(false);

  // La página es estática: la puntuación al día y el voto propio se piden aparte.
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/bugs/${bugId}/vote`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((state: { score: number; myVote: VoteValue } | null) => {
        if (!state) return;
        setScore(state.score);
        setMyVote(state.myVote);
      })
      .catch(() => {}); // sin red se queda la puntuación de la página
    return () => controller.abort();
  }, [bugId]);

  async function vote(value: 1 | -1) {
    if (pending.current) return;
    pending.current = true;

    // Pulsar el pulgar ya marcado quita el voto. Se pinta al instante y se revierte si falla.
    const next: VoteValue = myVote === value ? 0 : value;
    const previous = { score, myVote };
    setScore(score + next - myVote);
    setMyVote(next);

    try {
      const res = await fetch(`/api/bugs/${bugId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const state: { score: number; myVote: VoteValue } = await res.json();
      setScore(state.score);
      setMyVote(state.myVote);
    } catch {
      setScore(previous.score);
      setMyVote(previous.myVote);
    } finally {
      pending.current = false;
    }
  }

  return (
    <div className={styles.vote} role="group" aria-label="Valoración del bug">
      <button
        type="button"
        className={styles.voteButton}
        aria-label="Me gusta"
        aria-pressed={myVote === 1}
        onClick={() => vote(1)}
      >
        <ThumbsUp size={24} aria-hidden="true" />
      </button>
      <output
        className={styles.voteScore}
        data-sign={score > 0 ? "positive" : score < 0 ? "negative" : undefined}
        aria-live="polite"
      >
        <span aria-hidden="true">{formatScore(score)}</span>
        <span className={styles.srOnly}>Puntuación: {score}</span>
      </output>
      <button
        type="button"
        className={styles.voteButton}
        aria-label="No me gusta"
        aria-pressed={myVote === -1}
        onClick={() => vote(-1)}
      >
        <ThumbsDown size={24} aria-hidden="true" />
      </button>
    </div>
  );
}
