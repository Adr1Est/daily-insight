"use client";

import { Download } from "lucide-react";
import { useId, useState, useSyncExternalStore } from "react";

import styles from "@/components/site/site.module.css";
import { INSTALL_EVENT } from "@/lib/pwa";

/** `beforeinstallprompt` (solo Chromium); no está en los tipos del DOM. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /** Lo guarda `installPromptScript()` (lib/pwa.ts) desde <head>. */
    __dbInstall?: BeforeInstallPromptEvent | null;
  }
  interface Navigator {
    /** Safari en iOS: true si se abre desde la pantalla de inicio. */
    standalone?: boolean;
  }
}

type InstallState = "none" | "prompt" | "ios";

const STANDALONE = "(display-mode: standalone)";
/** Solo en móvil y tablet: con ratón (escritorio) no se ofrece. */
const TOUCH = "(pointer: coarse)";

const subscribe = (onChange: () => void) => {
  const media = [STANDALONE, TOUCH].map((query) => window.matchMedia(query));
  window.addEventListener(INSTALL_EVENT, onChange);
  media.forEach((m) => m.addEventListener("change", onChange));
  return () => {
    window.removeEventListener(INSTALL_EVENT, onChange);
    media.forEach((m) => m.removeEventListener("change", onChange));
  };
};

function getState(): InstallState {
  if (!window.matchMedia(TOUCH).matches) return "none";
  if (window.matchMedia(STANDALONE).matches || navigator.standalone) return "none";
  if (window.__dbInstall) return "prompt";
  // iOS no tiene botón de instalar: se hace a mano desde Compartir (iPadOS se presenta como Mac).
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "none";
}

// «Instalar app» del panel lateral. No se pinta en escritorio, si ya está instalada o si el
// navegador no permite instalarla.
export default function InstallApp() {
  const state = useSyncExternalStore(subscribe, getState, () => "none" as const);
  const [showHint, setShowHint] = useState(false);
  const hintId = useId();

  if (state === "none") return null;

  async function install() {
    if (state === "ios") {
      setShowHint((shown) => !shown);
      return;
    }
    const event = window.__dbInstall;
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    // El evento solo sirve una vez; Chrome lanza otro si vuelve a ser instalable.
    window.__dbInstall = null;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  }

  return (
    <div className={styles.drawerInstall}>
      <button
        type="button"
        className={styles.installButton}
        onClick={install}
        aria-expanded={state === "ios" ? showHint : undefined}
        aria-controls={state === "ios" ? hintId : undefined}
      >
        <Download size={20} aria-hidden="true" />
        Instalar app
      </button>
      {state === "ios" && (
        <p id={hintId} className={styles.installHint} hidden={!showHint}>
          En Safari, pulsa Compartir y luego «Añadir a pantalla de inicio».
        </p>
      )}
    </div>
  );
}
