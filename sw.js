
var cacheName = 'vcpkgx-pwa';
var filesToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/search.js',
    'data/libs.json'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline (Network falling back to the cache) */
self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request);
        })
    );
});