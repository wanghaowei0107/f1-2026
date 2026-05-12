const CACHE_NAME = 'f1-2026-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/js/app.js',
  '/js/data.js',
  '/js/api.js',
  '/js/schedule.js',
  '/js/standings.js',
  '/js/chart.js',
  '/js/race-detail.js',
  '/js/driver-detail.js',
  '/js/comparison.js',
  '/js/driver-profile.js',
  '/js/race-replay.js',
  '/js/onboard.js',
  '/js/live.js',
  '/js/history.js',
  '/js/weather.js',
  '/js/ics.js',
  '/js/circuit.js',
  '/js/circuit-map.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.hostname.includes('api.')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
  );
});
