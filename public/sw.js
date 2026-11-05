// Service worker de Daily Bug, escrito a mano. Estrategia de caché: sección «PWA» de AGENTS.md.
// Sube CACHE_VERSION al cambiar este fichero o lo que precachea.
const CACHE_VERSION = "v2";
const PAGES = `daily-bug-pages-${CACHE_VERSION}`;
const STATIC = `daily-bug-static-${CACHE_VERSION}`;
const LIMITS = { [PAGES]: 60, [STATIC]: 200 };
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      await pages.add(OFFLINE_URL);
      // La página offline necesita su CSS y JS: se guardan los recursos que enlaza (sin las
      // rutas escapadas del payload RSC, que llevan «\»).
      const html = await (await pages.match(OFFLINE_URL)).text();
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
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

/** Solo respuestas buenas y que no piden quedarse fuera de cachés. */
function storable(response) {
  if (!response.ok) return false;
  const cacheControl = response.headers.get("Cache-Control") ?? "";
  return !/no-store|private/i.test(cacheControl);
}

/** Guarda y recorta la caché a su máximo, borrando primero lo más antiguo. */
async function store(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  const excess = keys.length - LIMITS[cacheName];
  for (let i = 0; i < excess; i++) {
    // /offline nunca se recorta: es el último recurso sin red.
    if (new URL(keys[i].url).pathname !== OFFLINE_URL) await cache.delete(keys[i]);
  }
}

/** Red primero; si falla, la copia. Guarda la respuesta buena para la próxima vez. */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (storable(response)) await store(cacheName, request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request, { cacheName });
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { cacheName: STATIC });
  if (cached) return cached;
  const response = await fetch(request);
  if (storable(response)) await store(STATIC, request, response.clone());
  return response;
}

/** La primera página del archivo (con o sin filtro de tipo) y cada bug suelto. */
function isCacheableApi(url) {
  if (/^\/api\/bugs\/\d+$/.test(url.pathname)) return true;
  return (
    url.pathname === "/api/bugs" && !url.searchParams.has("q") && !url.searchParams.has("cursor")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    if (isCacheableApi(url)) event.respondWith(networkFirst(request, PAGES));
    return; // Votos, /api/votes, cron y búsquedas: directo a la red.
  }
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
  }
  // El resto (datos RSC, iconos…) va directo a la red.
});
