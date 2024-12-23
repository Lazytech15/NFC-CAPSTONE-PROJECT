import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import styles from './Nfcreader.module.css';
import Buttons from '../Button/Button.module.css';
import { app } from '/utils/firebase-config.js';


const NFCReaderAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'PendingEvent');
      const eventsSnap = await getDocs(eventsRef);
      const eventsData = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      setError('Failed to fetch events: ' + error.message);
    }
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    try {
      // Fetch attendance data for the selected event
      const attendanceRef = collection(db, `PendingEvent/${event.id}/attendance`);
      const attendanceSnap = await getDocs(attendanceRef);
      const attendanceData = attendanceSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendanceData(attendanceData);
    } catch (error) {
      setError('Failed to fetch attendance data: ' + error.message);
    }
  };

  const startNFCRead = async () => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    try {
      setIsReading(true);
      setStatus('Waiting for NFC card...');
      setError(null);
      
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", async ({ message }) => {
        try {
          const nfcId = new TextDecoder().decode(message.records[0].data);
          const userRole = await checkUserRoleByNFC(nfcId);
          
          if (userRole) {
            setStatus('Retrieving user data...');
            const collectionName = `Registered${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
            const userQuery = query(
              collection(db, collectionName),
              where("currentnfcId", "==", nfcId)
            );
            const userSnap = await getDocs(userQuery);
            
            if (!userSnap.empty) {
              setVerifiedUser({
                ...userSnap.docs[0].data(),
                role: userRole
              });
            }
          } else {
            throw new Error('Unauthorized NFC card');
          }
        } catch (error) {
          setError(error.message);
          setVerifiedUser(null);
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

    const checkUserRoleByNFC = async (nfcId) => {
      try {
        const adminQuery = query(
          collection(db, "RegisteredAdmin"),
          where("currentnfcId", "==", nfcId)
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          return 'admin';
        }
    
        // Check in RegisteredTeacher collection
        const teacherQuery = query(
          collection(db, "RegisteredTeacher"),
          where("currentnfcId", "==", nfcId)
        );
        const teacherSnapshot = await getDocs(teacherQuery);
        if (!teacherSnapshot.empty) {
          return 'teacher';
        }
  
        // Check in RegisteredStudent collection
        const studentQuery = query(
          collection(db, "RegisteredStudent"),
          where("currentnfcId", "==", nfcId)
        );
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
          return 'student';
        }
    
        return null;
      } catch (error) {
        console.error("Error checking user role by NFC:", error);
        throw error;
      }
    };

  const confirmAttendance = async () => {
    if (!verifiedUser || !selectedEvent) return;

    try {
      const attendanceRef = collection(db, `PendingEvent/${selectedEvent.id}/attendance`);
      await addDoc(attendanceRef, {
        studentId: verifiedUser.studentId || verifiedUser.adminId || verifiedUser.teacherId,
        studentName: verifiedUser.name,
        course: verifiedUser.course || verifiedUser.department,
        campus: verifiedUser.campus,
        dateTimeIn: new Date().toISOString(),
        role: verifiedUser.role
      });

      // Refresh attendance data
      handleEventClick(selectedEvent);
      setVerifiedUser(null);
    } catch (error) {
      setError('Failed to record attendance: ' + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.eventsContainer}>
        <h2>Available Events</h2>
        {events.map(event => (
          <div 
            key={event.id} 
            className={`${styles.eventCard} ${selectedEvent?.id === event.id ? styles.selected : ''}`}
            onClick={() => handleEventClick(event)}
          >
            {event.imageUrl && <img src={event.imageUrl} alt={event.eventName} />}
            <div className={styles.eventInfo}>
              <h3>{event.eventName}</h3>
              <p>{event.description}</p>
              <small>Created: {format(new Date(event.createdAt), 'PPpp')}</small>
              <span className={styles.status}>{event.status}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className={styles.attendanceContainer}>
          <h2>Attendance for {selectedEvent.eventName}</h2>
          <table className={styles.attendanceTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Course/Dept</th>
                <th>Campus</th>
                <th>Time In</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(record => (
                <tr key={record.id}>
                  <td>{record.studentId}</td>
                  <td>{record.studentName}</td>
                  <td>{record.course}</td>
                  <td>{record.campus}</td>
                  <td>{format(new Date(record.dateTimeIn), 'PPpp')}</td>
                  <td>{record.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.controls}>
            <button
              onClick={startNFCRead}
              disabled={isReading}
              className={Buttons.buttons}
            >
              {isReading ? 'Reading...' : 'Scan Attendance'}
            </button>
          </div>
        </div>
      )}

      {verifiedUser && (
        <div className={styles.userVerification}>
          <h3>Verify Attendance</h3>
          <div className={styles.userInfo}>
            {verifiedUser.selfieUrl && (
              <img src={verifiedUser.selfieUrl} alt="User" className={styles.selfie} />
            )}
            <div className={styles.infoGrid}>
              <div>Name: {verifiedUser.name}</div>
              <div>ID: {verifiedUser.studentId || verifiedUser.adminId || verifiedUser.teacherId}</div>
              <div>Position: {verifiedUser.role}</div>
              <div>Campus: {verifiedUser.campus}</div>
              <div>Email: {verifiedUser.email}</div>
            </div>
            <button 
              onClick={confirmAttendance}
              className={Buttons.buttons}
            >
              Confirm Attendance
            </button>
          </div>
        </div>
      )}

      {status && <div className={styles.status}>{status}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default NFCReaderAttendance;