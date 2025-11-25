/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches
      .open('v1')
      .then(cache => cache.addAll(['/', '/index.html', '/src/index.tsx'])),
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || fetch(event.request)),
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Enabled');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== 'v1') {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
          return Promise.resolve();
        }),
      ),
    ),
  );
});
