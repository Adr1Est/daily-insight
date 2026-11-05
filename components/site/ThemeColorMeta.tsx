"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { findTheme, useCurrentTheme } from "@/components/site/themeClient";

// Mantiene `<meta name="theme-color">` con el `spine` del tema activo (la cabecera). El primer
// valor lo pone themeInitScript() antes de pintar.
export default function ThemeColorMeta() {
  const theme = useCurrentTheme();
  // Al navegar, Next puede volver a pintar la meta con el color del viewport: se reaplica.
  const pathname = usePathname();
  useEffect(() => {
    const color = findTheme(theme).tokens.spine;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = color));
  }, [theme, pathname]);
  return null;
}
