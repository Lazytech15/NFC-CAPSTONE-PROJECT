import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

function PWARegistration() {
  const [registrationStatus, setRegistrationStatus] = useState('pending');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        const updateSW = registerSW({
          onNeedRefresh() {
            setUpdateAvailable(true);
          },
          onOfflineReady() {
            console.log('App ready to work offline');
            setRegistrationStatus('offline-ready');
          },
          onRegistered(registration) {
            console.log('Service Worker registered:', registration);
            setRegistrationStatus('registered');

            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          },
          onRegisterError(error) {
            console.error('Service Worker registration failed:', error);
            setRegistrationStatus('error');
          }
        });

        // Store update function
        window.updateSW = () => {
          updateSW(true);
          setUpdateAvailable(false);
        };
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setRegistrationStatus('error');
      }
    };

    registerServiceWorker();
  }, []);

  // Show update notification
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50 p-4 bg-blue-600 text-white rounded-lg shadow-lg">
        <p className="font-semibold">New version available!</p>
        <button
          onClick={() => window.updateSW()}
          className="mt-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          Update now
        </button>
      </div>
    );
  }

  // Show registration status in development
  if (import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 left-4 z-50 p-2 bg-gray-100 rounded-md text-sm">
        PWA Status: {registrationStatus}
      </div>
    );
  }

  return null;
}

export default PWARegistration;