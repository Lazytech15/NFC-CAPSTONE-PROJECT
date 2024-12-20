// NotificationPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './Requestmessage.module.css';

const NotificationPrompt = ({ isEnabled, onEnable, onClose }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Show banner after 2 seconds of page load
    const bannerTimer = setTimeout(() => {
      if (!isEnabled) {
        setShowBanner(true);
      }
    }, 2000);

    // Show full screen prompt after 5 seconds if banner is ignored
    const fullScreenTimer = setTimeout(() => {
      if (!isEnabled && !isCollapsed) {
        setShowFullScreen(true);
        setShowBanner(false);
      }
    }, 5000);

    return () => {
      clearTimeout(bannerTimer);
      clearTimeout(fullScreenTimer);
    };
  }, [isEnabled]);

  const handleEnable = async () => {
    await onEnable();
    setShowBanner(false);
    setShowFullScreen(false);
  };

  const handleClose = () => {
    setShowFullScreen(false);
    setIsCollapsed(true);
    onClose();
  };

  if (isEnabled) return null;

  return (
    <>
      {/* Sticky Banner */}
      {showBanner && !showFullScreen && (
        <div className={`${styles.banner} ${isCollapsed ? styles.collapsed : ''}`}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerHeader}>
              <div className={styles.bannerTitle}>
                <Bell size={20} />
                <span>Stay Updated</span>
              </div>
              <button 
                className={styles.collapseButton}
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {!isCollapsed && (
              <div className={styles.bannerBody}>
                <p>Get notified about new messages and updates instantly</p>
                <div className={styles.bannerActions}>
                  <button 
                    className={styles.enableButton} 
                    onClick={handleEnable}
                  >
                    Enable Notifications
                  </button>
                  <button 
                    className={styles.laterButton}
                    onClick={() => setIsCollapsed(true)}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Screen Mobile Prompt */}
      {showFullScreen && (
        <div className={styles.fullScreen}>
          <div className={styles.fullScreenContent}>
            <button className={styles.closeButton} onClick={handleClose}>
              <X size={24} />
            </button>
            
            <div className={styles.promptIcon}>
              <Bell size={48} />
            </div>
            
            <h2>Don't miss important updates!</h2>
            
            <div className={styles.benefits}>
              <p>Enable notifications to:</p>
              <ul>
                <li>Get instant message alerts</li>
                <li>Stay updated on responses</li>
                <li>Never miss important announcements</li>
              </ul>
            </div>

            <div className={styles.promptActions}>
              <button 
                className={styles.mainButton}
                onClick={handleEnable}
              >
                Enable Notifications
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={handleClose}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationPrompt;