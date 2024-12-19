// components/NotificationManager.jsx
import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '/utils/firebase-messaging';
import { useAuth } from '/contexts/AuthContext'; 

function NotificationManager() {
  const [notificationStatus, setNotificationStatus] = useState('pending');
  const [token, setToken] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    checkNotificationStatus();
    setupMessageListener();
  }, [currentUser]);

  const checkNotificationStatus = async () => {
    try {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
        return;
      }

      setNotificationStatus(Notification.permission);

      if (Notification.permission === 'granted' && currentUser) {
        const fcmToken = await requestNotificationPermission(currentUser.uid);
        setToken(fcmToken);
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      setNotificationStatus('error');
    }
  };

  const setupMessageListener = () => {
    onMessageListener()
      .then((payload) => {
        // Handle foreground messages
        const { title, body } = payload.notification;
        new Notification(title, {
          body,
          icon: '/icons/icon.svg',
        });
      })
      .catch((err) => console.error('Error setting up message listener:', err));
  };

  const handleEnableNotifications = async () => {
    try {
      if (!currentUser) {
        alert('Please sign in to enable notifications');
        return;
      }

      const fcmToken = await requestNotificationPermission(currentUser.uid);
      setToken(fcmToken);
      setNotificationStatus('granted');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setNotificationStatus('error');
    }
  };

  if (notificationStatus === 'unsupported') {
    console.log('Push notifications are not supported in this browser.');
  }
  
  console.log(`Status: ${notificationStatus}`);
  if (notificationStatus !== 'granted') {
    console.log('Enable Notifications');
  }
  
  if (token) {
    console.log('Notifications enabled for this device');
  }
  
  if (notificationStatus === 'unsupported') {
    console.log('Push notifications are not supported in this browser.');
  }
  
  console.log(`Status: ${notificationStatus}`);
  if (notificationStatus !== 'granted') {
    console.log('Enable Notifications');
  }
  
  if (token) {
    console.log('Notifications enabled for this device');
  }
  
}

export default NotificationManager;
