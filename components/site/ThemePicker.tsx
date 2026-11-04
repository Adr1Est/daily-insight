"use client";

import { Palette } from "lucide-react";
import { useId, useRef, useState, useSyncExternalStore } from "react";

import styles from "@/components/site/site.module.css";
import { DEFAULT_THEME, engine, STORAGE_THEME, THEMES, type Theme } from "@/lib/themes";

// El tema activo vive en <html data-theme>, que fija el script de <head> antes del primer pintado.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const getTheme = () => document.documentElement.dataset.theme ?? DEFAULT_THEME;
const getServerTheme = () => DEFAULT_THEME;

/** Aplica el tema y lo guarda. Fuera del componente: es una escritura en el DOM, no estado de React. */
function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
  try {
    window.localStorage.setItem(STORAGE_THEME, id);
  } catch {
    /* sin almacenamiento: dura hasta recargar */
  }
}

const Swatch = ({ theme }: { theme: Theme }) => (
  <span className={styles.swatch} aria-hidden="true">
    <span style={{ background: theme.tokens.spine }} />
    <span style={{ background: theme.tokens.highlight }} />
    <span style={{ background: theme.tokens.sticker }} />
  </span>
);

export default function ThemePicker() {
  const current = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  // Los temas disponibles dependen de la fecha del visitante: se calculan al abrir, solo en el cliente.
  const [available, setAvailable] = useState<Theme[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const currentTheme = THEMES.find((theme) => theme.id === current) ?? THEMES[0];

  const onBeforeToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    if (event.newState !== "open") return;
    const ids = engine.available(new Date());
    setAvailable(THEMES.filter((theme) => ids.includes(theme.id)));
    // El panel vive en la capa superior: se coloca bajo el botón, alineado a su borde derecho.
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect && panelRef.current) {
      panelRef.current.style.top = `${rect.bottom + 8}px`;
      panelRef.current.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;
    }
  };

  const choose = (id: string) => {
    applyTheme(id);
    panelRef.current?.hidePopover();
    buttonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.themeButton}
        popoverTarget={panelId}
        aria-label={`Tema: ${currentTheme.name}. Cambiar tema`}
      >
        <Palette size={18} aria-hidden="true" />
        <span>Tema</span>
        <Swatch theme={currentTheme} />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        className={styles.themePanel}
        onBeforeToggle={onBeforeToggle}
      >
        <fieldset className={styles.themeList}>
          <legend className={styles.themeLegend}>Tema de la estantería</legend>
          {available.map((theme) => (
            <label key={theme.id} className={styles.themeOption}>
              <input
                type="radio"
                name="tema"
                value={theme.id}
                checked={theme.id === current}
                onChange={() => choose(theme.id)}
              />
              <Swatch theme={theme} />
              <span className={styles.themeName}>{theme.name}</span>
              {theme.season && <span className={styles.themeNew}>Nuevo</span>}
            </label>
          ))}
        </fieldset>
      </div>
    </>
  );
}
