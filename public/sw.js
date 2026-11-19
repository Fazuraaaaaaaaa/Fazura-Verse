// FazuraStream High-Performance Service Worker
// Version 1.2.0 - Offline Reader & PWA App Shell Caching

const CACHE_NAME = 'fazurastream-cache-v1.2.0';
const OFFLINE_READER_CACHE = 'fazura-offline-chapters-v1';

const STATIC_PRECACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

// Install: precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('Precache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== OFFLINE_READER_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart Stale-While-Revalidate & Cache-First for Offline Manga Reader
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests or browser-extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Manga reader image proxy & CDN images -> Check Offline Reader Cache first
  if (url.pathname.includes('/api/image-proxy') || url.pathname.includes('/comic/bacakomik') || request.destination === 'image') {
    event.respondWith(
      caches.open(OFFLINE_READER_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cachedResponse || new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="#121620"/><text x="150" y="200" fill="#8B5CF6" font-family="sans-serif" font-size="14" text-anchor="middle">Halaman Tersimpan Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // App Shell & Static Assets -> Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cached;
        });

      return cached || fetchPromise;
    })
  );
});
