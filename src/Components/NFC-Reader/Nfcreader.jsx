import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import styles from './Nfcreader.module.css';
import SneakingAttendance from './scantoadd.jsx'
import Buttons from '../Button/Button.module.css';

import { app } from '/utils/firebase-config.js';
const db = getFirestore(app);

const NFCReader = () => {
  const [studentData, setStudentData] = useState(null);
  const [status, setStatus] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState(null);

  const startNFCRead = async () => {
    // if (!('NDEFReader' in window)) {
    //   setError('NFC is not supported on this device');
    //   return;
    // }

    try {
      setIsReading(true);
      setStatus('Waiting for NFC card...');
      setError(null);
      
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", async ({ message }) => {
        try {
          // Get the document ID from the NFC tag
          const docId = message.records.find(
            record => record.recordType === "text"
          );

          if (!docId) {
            throw new Error('Invalid NFC card: No student data found');
          }

          const studentId = new TextDecoder().decode(docId.data);
          setStatus('Retrieving student data...');

          // Fetch student data from Firestore
          const docRef = doc(db, 'RegisteredStudent', studentId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setStudentData(data);
            setStatus('Student data retrieved successfully');
          } else {
            throw new Error('No student record found for this card');
          }
        } catch (error) {
          setError(error.message);
          setStudentData(null);
        } finally {
          setIsReading(false);
          ndef.stop();
        }
      });

    } catch (error) {
      setError(error.message);
      setIsReading(false);
    }
  };

  const resetReader = () => {
    setStudentData(null);
    setStatus('');
    setError(null);
    setIsReading(false);
  };

  return (
    <>
    <div className={styles.container}>
      <h1>Student NFC Reader</h1>

      {/* Status Display */}
      {status && (
        <div className={`${styles.status} ${isReading ? styles.reading : ''}`}>
          {status}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Student Data Display */}
      {studentData && (
        <div className={styles.studentInfo}>
          <h2>Student Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span>Name:</span>
              <span>{studentData.studentName}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Student ID:</span>
              <span>{studentData.studentId}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Email:</span>
              <span>{studentData.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Course:</span>
              <span>{studentData.course}</span>
            </div>
            <div classNam={styles.infoRow}>
              <span>Section:</span>
              <span>{studentData.section}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Campus:</span>
              <span>{studentData.campus}</span>
            </div>
            {studentData.selfieUrl && (
              <div className={styles.selfie}>
                <img src={studentData.selfieUrl} alt="Student" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className={styles.controls}>
        <button
          onClick={startNFCRead}
          disabled={isReading || !('NDEFReader' in window)}
          className={`${Buttons.buttons} ${Buttons.buttons}`}
        >
          {isReading ? 'Reading...' : 'Scan NFC Card'}
        </button>

        {studentData && (
          <button
            onClick={resetReader}
            className={`${Buttons.buttons} ${Buttons.buttons}`}
          >
            Clear & Scan New Card
          </button>
        )}
      </div>
    </div>
      <div className={styles.Sneakadd}>
        <SneakingAttendance />
      </div>
    </>
  );
};

export default NFCReader;
