const CACHE_NAME = 'lekovka-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://code.iconify.design/3/3.1.0/iconify.min.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
