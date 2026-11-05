"use client";

import { useSyncExternalStore } from "react";

import styles from "@/components/site/site.module.css";
import { DEFAULT_THEME, STORAGE_THEME, THEMES, type Theme } from "@/lib/themes";

// El tema activo vive en <html data-theme>, que fija el script de <head> antes del primer pintado.
// El selector de la cabecera y /ajustes lo leen de ahí, así que siempre están de acuerdo.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const getTheme = () => document.documentElement.dataset.theme ?? DEFAULT_THEME;
const getServerTheme = () => DEFAULT_THEME;

/** El id del tema activo, al día con cualquier cambio. */
export const useCurrentTheme = () => useSyncExternalStore(subscribe, getTheme, getServerTheme);

export const findTheme = (id: string): Theme =>
  THEMES.find((theme) => theme.id === id) ?? THEMES[0];

/** Aplica el tema y lo guarda. Es una escritura en el DOM, no estado de React. */
export function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
  try {
    window.localStorage.setItem(STORAGE_THEME, id);
  } catch {
    /* sin almacenamiento: dura hasta recargar */
  }
}

/** Muestra de tres colores del tema (lomo, amarillo, pegatina). */
export const Swatch = ({ theme }: { theme: Theme }) => (
  <span className={styles.swatch} aria-hidden="true">
    <span style={{ background: theme.tokens.spine }} />
    <span style={{ background: theme.tokens.highlight }} />
    <span style={{ background: theme.tokens.sticker }} />
  </span>
);
