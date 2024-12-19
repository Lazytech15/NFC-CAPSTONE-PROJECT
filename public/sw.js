// The line below is required for workbox to inject the manifest
self.__WB_MANIFEST

// Import workbox modules using importScripts
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { precacheAndRoute } = workbox.precaching;
const { ExpirationPlugin } = workbox.expiration;

// Take control immediately
self.skipWaiting();
self.clients.claim();

// Precache and route all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache page navigations (html) with a Network First strategy
registerRoute(
  // Check to see if the request is a navigation to a new page
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    // Use a custom cache name
    cacheName: 'pages-cache',
  })
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
  // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'assets-cache',
  })
);

// Cache images with a Cache First strategy
registerRoute(
  // Check to see if the request's destination is image
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    // Use a custom cache name
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        // Cache only 50 images
        maxEntries: 50,
        // Cache for a maximum of 30 days
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/NFC-CAPSTONE-PROJECT/') || caches.match('/NFC-CAPSTONE-PROJECT/index.html');
      })
    );
  }
});