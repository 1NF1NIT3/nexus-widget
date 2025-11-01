const CACHE_NAME = 'music-widget-cache-v1';

const urlsToCache = [
    './',
  './index.html',
  './style.css',
  './renderer_clean.js',
  './manifest.json',
  './assets/clairo(2).mp3',
  './assets/anything.mp3',
  './assets/gluesnoopy.jpg',
  './assets/snoopicon.png',
  './assets/snoopy.jpg',
  './assets/sleep.gif',
  './assets/snoopygif.gif',
  './assets/space-stars.gif'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
                return response || fetch(event.request); // Return cached resource
        })
    );
})

