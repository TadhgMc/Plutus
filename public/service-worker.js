const FILES_TO_CACHE = [
    '/',
    '/styles.css',
    '/index.html',
    // '/dist/manifest.json',
    // '/dist/bundle.js',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.webmanifest'
  ];
  
const STATIC_CACHE = "finance-static-cache";
const RUNTIME_CACHE = "finance-runtime-cache";
  
self.addEventListener("install", event => {
    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then(cache => {return cache.addAll(FILES_TO_CACHE)})
    );
    self.skipWaiting();
});
  
  // The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
      caches
        .keys()
        .then(cacheNames => {
          // return array of cache names that are old to delete
          return cacheNames.filter(
            cacheName => !currentCaches.includes(cacheName)
          );
        })
        .then(cachesToDelete => {
          return Promise.all(
            cachesToDelete.map(cacheToDelete => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
});
  
  
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});


// handle runtime GET requests for data from /api routes

// make network request and fallback to cache if network request fails (offline)
// event.respondWith(
//   caches.open(RUNTIME_CACHE).then(cache => {
//     return fetch(event.request)
//       .then(response => {
//         if (response.status === 200) {
//           cache.put(evt.request.url, response.clone());
//         };
        
//         return response;
//       })
//       .catch(() => caches.match(event.request));
//   })

// event.respondWith(
//   caches.open(RUNTIME_CACHE).then(cache => {
//       return cache.match(event.request).then(response => {
//       return response || fetch(event.request);
//       });
//   })
// )


// use cache first for all other requests for performance
// event.respondWith(
//   caches.match(event.request).then(cachedResponse => {
//     if (cachedResponse) {
//       return cachedResponse;
//     }

//     // request is not in cache. make network request and cache the response
//     return caches.open(RUNTIME_CACHE).then(cache => {
//       return fetch(event.request).then(response => {
//         return cache.put(event.request, response.clone()).then(() => {
//           return response;
//         });
//       });
//     });
//   })
// );

