// src/sw.js
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { app } from '/utils/firebase-config.js';

// Claim control immediately
self.skipWaiting();
clientsClaim();
const messaging = getMessaging(app);

// Precache and route setup
precacheAndRoute(self.__WB_MANIFEST);

// Background message handler
onBackgroundMessage(messaging, (payload) => {
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

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
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