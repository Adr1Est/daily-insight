import type { MetadataRoute } from "next";

import { APP_DESCRIPTION, APP_NAME, BACKGROUND_COLOR, PWA_ICONS, THEME_COLOR } from "@/lib/pwa";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    lang: "es",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ["games", "entertainment"],
    icons: Object.entries(PWA_ICONS).map(([variant, { size, maskable }]) => ({
      src: `/pwa-icon/${variant}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: maskable ? "maskable" : "any",
    })),
    shortcuts: [
      { name: "Archivo", short_name: "Archivo", url: "/bugs" },
      { name: "Top", short_name: "Top", url: "/top" },
    ],
  };
}
