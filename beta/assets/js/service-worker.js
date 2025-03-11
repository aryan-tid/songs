/* When you deploy a new version:

Update the CACHE_VERSION in service-worker.js
Update the version in version.json
Optionally update the APP_VERSION in your scripts if needed
*/

// service-worker.js
const CACHE_VERSION = '1.1.4'; // Update this whenever you deploy a new version
const CACHE_NAME = `melodify-cache-v${CACHE_VERSION}`;

// List all your static assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/bootstrap/js/bootstrap.min.js',
  '/assets/css/bs-theme-overrides.css',
  '/assets/css/loader.css',
  '/assets/css/Navbar-Right-Links-icons.css',
  '/assets/css/Player-1.css',
  '/assets/css/Player-2.css',
  '/assets/css/song-card.css',
  '/assets/css/styles.css',
  '/assets/fonts/fontawesome5-overrides.min.css',
  '/assets/img/logo.png',
  '/assets/js/player-queue.js',
  '/assets/js/player.js',
  '/assets/js/scripts.js',
  '/assets/js/search-api.js',
  '/assets/js/service-worker.js',
  '/version.json',
  '/logo.png'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become active
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any old caches that don't match our current version
          if (cacheName.startsWith('melodify-cache-') && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Special case: Always fetch version.json from the network
  if (event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/version.json'))
    );
    return;
  }

  // Check if the request is for a navigation (e.g., opening the PWA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle other requests normally (cache first, then network)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then(response => {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') return response;

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a default fallback for other resources
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle offline navigation
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'OFFLINE_READY') {
    // Notify all clients to show downloads page
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SHOW_DOWNLOADS'
        });
      });
    });
  }
});