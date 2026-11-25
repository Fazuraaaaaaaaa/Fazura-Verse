// FazuraStream High-Performance Service Worker
// Version 1.3.0 - Safe App Shell, Offline Fallback & Bounded Image Caching

const CACHE_NAME = 'fazurastream-cache-v1.3.0';
const OFFLINE_READER_CACHE = 'fazura-offline-chapters-v1';
const OFFLINE_FALLBACK_URL = '/offline.html';

const STATIC_PRECACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html',
];

// Never cache video/audio media streams or third-party streaming APIs
const STREAM_HOST_BLOCKLIST = [
  'youtube.com',
  'googlevideo.com',
  'vidhide',
  'filedon',
  'mega.nz',
  'vidsrc',
  'autoembed',
  'multiembed',
  '2embed',
  'itunes.apple.com',
  'sankavollerei',
  'themoviedb.org',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== OFFLINE_READER_CACHE) {
              return caches.delete(key);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Never intercept or cache video/audio streams or upstream media APIs
  const lowerUrl = url.href.toLowerCase();
  if (
    request.destination === 'video' ||
    request.destination === 'audio' ||
    lowerUrl.includes('.m3u8') ||
    lowerUrl.includes('.mp4') ||
    lowerUrl.includes('.mp3') ||
    STREAM_HOST_BLOCKLIST.some((host) => url.hostname.includes(host))
  ) {
    return;
  }

  // Handle SPA document navigations: Network-first with cached shell / offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return res;
        })
        .catch(async () => {
          const cachedShell = await caches.match('/');
          if (cachedShell) return cachedShell;
          const offlinePage = await caches.match(OFFLINE_FALLBACK_URL);
          return offlinePage || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Manga reader explicit offline chapters & same-origin UI icons/assets -> Cache-first fallback
  if (url.pathname.includes('/api/image-proxy')) {
    event.respondWith(
      caches.open(OFFLINE_READER_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          // Only cache valid responses when user is browsing; cap entries lightly
          if (networkResponse && networkResponse.status === 200) {
            const keys = await cache.keys();
            if (keys.length > 250) {
              await cache.delete(keys[0]);
            }
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return (
            cached ||
            new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="#11111D"/><text x="150" y="200" fill="#8B5CF6" font-family="sans-serif" font-size="13" text-anchor="middle">Gambar Tidak Tersedia Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            )
          );
        }
      })
    );
    return;
  }

  // Same-origin static assets (JS/CSS/SVG) -> Stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cached as Response);

        return cached || fetchPromise;
      })
    );
  }
});
