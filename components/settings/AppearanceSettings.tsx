"use client";

import { useState, useSyncExternalStore } from "react";

import boxStyles from "@/components/box/box.module.css";
import OptionGroup from "@/components/settings/OptionGroup";
import styles from "@/components/settings/settings.module.css";
import { applyTheme, Swatch, useCurrentTheme } from "@/components/site/themeClient";
import {
  DEFAULT_MOTION,
  DEFAULT_TEXT_SIZE,
  MOTION_OPTIONS,
  STORAGE_MOTION,
  STORAGE_TEXT_SIZE,
  TEXT_SIZE_OPTIONS,
} from "@/lib/prefs";
import {
  DEFAULT_THEME,
  engine,
  STORAGE_SEASONAL,
  STORAGE_THEME,
  THEMES,
  type Theme,
} from "@/lib/themes";

// data-motion y data-text-size viven en <html> (los fija el script de <head>): se leen de ahí,
// así cualquier cambio se ve a la vez en toda la página sin estado global.
const subscribeHtml = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion", "data-text-size"],
  });
  return () => observer.disconnect();
};

const useHtmlAttr = (attr: "motion" | "textSize", fallback: string) =>
  useSyncExternalStore(
    subscribeHtml,
    () => document.documentElement.dataset[attr] ?? fallback,
    () => fallback,
  );

function save(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: dura hasta recargar */
  }
}

function readSeasonal(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_SEASONAL) !== "off";
  } catch {
    return true;
  }
}

// La opción de temporadas solo vive en localStorage: un almacén mínimo que avisa al cambiarla.
const seasonalListeners = new Set<() => void>();
const subscribeSeasonal = (onChange: () => void) => {
  seasonalListeners.add(onChange);
  return () => void seasonalListeners.delete(onChange);
};
function saveSeasonal(on: boolean) {
  save(STORAGE_SEASONAL, on ? null : "off");
  seasonalListeners.forEach((listener) => listener());
}

// Los temas disponibles dependen de la fecha del visitante: en el servidor, solo los de todo el año.
const SERVER_THEME_IDS = THEMES.filter((t) => !t.season)
  .map((t) => t.id)
  .join(",");
const noSubscribe = () => () => {};
const availableThemeIds = () => engine.available(new Date()).join(",");

const SEASONAL_OPTIONS = [
  { value: "on", label: "Automáticos" },
  { value: "off", label: "Solo si los elijo" },
];

const SAMPLE =
  "Al llegar al nivel 256, el contador de fases se desborda y la mitad derecha del laberinto se llena de símbolos sin sentido.";

/** Tema, temporadas, movimiento y tamaño del texto: preferencias de este navegador. */
export default function AppearanceSettings() {
  const theme = useCurrentTheme();
  const motion = useHtmlAttr("motion", DEFAULT_MOTION);
  const textSize = useHtmlAttr("textSize", DEFAULT_TEXT_SIZE);
  const seasonal = useSyncExternalStore(subscribeSeasonal, readSeasonal, () => true);
  const ids = useSyncExternalStore(noSubscribe, availableThemeIds, () => SERVER_THEME_IDS);
  const available: Theme[] = THEMES.filter((t) => ids.split(",").includes(t.id));
  const [resetDone, setResetDone] = useState(false);

  const setMotion = (value: string) => {
    document.documentElement.dataset.motion = value;
    save(STORAGE_MOTION, value === DEFAULT_MOTION ? null : value);
    setResetDone(false);
  };

  const setTextSize = (value: string) => {
    document.documentElement.dataset.textSize = value;
    save(STORAGE_TEXT_SIZE, value === DEFAULT_TEXT_SIZE ? null : value);
    setResetDone(false);
  };

  const chooseSeasonal = (value: string) => {
    saveSeasonal(value === "on");
    setResetDone(false);
  };

  // De fábrica: tema por defecto, temporadas automáticas, movimiento y texto por defecto.
  // Las temporadas ya vistas se conservan: son historial, no una preferencia.
  const reset = () => {
    applyTheme(DEFAULT_THEME);
    save(STORAGE_THEME, null);
    setMotion(DEFAULT_MOTION);
    setTextSize(DEFAULT_TEXT_SIZE);
    chooseSeasonal("on");
    setResetDone(true);
  };

  return (
    <>
      <section className={styles.row} aria-labelledby="ajuste-tema">
        <div className={styles.label}>
          <h2 id="ajuste-tema">Tema</h2>
          <p>También en el botón «Tema» de la cabecera.</p>
        </div>
        <OptionGroup
          name="tema"
          labelledBy="ajuste-tema"
          layout="list"
          value={theme}
          onChange={(value) => {
            applyTheme(value);
            setResetDone(false);
          }}
          options={available.map((t) => ({
            value: t.id,
            label: t.name,
            before: <Swatch theme={t} />,
          }))}
        />
      </section>

      <section className={styles.row} aria-labelledby="ajuste-temporada">
        <div className={styles.label}>
          <h2 id="ajuste-temporada">Temas de temporada</h2>
          <p>Halloween y Navidad se ponen solos la primera vez que entras en su temporada.</p>
        </div>
        <OptionGroup
          name="temporada"
          labelledBy="ajuste-temporada"
          options={SEASONAL_OPTIONS}
          value={seasonal ? "on" : "off"}
          onChange={chooseSeasonal}
        />
      </section>

      <section className={styles.row} aria-labelledby="ajuste-movimiento">
        <div className={styles.label}>
          <h2 id="ajuste-movimiento">Rótulos flotantes</h2>
          <p>Automático sigue la opción de reducir movimiento de tu sistema.</p>
        </div>
        <div className={styles.stack}>
          <OptionGroup
            name="movimiento"
            labelledBy="ajuste-movimiento"
            options={MOTION_OPTIONS}
            value={motion}
            onChange={setMotion}
          />
          <p className={styles.sample} aria-hidden="true">
            <span className={`${styles.sign} sign-float`}>Daily Bug</span>
          </p>
        </div>
      </section>

      <section className={styles.row} aria-labelledby="ajuste-texto">
        <div className={styles.label}>
          <h2 id="ajuste-texto">Texto del bug</h2>
          <p>El tamaño del texto en la contraportada de las cajas.</p>
        </div>
        <div className={styles.stack}>
          <OptionGroup
            name="texto"
            labelledBy="ajuste-texto"
            options={TEXT_SIZE_OPTIONS}
            value={textSize}
            onChange={setTextSize}
          />
          <p className={`${boxStyles.text} ${styles.sample}`}>{SAMPLE}</p>
        </div>
      </section>

      <section className={styles.row} aria-labelledby="ajuste-restablecer">
        <div className={styles.label}>
          <h2 id="ajuste-restablecer">Restablecer</h2>
          <p>Vuelve al tema Videoclub y a los valores por defecto. No toca tus votos.</p>
        </div>
        <div className={styles.stack}>
          <button type="button" className={styles.button} onClick={reset}>
            Restablecer ajustes
          </button>
          <p className={styles.note} role="status">
            {resetDone ? "Ajustes restablecidos." : ""}
          </p>
        </div>
      </section>
    </>
  );
}
