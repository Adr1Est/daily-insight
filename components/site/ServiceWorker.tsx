"use client";

import { useEffect } from "react";

/** Registra public/sw.js. Solo en producción: en desarrollo la caché estorbaría al recargar. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("No se pudo registrar el service worker", error);
    });
  }, []);
  return null;
}
