// public/service-worker.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

// Service workers can't use ES modules, so we need to define the config here
const firebaseConfig = {
    apiKey: "AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",
    authDomain: "online-attendance-21f95.firebaseapp.com",
    projectId: "online-attendance-21f95",
    storageBucket: "online-attendance-21f95.appspot.com",
    messagingSenderId: "756223518392",
    appId: "1:756223518392:web:5e8d28c78f7eefb8be764d"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Workbox injection point
self.__WB_MANIFEST

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationOptions = {
        body: payload.notification.body,
        icon: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
        badge: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
        vibrate: [100, 50, 100],
        data: {
            ...payload.data,
            url: `/NFC-CAPSTONE-PROJECT${payload.data?.url || ''}`
        }
    };

    self.registration.showNotification(
        payload.notification.title,
        notificationOptions
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
        );
    }
});

// Add default PWA event listeners
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Claim control immediately
workbox.core.clientsClaim();
self.clients.claim();

// Cache page navigations (html) with a Network First strategy
workbox.routing.registerRoute(
  // Check to see if the request is a navigation to a new page
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages-cache',
  })
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// Cache images with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
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
  if (event.data && event.data.type === 'SKIP_WAITING') {
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
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Enhanced background message handler with retry logic
messaging.onBackgroundMessage(async (payload) => {
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
