// FIX: Incremented cache version to force users to download the new clairo_2.mp3 path
const CACHE_NAME = 'music-widget-cache-v2';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './renderer_clean.js',
  './manifest.json',
  // Ensure we only have the correct audio path
  './assets/clairo_2.mp3', 
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
                // FIX: Corrected typo from console.addAll to cache.addAll
                return cache.addAll(urlsToCache); 
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
                return response || fetch(event.request); 
        })
    );
})
