// MortZKey Service Worker
// Version 2.0 - MortApps Studios

const CACHE_NAME = 'mortzkey-v2.0.0';
const ASSETS_TO_CACHE = [
  '/mortzkey/',
  '/mortzkey/index.html',
  '/mortzkey/site.webmanifest',
  '/mortzkey/icons/android-chrome-192x192.png',
  '/mortzkey/icons/android-chrome-512x512.png',
  '/mortzkey/icons/apple-touch-icon.png',
  '/mortzkey/icons/favicon-32x32.png',
  '/mortzkey/icons/favicon-16x16.png',
  '/mortzkey/icons/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[MortZKey] Caching app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(function() {
      console.log('[MortZKey] Service Worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          console.log('[MortZKey] Removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('[MortZKey] Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Not in cache - fetch from network
      return fetch(event.request).then(function(networkResponse) {
        // Don't cache if not a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response since it can only be consumed once
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(function(error) {
        console.log('[MortZKey] Fetch failed:', error);
        
        // Return offline page if available
        return caches.match('/mortzkey/index.html');
      });
    })
  );
});

// Handle messages from the main app
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for license keys (if supported)
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-licenses') {
    console.log('[MortZKey] Background sync triggered');
    // Future implementation for cloud sync
  }
});

console.log('[MortZKey] Service Worker loaded - MortApps Studios');
