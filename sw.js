const CACHE_NAME = 'lekovka-v6';
const ASSETS = [
  './',
  './index.html',
  './icon-512.png',
  './manifest.json',
  'https://code.iconify.design/3/3.1.0/iconify.min.js',
  'https://cdn.tailwindcss.com'
];

// Instalace - uložení do paměti
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktivace - vyčištění staré mezipaměti
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});

// Fetching - načítání souborů i bez internetu
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
