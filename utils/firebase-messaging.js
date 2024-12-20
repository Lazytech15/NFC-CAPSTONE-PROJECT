import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { app } from '/utils/firebase-config.js';

const messaging = getMessaging(app);
const firestore = getFirestore(app);

const vapidKey = 'BKXr4iC6ePoro8waXRhqdMAQBjeS6SEySfJIR7oueqzE2dnB9sU-kXTBfGs2ko_1skNVMvBaWKxYcayq-NIGlRU';

// Add explicit showNotification function
export function showNotification(title, options) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      ...options,
      icon: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
      badge: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
      vibrate: [100, 50, 100],
    });

    notification.onclick = () => {
      notification.close();
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }
}

export async function requestNotificationPermission(userId) {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

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
    try {
      await deleteToken(messaging);
    } catch (error) {
      console.warn('Error deleting existing token:', error);
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });
    
    if (!token) {
      throw new Error('No registration token available');
    }

    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    const tokenData = {
      token,
      lastUpdated: new Date().toISOString(),
      device: navigator.userAgent
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        fcmTokens: [tokenData]
      });
    } else {
      const currentTokens = userDoc.data().fcmTokens || [];
      const updatedTokens = currentTokens
        .filter(t => t.token !== token)
        .concat(tokenData);

      await updateDoc(userRef, {
        fcmTokens: updatedTokens
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error setting up FCM:', error);
    throw error;
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      // Use the showNotification function for foreground notifications
      if (Notification.permission === 'granted') {
        showNotification(payload.notification.title, {
          body: payload.notification.body,
          tag: payload.data?.messageId,
          data: payload.data
        });
      }
      
      resolve(payload);
    });
  });
}

export async function checkNotificationStatus(userId) {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }

    const tokens = userDoc.data().fcmTokens || [];
    return tokens.length > 0;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
}