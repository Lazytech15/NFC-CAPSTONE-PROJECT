import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff, Computer } from 'lucide-react';
import { collection, query, onSnapshot, getFirestore } from 'firebase/firestore';
import styles from './Nfcscanner.module.css';

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",
  authDomain: "online-attendance-21f95.firebaseapp.com",
  databaseURL: "https://online-attendance-21f95-default-rtdb.firebaseio.com",
  projectId: "online-attendance-21f95",
  storageBucket: "online-attendance-21f95.appspot.com",
  messagingSenderId: "756223518392",
  appId: "1:756223518392:web:5e8d28c78f7eefb8be764d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const NFCScanner = () => {
  const [allScanners, setAllScanners] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [matchedScanners, setMatchedScanners] = useState([]);

  useEffect(() => {
    // Query for all scanners without the isActivated filter
    const scannersQuery = query(
      collection(db, 'ScannerDevices')
    );

    // Query for pending events
    const eventsQuery = query(
      collection(db, 'PendingEvent')
    );

    // Listen for all scanners
    const unsubscribeScanners = onSnapshot(scannersQuery, (snapshot) => {
      const scanners = snapshot.docs.map(doc => ({
        id: doc.id,
        uniqueId: doc.data().Unique_id,
        name: doc.data().name || `Scanner-${doc.data().Unique_id}`,
        isActivated: doc.data().isActivated || false,
        lastPing: new Date()
      }));
      setAllScanners(scanners);
    });

    // Listen for pending events
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        selectedEsp32: doc.data().selectedEsp32
      }));
      setPendingEvents(events);
    });

    return () => {
      unsubscribeScanners();
      unsubscribeEvents();
    };
  }, []);

  useEffect(() => {
    // Match all scanners with pending events
    const matched = allScanners.map(scanner => ({
      ...scanner,
      hasEvent: pendingEvents.some(event => event.selectedEsp32 === scanner.uniqueId)
    }));
    setMatchedScanners(matched);
  }, [allScanners, pendingEvents]);

  return (
    <div className={styles.nfc_container}>
      <div className={styles.network_header}>
        <h1>NFC Scanner Network Status</h1>
        <div className={styles.network_stats}>
          <div className={styles.stat_card}>
            <h3>Active Scanners</h3>
            <span className={`${styles.stat_value} ${styles.active}`}>
              {matchedScanners.filter(s => s.isActivated).length}
            </span>
          </div>
          <div className={styles.stat_card}>
            <h3>Total Scanners</h3>
            <span className={styles.stat_value}>
              {matchedScanners.length}
            </span>
          </div>
          <div className={styles.stat_card}>
            <h3>With Events</h3>
            <span className={`${styles.stat_value} ${styles.has_event}`}>
              {matchedScanners.filter(s => s.hasEvent).length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.server_section}>
        <div className={styles.server_icon}>
          <Server size={48} />
          <span>Web Server</span>
          <span className={styles.server_status}>Online</span>
        </div>
      </div>

      <div className={styles.scanners_grid}>
        {matchedScanners.map((scanner) => (
          <div 
            key={scanner.id} 
            className={`${styles.scanner_card} ${
              scanner.hasEvent ? styles.has_event : ''
            } ${!scanner.isActivated ? styles.inactive : ''}`}
          >
            <div className={styles.scanner_icon}>
              <Computer size={32} />
              {scanner.isActivated ? (
                <Wifi 
                  className={`${styles.status_icon} ${styles.active}`} 
                  size={16} 
                />
              ) : (
                <WifiOff 
                  className={`${styles.status_icon} ${styles.inactive}`} 
                  size={16} 
                />
              )}
            </div>
            <div className={styles.scanner_info}>
              <h3>{scanner.name}</h3>
              <p className={styles.scanner_id}>{scanner.uniqueId}</p>
              <p className={`${styles.scanner_status} ${
                scanner.hasEvent ? styles.has_event : 
                scanner.isActivated ? styles.active : styles.inactive
              }`}>
                {scanner.hasEvent ? 'Has Pending Event' : 
                 scanner.isActivated ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFCScanner;
