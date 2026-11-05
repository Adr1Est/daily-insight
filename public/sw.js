// Service worker de Daily Bug (PWA). Escrito a mano, sin dependencias.
// - Páginas: red primero; sin red, la última copia; sin copia, /offline.
// - /_next/static/*: caché primero (los nombres llevan hash, nunca cambian).
// - GET /api/bugs y /api/bugs/:id: red primero con copia de respaldo.
// - Votos, ajustes y cron: siempre red, nunca se guardan.
// Sube CACHE_VERSION al cambiar este fichero o lo que precachea.
const CACHE_VERSION = "v1";
const PAGES = `daily-bug-pages-${CACHE_VERSION}`;
const STATIC = `daily-bug-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      await pages.addAll(PRECACHE);
      // La página offline necesita su CSS y JS: se guardan los recursos que enlaza.
      const html = await (await pages.match(OFFLINE_URL)).text();
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) ?? [])];
      const statics = await caches.open(STATIC);
      await Promise.all(assets.map((url) => statics.add(url).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, STATIC]);
      for (const key of await caches.keys()) {
        if (key.startsWith("daily-bug-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

/** Red primero; si falla, la copia. Guarda la respuesta buena para la próxima vez. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

const isBugsApi = (path) => path === "/api/bugs" || /^\/api\/bugs\/\d+$/.test(path);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, PAGES).catch(
        async () => (await caches.match(OFFLINE_URL)) ?? Response.error(),
      ),
    );
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (isBugsApi(url.pathname)) {
    event.respondWith(networkFirst(request, PAGES));
  }
  // El resto (votos, /api/votes, cron, datos RSC…) va directo a la red.
});
