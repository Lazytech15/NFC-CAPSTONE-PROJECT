// import { useEffect, useState } from 'react';
// import { requestNotificationPermission, onMessageListener } from '/utils/firebase-messaging';
// import { useAuth } from '/contexts/AuthContext';
// import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';

// function NotificationManager({ onNotificationReceived }) {
//   const [notificationStatus, setNotificationStatus] = useState('pending');
//   const [token, setToken] = useState(null);
//   const { currentUser } = useAuth();
//   const db = getFirestore();
//   const functions = getFunctions();

//   useEffect(() => {
//     checkNotificationStatus();
//     setupMessageListener();
//   }, [currentUser]);

//   const findUserTokenByEmail = async (email) => {
//     const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
    
//     for (const collectionName of collections) {
//       const q = query(collection(db, collectionName), where("email", "==", email));
//       const snapshot = await getDocs(q);
      
//       if (!snapshot.empty) {
//         const userData = snapshot.docs[0].data();
//         if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
//           // Get the most recent token
//           const sortedTokens = userData.fcmTokens.sort((a, b) => 
//             new Date(b.lastUpdated) - new Date(a.lastUpdated)
//           );
          
//           return sortedTokens[0]?.token;
//         }
//       }
//     }
//     return null;
//   };

//   const checkNotificationStatus = async () => {
//     try {
//       if (!('Notification' in window)) {
//         setNotificationStatus('unsupported');
//         return;
//       }

//       setNotificationStatus(Notification.permission);

//       if (Notification.permission === 'granted' && currentUser) {
//         const fcmToken = await requestNotificationPermission(currentUser.uid);
//         setToken(fcmToken);
//       }
//     } catch (error) {
//       console.error('Error checking notification status:', error);
//       setNotificationStatus('error');
//     }
//   };

//   const setupMessageListener = () => {
//     onMessageListener()
//       .then((payload) => {
//         const { title, body, data } = payload.notification;
        
//         // Show notification using service worker if available
//         if ('serviceWorker' in navigator && 'PushManager' in window) {
//           navigator.serviceWorker.ready.then((registration) => {
//             registration.showNotification(title, {
//               body,
//               icon: '/icons/icon.svg',
//               data: data,
//               badge: '/icons/badge.png',
//               vibrate: [200, 100, 200],
//               requireInteraction: true,
//               actions: [
//                 { action: 'open', title: 'Open Message' },
//                 { action: 'close', title: 'Dismiss' }
//               ]
//             });
//           });
//         } else {
//           // Fallback to regular notification
//           new Notification(title, {
//             body,
//             icon: '/icons/icon.svg'
//           });
//         }

//         if (onNotificationReceived) {
//           onNotificationReceived(payload);
//         }
//       })
//       .catch((err) => console.error('Error setting up message listener:', err));
//   };

//   const sendNotificationToUser = async (recipientEmail, messageData) => {
//     try {
//       const recipientToken = await findUserTokenByEmail(recipientEmail);
      
//       if (recipientToken) {
//         const sendNotification = httpsCallable(functions, 'sendNotification');
//         await sendNotification({
//           token: recipientToken,
//           title: messageData.title,
//           body: messageData.body,
//           data: messageData.data
//         });
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error sending notification:', error);
//       return false;
//     }
//   };

//   const handleEnableNotifications = async () => {
//     try {
//       if (!currentUser) {
//         throw new Error('Please sign in to enable notifications');
//       }

//       const fcmToken = await requestNotificationPermission(currentUser.uid);
//       setToken(fcmToken);
//       setNotificationStatus('granted');
//       return fcmToken;
//     } catch (error) {
//       console.error('Error enabling notifications:', error);
//       setNotificationStatus('error');
//       throw error;
//     }
//   };

//   return {
//     notificationStatus,
//     token,
//     handleEnableNotifications,
//     sendNotificationToUser,
//     checkNotificationStatus
//   };
// }

// export default NotificationManager;
