// Temas de Daily Bug: paletas, ambiente y reglas de temporada. Fuente única para:
// - app/layout.tsx (themeCss + themeInitScript, antes del primer pintado),
// - components/site/ThemePicker.tsx (selector),
// - lib/themes.test.ts (fechas y contraste).

export type ThemeId =
  "videoclub" | "oscuro" | "neon" | "lcd" | "vaporwave" | "byn" | "halloween" | "navidad";

interface MonthDay {
  m: number;
  d: number;
}
export interface Season {
  start: MonthDay;
  end: MonthDay;
}

/** Roles de color que consume la UI. Ningún componente usa colores literales. */
export interface ThemeTokens {
  wall: string;
  "wall-slat": string;
  "wall-ink": string;
  "wall-ink-soft": string;
  shelf: string;
  "shelf-edge": string;
  card: string;
  "card-ink": string;
  "card-ink-soft": string;
  spine: string;
  highlight: string;
  "on-highlight": string;
  sticker: string;
  "on-sticker": string;
  band: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  season?: Season;
  tokens: ThemeTokens;
  /** Ambiente: brillo, capa sobre la pared y sombras propias. */
  extra?: Record<string, string>;
}

export const STORAGE_THEME = "daily-bug:theme";
export const STORAGE_SEEN = "daily-bug:seasons-seen";
/** "off" = no aplicar solos los temas de temporada (ajustes). Ausente = sí. */
export const STORAGE_SEASONAL = "daily-bug:seasonal";

