// La versión vive solo en index.html (const APP_VERSION) — se registra este
// SW como "sw.js?v=" + APP_VERSION, y aquí se lee de esa query string para
// que no puedan desincronizarse (si no, un index.html nuevo con sw.js sin
// tocar no invalida la caché y la app puede servir una versión vieja: esto
// pasó el 13/11/2026, el TEST DE ARRASTRE desapareció de Herramientas hasta
// cerrar y reabrir la app).
const APP_VERSION = new URL(self.location.href).searchParams.get('v') || '0';
const CACHE_NAME = `estudio-v${APP_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './icon.png',
  './vendor/chart.umd.min.js',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDocument = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isDocument) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
