// ============================================================
// MILIOLAB-BASE Service Worker
// PENTING: HANYA cache file statis. Request Supabase TIDAK PERNAH
// di-cache — selalu langsung network, supaya data member real-time.
// ============================================================

const CACHE_NAME = 'miliolab-base-v1';
const APP_SHELL = [
  'index_supabase_v3_1.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Supabase: jangan pernah di-cache, langsung network (data harus real-time)
  if (url.includes('supabase.co')) return;
  if (event.request.method !== 'GET') return;

  // File statis: network-first, fallback cache kalau offline
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
