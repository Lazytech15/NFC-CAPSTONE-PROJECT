import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { RotateCw } from 'lucide-react';

function PWARegistration() {
  const [registrationStatus, setRegistrationStatus] = useState('pending');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let swRegistration = null;
    let updateInterval;

    const checkForUpdates = async () => {
      if (!swRegistration) return;
      
      setCheckingUpdate(true);
      try {
        await swRegistration.update();
        console.log('Checked for updates');
      } catch (error) {
        console.error('Error checking for updates:', error);
      } finally {
        setCheckingUpdate(false);
      }
    };

    const registerServiceWorker = async () => {
      try {
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setUpdateAvailable(true);
            // Automatically update if preferred
            window.updateSW();
          },
          onOfflineReady() {
            console.log('App ready to work offline');
            setRegistrationStatus('offline-ready');
          },
          onRegistered(registration) {
            console.log('Service Worker registered:', registration);
            swRegistration = registration;
            setRegistrationStatus('registered');

            // Initial check for updates
            checkForUpdates();

            // Check for updates every 15 minutes
            updateInterval = setInterval(checkForUpdates, 15 * 60 * 1000);
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

    // Cleanup interval on component unmount
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <>
      {/* Refresh Button */}
      {/* <button
        onClick={handleRefresh}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem',
          color: isRefreshing ? 'gray' : '#6B7280',
          transition: 'color 0.2s',
          borderRadius: '9999px',
          backgroundColor: isRefreshing ? '#F3F4F6' : 'transparent',
          outline: 'none',
          boxShadow: isRefreshing ? '0 0 0 2px #E5E7EB' : 'none'
        }}
        aria-label="Refresh page"
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#374151';
          e.currentTarget.style.backgroundColor = '#F3F4F6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#6B7280';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 2px #E5E7EB';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <RotateCw
          style={{
            width: '1.25rem',
            height: '1.25rem',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }}
        />
      </button> */}

      {/* Update Notification */}
      {updateAvailable && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 50,
          padding: '1rem',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 600 }}>New version available!</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => window.updateSW()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#2563eb',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ebf8ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Update now
            </button>
            {checkingUpdate && (
              <span style={{ fontSize: '0.875rem', alignSelf: 'center' }}>
                Checking for updates...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Development Status Indicator */}
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          zIndex: 50,
          padding: '0.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem'
        }}>
          PWA Status: {registrationStatus}
          {checkingUpdate && ' (Checking for updates...)'}
        </div>
      )}
    </>
  );
}

export default PWARegistration;