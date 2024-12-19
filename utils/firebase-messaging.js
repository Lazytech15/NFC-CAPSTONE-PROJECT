import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '/utils/firebase-config.js';

const messaging = getMessaging(app);
const firestore = getFirestore(app);

const vapidKey = 'BKXr4iC6ePoro8waXRhqdMAQBjeS6SEySfJIR7oueqzE2dnB9sU-kXTBfGs2ko_1skNVMvBaWKxYcayq-NIGlRU';

export async function requestNotificationPermission(userId) {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

    // Wait for the PWA plugin to register the service worker
    const registration = await navigator.serviceWorker.ready;

    if (Notification.permission === 'granted') {
      return await setupFCM(userId, registration);
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await setupFCM(userId, registration);
    } else {
      throw new Error('Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
}

async function setupFCM(userId, registration) {
  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          fcmTokens: {
            [token]: true,
            lastUpdated: new Date().toISOString()
          }
        });
      } else {
        // Update the document if it exists
        await updateDoc(userRef, {
          fcmTokens: {
            [token]: true,
            lastUpdated: new Date().toISOString()
          }
        });
      }
      
      return token;
    } else {
      throw new Error('No registration token available');
    }
  } catch (error) {
    console.error('Error setting up FCM:', error);
    throw error;
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
