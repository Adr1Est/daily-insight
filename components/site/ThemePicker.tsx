"use client";

import { Palette } from "lucide-react";
import { useId, useRef, useState } from "react";

import styles from "@/components/site/site.module.css";
import { applyTheme, findTheme, Swatch, useCurrentTheme } from "@/components/site/themeClient";
import { engine, THEMES, type Theme } from "@/lib/themes";

export default function ThemePicker() {
  const current = useCurrentTheme();
  // Los temas disponibles dependen de la fecha del visitante: se calculan al abrir, solo en el cliente.
  const [available, setAvailable] = useState<Theme[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const currentTheme = findTheme(current);

  const onBeforeToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    if (event.newState !== "open") return;
    const ids = engine.available(new Date());
    setAvailable(THEMES.filter((theme) => ids.includes(theme.id)));
    // El panel vive en la capa superior: se coloca bajo el botón. Si el botón está en la mitad
    // derecha (escritorio) se alinea a su borde derecho; si está a la izquierda (móvil, donde la
    // cabecera se apila), a su borde izquierdo, para que no se salga de la pantalla.
    const rect = buttonRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (rect && panel) {
      // Separaciones en el módulo --u del sistema (8 px), leído del CSS.
      const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u")) || 8;
      const gutter = u * 2;
      const top = rect.bottom + u;
      panel.style.top = `${top}px`;
      panel.style.maxHeight = `${window.innerHeight - top - gutter}px`;
      if (rect.left + rect.width / 2 < window.innerWidth / 2) {
        panel.style.left = `${Math.max(gutter, rect.left)}px`;
        panel.style.right = "auto";
      } else {
        panel.style.right = `${Math.max(gutter, window.innerWidth - rect.right)}px`;
        panel.style.left = "auto";
      }
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
