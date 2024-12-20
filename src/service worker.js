// src/sw.js
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { app } from '/utils/firebase-config.js';

// Claim control immediately
clientsClaim();
self.clients.claim();
const messaging = getMessaging(app);

// Cache page navigations (html) with a Network First strategy
registerRoute(
  // Check to see if the request is a navigation to a new page
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
  })
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
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

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {a
    self.skipWaiting();
  }
});

// Handle service worker updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('workbox-') || cacheName.endsWith('-cache')) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Notify all clients about the update
      clients.claim(),
      clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'CACHE_UPDATED' }));
      }),
    ])
  );
});

// Precache and route setup
precacheAndRoute(self.__WB_MANIFEST);

// Enhanced background message handler with retry logic
onBackgroundMessage(messaging, async (payload) => {
  console.log('Received background message:', payload);

  try {
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
      badge: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
      vibrate: [100, 50, 100],
      tag: payload.data?.messageId || 'default', // Add tag for notification grouping
      renotify: true, // Always notify even if there's an existing notification
      requireInteraction: true, // Keep notification visible until user interacts
      actions: [
        {
          action: 'view',
          title: 'View Message'
        }
      ],
      data: {
        ...payload.data,
        url: `/NFC-CAPSTONE-PROJECT${payload.data?.url || ''}`,
        timestamp: Date.now()
      }
    };

    await self.registration.showNotification(
      payload.notification.title,
      notificationOptions
    );
  } catch (error) {
    console.error('Error showing notification:', error);
    // Retry once after 1 second
    setTimeout(async () => {
      try {
        await self.registration.showNotification(
          payload.notification.title,
          notificationOptions
        );
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }, 1000);
  }
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data?.url;

  notification.close();

  event.waitUntil((async () => {
    try {
      // Try to focus an existing window first
      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const windowClient of windowClients) {
        if (windowClient.url === url && 'focus' in windowClient) {
          await windowClient.focus();
          return;
        }
      }

      // If no existing window, open a new one
      if (url) {
        await clients.openWindow(url);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  })());
});