const svg = (body: string, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${body}</svg>`)}")`;

/** Telaraña de esquina dibujada a mano: radios desde la esquina e hilos que cuelgan entre ellos. */
function cobweb(corner: "left" | "right"): string {
  const size = 240;
  const spokes = [0, 15, 32, 50, 68, 90].map((deg) => (deg * Math.PI) / 180);
  const point = (r: number, a: number) => {
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    return [corner === "left" ? x : size - x, y].map((v) => v.toFixed(1)).join(",");
  };
  const lines = spokes.map((a) => `<path d='M${point(0, a)} L${point(size, a)}'/>`).join("");
  const rings = [44, 86, 130, 176, 224]
    .map(
      (r) =>
        `<path d='M${point(r, spokes[0])} ${spokes
          .slice(1)
          .map((a, i) => `Q${point(r * 0.86, (a + spokes[i]) / 2)} ${point(r, a)}`)
          .join(" ")}'/>`,
    )
    .join("");
  return `${svg(`<g fill='none' stroke='rgb(243 230 207 / 0.22)' stroke-width='1.2'>${lines}${rings}</g>`, size)} ${corner} top / ${size}px ${size}px no-repeat`;
}

export const THEMES: Theme[] = [
  {
    id: "videoclub",
    name: "Videoclub",
    tokens: {
      wall: "#1d1b19",
      "wall-slat": "#252220",
      "wall-ink": "#f2efe6",
      "wall-ink-soft": "#bdb6a8",
      shelf: "#4a3422",
      "shelf-edge": "#6b4a2e",
      card: "#f2efe6",
      "card-ink": "#141414",
      "card-ink-soft": "#4a463f",
      spine: "#141414",
      highlight: "#ffd23f",
      "on-highlight": "#141414",
      sticker: "#d1281b",
      "on-sticker": "#ffffff",
      band: "#2ec4d6",
    },
    // Sombras duras por defecto. Este tema también se emite como :root, así que valen para
    // cualquier tema que no las redefina.
    extra: {
      "shadow-box": "10px 10px 0 rgb(0 0 0 / 0.4)",
      "shadow-sticker": "3px 3px 0 rgb(0 0 0 / 0.35)",
      "shadow-board": "0 12px 0 rgb(0 0 0 / 0.35)",
    },
  },
  {
    // Videoclub a oscuras: cartón marrón oscuro con tinta clara y un amarillo más suave, para leer
    // de noche sin deslumbrar. Mismas bandas y pegatina que Videoclub, algo atenuadas.
    id: "oscuro",
    name: "Oscuro",
    tokens: {
      wall: "#121110",
      "wall-slat": "#171513",
      "wall-ink": "#ece8df",
      "wall-ink-soft": "#a8a196",
      shelf: "#3a2a1c",
      "shelf-edge": "#5a3f27",
      card: "#2d2925",
      "card-ink": "#ece8df",
      "card-ink-soft": "#b0a898",
      spine: "#0c0b0a",
      highlight: "#e8b931",
      "on-highlight": "#141414",
      sticker: "#c42b1f",
      "on-sticker": "#ffffff",
      band: "#2aa9b8",
    },
    extra: {
      "shadow-box": "10px 10px 0 rgb(0 0 0 / 0.6)",
      "shadow-sticker": "3px 3px 0 rgb(0 0 0 / 0.5)",
      "shadow-board": "0 12px 0 rgb(0 0 0 / 0.5)",
    },
  },
  {
    id: "neon",
    name: "Neón",
    tokens: {
      wall: "#0b0a1a",
      "wall-slat": "#100e24",
      "wall-ink": "#e9e6ff",
      "wall-ink-soft": "#a9a3d6",
      shelf: "#1b1440",
      "shelf-edge": "#ff2e88",
      card: "#15122e",
      "card-ink": "#e9e6ff",
      "card-ink-soft": "#a9a3d6",
      spine: "#050410",
      highlight: "#f8f32b",
      "on-highlight": "#0b0a1a",
      sticker: "#ff2e88",
      "on-sticker": "#0b0a1a",
      band: "#35f2ff",
    },
    extra: {
      glow: "0 0 18px rgb(53 242 255 / 0.45)",
      "shadow-box": "8px 8px 0 rgb(255 46 136 / 0.55)",
      "wall-pattern":
        "linear-gradient(to bottom, rgb(53 242 255 / 0.07) 1px, transparent 1px) 0 0 / 100% 32px",
    },
  },
  {
    id: "lcd",
    name: "Verde LCD",
    tokens: {
      wall: "#0f380f",
      "wall-slat": "#123f12",
      "wall-ink": "#9bbc0f",
      "wall-ink-soft": "#8bac0f",
      shelf: "#306230",
      "shelf-edge": "#8bac0f",
      card: "#9bbc0f",
      "card-ink": "#0f380f",
      "card-ink-soft": "#0f380f",
      spine: "#0f380f",
      highlight: "#9bbc0f",
      "on-highlight": "#0f380f",
      sticker: "#0f380f",
      "on-sticker": "#9bbc0f",
      band: "#8bac0f",
    },
    extra: {
      "shadow-box": "8px 8px 0 #306230",
      "shadow-sticker": "3px 3px 0 #306230",
      // La pegatina comparte color con el lomo: las bandas de ese color usan el verde medio.
      "sticker-band": "#306230",
      "wall-pattern":
        "linear-gradient(90deg, rgb(0 0 0 / 0.14) 1px, transparent 1px) 0 0 / 4px 4px, linear-gradient(rgb(0 0 0 / 0.14) 1px, transparent 1px) 0 0 / 4px 4px",
    },
  },
  {
    // Atardecer de costa en clave vaporwave: pared morada, cartón rosa pálido, sol naranja de
    // borde duro y una franja de cielo rosa arriba. Sombras turquesa sin desenfoque.
    id: "vaporwave",
    name: "Vaporwave",
    tokens: {
      wall: "#1a0b2e",
      "wall-slat": "#21103a",
      "wall-ink": "#fde8ff",
      "wall-ink-soft": "#c9a7e8",
      shelf: "#3b1458",
      "shelf-edge": "#ff6ec7",
      card: "#fdeaf3",
      "card-ink": "#2a0f3d",
      "card-ink-soft": "#6a3f78",
      spine: "#1f0a33",
      highlight: "#ffb347",
      "on-highlight": "#2a0f3d",
      sticker: "#c2187a",
      "on-sticker": "#ffffff",
      band: "#2de2e6",
    },
    extra: {
      "shadow-box": "8px 8px 0 rgb(45 226 230 / 0.5)",
      "shadow-sticker": "3px 3px 0 rgb(45 226 230 / 0.45)",
      "wall-pattern":
        "radial-gradient(circle at 86% 120px, rgb(255 179 71 / 0.7) 0 56px, rgb(255 110 199 / 0.55) 57px 72px, transparent 73px) 0 0 / 100% 100% no-repeat, linear-gradient(to bottom, rgb(255 110 199 / 0.2), rgb(255 179 71 / 0.06) 280px, transparent 480px) 0 0 / 100% 100% no-repeat",
    },
  },
  {
    // Tele de tubo en blanco y negro: todo en grises, líneas de barrido finas sobre la pared, esquinas
    // oscurecidas por la curvatura de la pantalla y un brillo de fósforo suave en rótulos y caja.
    id: "byn",
    name: "Blanco y negro",
    tokens: {
      wall: "#161616",
      "wall-slat": "#1b1b1b",
      "wall-ink": "#efefef",
      "wall-ink-soft": "#a3a3a3",
      shelf: "#333333",
      "shelf-edge": "#5c5c5c",
      card: "#cccccc",
      "card-ink": "#111111",
      "card-ink-soft": "#474747",
      spine: "#0d0d0d",
      highlight: "#f7f7f7",
      "on-highlight": "#111111",
      sticker: "#4a4a4a",
      "on-sticker": "#ffffff",
      band: "#8a8a8a",
    },
    extra: {
      glow: "0 0 10px rgb(255 255 255 / 0.18)",
      "shadow-box": "10px 10px 0 rgb(0 0 0 / 0.6)",
      "shadow-sticker": "3px 3px 0 rgb(0 0 0 / 0.5)",
      "wall-pattern":
        "radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.55) 100%) 0 0 / 100% 100% no-repeat fixed, repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 3px) 0 0 / 100% 3px",
    },
  },
  {
    id: "halloween",
    name: "Halloween",
    season: { start: { m: 10, d: 1 }, end: { m: 11, d: 1 } },
    tokens: {
      wall: "#160d1f",
      "wall-slat": "#1c1127",
      "wall-ink": "#f3e6cf",
      "wall-ink-soft": "#c9b8d6",
      shelf: "#2b1a12",
      "shelf-edge": "#4a2c1a",
      card: "#f3e6cf",
      "card-ink": "#1a0f1f",
      "card-ink-soft": "#4d3a52",
      spine: "#120a17",
      highlight: "#ff8a1f",
      "on-highlight": "#1a0f1f",
      sticker: "#6b2fa3",
      "on-sticker": "#ffffff",
      band: "#7bd13a",
    },
    extra: {
      "wall-pattern": `${cobweb("left")}, ${cobweb("right")}`,
    },
  },
  {
    id: "navidad",
    name: "Navidad",
    season: { start: { m: 11, d: 1 }, end: { m: 1, d: 9 } },
    tokens: {
      wall: "#0d2418",
      "wall-slat": "#10291c",
      "wall-ink": "#fbf6ec",
      "wall-ink-soft": "#c5d6c8",
      shelf: "#4a2b18",
      "shelf-edge": "#6b3f22",
      card: "#fbf6ec",
      "card-ink": "#14231a",
      "card-ink-soft": "#3e5446",
      spine: "#0f1f16",
      highlight: "#f2c14e",
      "on-highlight": "#14231a",
      sticker: "#c8102e",
      "on-sticker": "#ffffff",
      band: "#2f8f5b",
    },
    extra: {
      "wall-pattern":
        "radial-gradient(circle at 20% 30%, rgb(255 255 255 / 0.5) 1.5px, transparent 2.5px) 0 0 / 120px 120px, radial-gradient(circle at 70% 75%, rgb(255 255 255 / 0.35) 1px, transparent 2px) 0 0 / 88px 88px",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "videoclub";

/** Datos mínimos que necesita el motor (lo que se serializa al script inline). */
export const THEME_RULES = THEMES.map(({ id, season }) => ({ id, season: season ?? null }));

export interface ThemeEngine {
  isAvailable(id: string, date: Date): boolean;
  available(date: Date): string[];
  seasonKey(id: string, date: Date): string | null;
  resolve(input: { stored: string | null; seen: string[]; date: Date; seasonal?: boolean }): {
    theme: string;
    seen: string[];
  };
}

/**
 * Motor de temas autocontenido: no usa nada de fuera de su cuerpo, para que
 * `themeEngine.toString()` pueda incrustarse tal cual en el script de <head>.
 * Las fechas son las locales del visitante; los rangos de temporada son inclusivos.
 */
export function themeEngine(rules: { id: string; season: Season | null }[]): ThemeEngine {
  const md = (m: number, d: number) => m * 100 + d;
  const find = (id: string) => rules.filter((rule) => rule.id === id)[0];

  const isAvailable = (id: string, date: Date) => {
    const rule = find(id);
    if (!rule) return false;
    if (!rule.season) return true;
    const today = md(date.getMonth() + 1, date.getDate());
    const start = md(rule.season.start.m, rule.season.start.d);
    const end = md(rule.season.end.m, rule.season.end.d);
    return start <= end ? today >= start && today <= end : today >= start || today <= end;
  };

  const startYear = (season: Season, date: Date) => {
    const today = md(date.getMonth() + 1, date.getDate());
    const wraps = md(season.start.m, season.start.d) > md(season.end.m, season.end.d);
    return wraps && today < md(season.start.m, season.start.d)
      ? date.getFullYear() - 1
      : date.getFullYear();
  };

  const seasonKey = (id: string, date: Date) => {
    const rule = find(id);
    if (!rule || !rule.season || !isAvailable(id, date)) return null;
    return rule.id + "-" + startYear(rule.season, date);
  };

  const available = (date: Date) =>
    rules.filter((rule) => isAvailable(rule.id, date)).map((rule) => rule.id);

  const resolve = (input: {
    stored: string | null;
    seen: string[];
    date: Date;
    seasonal?: boolean;
  }) => {
    const date = input.date;
    // Temporadas activas, de la que empezó más tarde a la que empezó antes.
    const active = rules
      .filter((rule) => rule.season && isAvailable(rule.id, date))
      .map((rule) => {
        const season = rule.season as Season;
        return {
          id: rule.id,
          start: new Date(startYear(season, date), season.start.m - 1, season.start.d).getTime(),
        };
      })
      .sort((a, b) => b.start - a.start);

    // Con seasonal = false (ajustes), las temporadas solo se aplican si el visitante las elige.
    const latest = input.seasonal === false ? undefined : active[0];
    if (latest) {
      const key = seasonKey(latest.id, date) as string;
      if (input.seen.indexOf(key) === -1)
        return { theme: latest.id, seen: input.seen.concat([key]) };
    }
    if (input.stored && isAvailable(input.stored, date))
      return { theme: input.stored, seen: input.seen };
    return { theme: rules[0].id, seen: input.seen };
  };

  return { isAvailable, available, seasonKey, resolve };
}

export const engine = themeEngine(THEME_RULES);

/** CSS de todos los temas: el primero también es el valor por defecto de :root (sin JS). */
export function themeCss(): string {
  return THEMES.map((theme, index) => {
    const vars = { ...theme.tokens, ...theme.extra } as Record<string, string>;
    const body = Object.entries(vars)
      .map(([name, value]) => `--${name}:${value};`)
      .join("");
    const selector =
      index === 0 ? `:root,:root[data-theme="${theme.id}"]` : `:root[data-theme="${theme.id}"]`;
    return `${selector}{${body}}`;
  }).join("\n");
}

// Script de <head>: aplica el tema guardado (o el de temporada la primera vez) antes del primer
// pintado y pone `theme-color` al `spine` de ese tema.
export function themeInitScript(): string {
  return `(function(){try{
var E=(${themeEngine.toString()})(${JSON.stringify(THEME_RULES)});
var ls=null,stored=null,seen=[],seasonal=true;
try{ls=window.localStorage;stored=ls.getItem(${JSON.stringify(STORAGE_THEME)});seasonal=ls.getItem(${JSON.stringify(STORAGE_SEASONAL)})!=="off";seen=JSON.parse(ls.getItem(${JSON.stringify(STORAGE_SEEN)})||"[]");}catch(e){}
if(!Array.isArray(seen))seen=[];
var r=E.resolve({stored:stored,seen:seen,date:new Date(),seasonal:seasonal});
document.documentElement.dataset.theme=r.theme;
try{if(ls){ls.setItem(${JSON.stringify(STORAGE_THEME)},r.theme);ls.setItem(${JSON.stringify(STORAGE_SEEN)},JSON.stringify(r.seen));}}catch(e){}
try{var tc=${JSON.stringify(Object.fromEntries(THEMES.map((theme) => [theme.id, theme.tokens.spine])))}[r.theme];
if(tc)document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=tc;});}catch(e){}
}catch(e){}})();`;
}
