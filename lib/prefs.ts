// Preferencias del visitante (página /ajustes), guardadas en su navegador. Como el tema, se aplican
// en <html> antes del primer pintado con el script de <head> (prefsInitScript), sin parpadeo.
// El tema y la opción de temporadas viven en lib/themes.ts.

export const STORAGE_MOTION = "daily-bug:motion";
export const STORAGE_TEXT_SIZE = "daily-bug:text-size";

/** Rótulos flotantes: auto sigue `prefers-reduced-motion`; on y off lo fuerzan. */
export const MOTION_OPTIONS = [
  { value: "auto", label: "Automático" },
  { value: "on", label: "Siempre" },
  { value: "off", label: "Nunca" },
] as const;

/** Tamaño del texto del bug en la contraportada (escala en app/globals.css). */
export const TEXT_SIZE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
  { value: "xl", label: "Muy grande" },
] as const;

export type Motion = (typeof MOTION_OPTIONS)[number]["value"];
export type TextSize = (typeof TEXT_SIZE_OPTIONS)[number]["value"];

export const DEFAULT_MOTION: Motion = "auto";
export const DEFAULT_TEXT_SIZE: TextSize = "normal";

/** Cada preferencia: su clave, el atributo `data-*` de <html> y sus valores válidos. */
export const PREFS = [
  {
    key: STORAGE_MOTION,
    attr: "motion",
    values: MOTION_OPTIONS.map((o) => o.value) as string[],
    fallback: DEFAULT_MOTION as string,
  },
  {
    key: STORAGE_TEXT_SIZE,
    attr: "textSize",
    values: TEXT_SIZE_OPTIONS.map((o) => o.value) as string[],
    fallback: DEFAULT_TEXT_SIZE as string,
  },
];

/** Script de <head>: fija data-motion y data-text-size con lo guardado (o los valores por defecto). */
export function prefsInitScript(): string {
  return `(function(){var P=${JSON.stringify(PREFS)},ls=null;
try{ls=window.localStorage;}catch(e){}
for(var i=0;i<P.length;i++){var v=null;try{v=ls&&ls.getItem(P[i].key);}catch(e){}
document.documentElement.dataset[P[i].attr]=P[i].values.indexOf(v)===-1?P[i].fallback:v;}})();`;
}
