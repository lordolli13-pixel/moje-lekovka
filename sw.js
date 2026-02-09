const CACHE_NAME = 'lekovka-v6';
const ASSETS = [
  './',
  './index.html',
  './icon-512.jpg',
  './manifest.json',
  'https://code.iconify.design/3/3.1.0/iconify.min.js',
  'https://cdn.tailwindcss.com'
];

// Instalace - uloží soubory do cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

// Aktivace - vymaže staré verze cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
});

// Obsluha požadavků - nejdřív zkusí cache, pak síť
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
