
var cacheName = 'vcpkgx-pwa';
var filesToCache = [
    '/',
    '/index.html',
    '/details.html',
    '/css/style.css',
    '/css/bulma.min.css',
    '/js/fuse.js',
    '/js/common.js',
    '/js/search.js',
    '/js/details.js',
    '/js/pwa.js',
    '/js/fontawesomeAll.js',
    '/data/libs.json',
    '/sw.js',
    '/webfonts/fa-brands-400.eot',
    '/webfonts/fa-brands-400.svg',
    '/webfonts/fa-brands-400.ttf',
    '/webfonts/fa-brands-400.woff',
    '/webfonts/fa-brands-400.woff2',
    '/webfonts/fa-regular-400.eot',
    '/webfonts/fa-regular-400.svg',
    '/webfonts/fa-regular-400.ttf',
    '/webfonts/fa-regular-400.woff',
    '/webfonts/fa-regular-400.woff2',
    '/webfonts/fa-solid-900.eot',
    '/webfonts/fa-solid-900.svg',
    '/webfonts/fa-solid-900.ttf',
    '/webfonts/fa-solid-900.woff',
    '/webfonts/fa-solid-900.woff2'
];


/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return fetch(event.request).then(function(response) {
            let url = new URL(event.request.url);
            let request = new Request(url.origin+url.pathname);
            cache.put(request, response.clone());

          return response;
        }).catch(function () {
            return caches.match(event.request, {ignoreSearch: true});
        });
      })
    );
  });