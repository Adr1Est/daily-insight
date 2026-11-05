// Datos de la app instalable (PWA). Fuente única para app/manifest.ts, app/layout.tsx y los
// iconos de app/pwa-icon. Los colores salen del tema por defecto: nada de literales.
import { DEFAULT_THEME, THEMES } from "@/lib/themes";

const tokens = (THEMES.find((theme) => theme.id === DEFAULT_THEME) ?? THEMES[0]).tokens;

export const APP_NAME = "Daily Bug";
export const APP_DESCRIPTION =
  "Cada día, una curiosidad de la historia de los videojuegos: bugs, secretos, desarrollo, contenido descartado y localización.";

/** Color de la barra del sistema: el de la cabecera (`--spine`). */
export const THEME_COLOR = tokens.spine;
/** Fondo de la pantalla de arranque: la pared de la estantería. */
export const BACKGROUND_COLOR = tokens.wall;

/** Iconos del manifest, generados por app/pwa-icon/[variant]/route.tsx a partir de app/icon.svg. */
export const PWA_ICONS = {
  "192": { size: 192, maskable: false },
  "512": { size: 512, maskable: false },
  maskable: { size: 512, maskable: true },
} as const;
export type PwaIconVariant = keyof typeof PWA_ICONS;

/** Evento propio que avisa a `InstallApp` de que cambió la posibilidad de instalar. */
export const INSTALL_EVENT = "daily-bug:installable";

/**
 * Script de <head>: guarda `beforeinstallprompt` en `window.__dbInstall`. Chrome puede lanzarlo
 * antes de hidratar, así que no basta con escucharlo desde React. `preventDefault` quita la
 * barra automática de Chrome en móvil: se instala desde el panel lateral.
 */
export function installPromptScript(): string {
  const notify = `window.dispatchEvent(new Event(${JSON.stringify(INSTALL_EVENT)}))`;
  return `window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__dbInstall=e;${notify}});window.addEventListener("appinstalled",function(){window.__dbInstall=null;${notify}});`;
}
