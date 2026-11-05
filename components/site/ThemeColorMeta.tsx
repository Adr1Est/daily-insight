"use client";

import { useEffect } from "react";

import { findTheme, useCurrentTheme } from "@/components/site/themeClient";

/** Ajusta `<meta name="theme-color">` al tema activo para que la barra del sistema case con la cabecera. */
export default function ThemeColorMeta() {
  const theme = useCurrentTheme();
  useEffect(() => {
    const color = findTheme(theme).tokens.spine;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = color));
  }, [theme]);
  return null;
}
