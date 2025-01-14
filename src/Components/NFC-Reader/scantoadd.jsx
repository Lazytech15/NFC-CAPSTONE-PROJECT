import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { getDatabase, ref, push, get, onValue, set } from 'firebase/database';
import { format } from 'date-fns';
import styles from './Nfcreader.module.css';
import Buttons from '../Button/Button.module.css';
import { app } from '/utils/firebase-config.js';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

const NFCReaderAttendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const db = getFirestore();
  const realtimeDb = getDatabase();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
      
      onValue(attendanceRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Filter out metadata fields and convert to array
          const attendanceArray = Object.entries(data)
            .filter(([key]) => key !== 'eventId' && key !== 'eventName' && key !== 'startTime')
            .map(([key, value]) => ({
              id: key,
              ...value
            }))
            .sort((a, b) => new Date(b.dateTimeIn) - new Date(a.dateTimeIn));

          setAttendanceData(attendanceArray);
        } else {
          setAttendanceData([]);
        }
      });

      return () => {
        // Cleanup listener
        const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
        off(attendanceRef);
      };
    }
  }, [selectedEvent]);

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

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please enter a student ID');
      return;
    }

    if (selectedEvent.status === 'Pending') {
      setError('Cannot record attendance for pending events');
      return;
    }

    try {
      const studentQuery = query(
        collection(db, "RegisteredStudent"),
        where("studentId", "==", studentId)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setError('Student ID not found');
        setShowPasswordPrompt(false);
        return;
      }

      setShowPasswordPrompt(true);
      setError(null);
    } catch (error) {
      setError('Error checking student ID: ' + error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter password');
      return;
    }

    try {
      const studentQuery = query(
        collection(db, "RegisteredStudent"),
        where("studentId", "==", studentId),
        where("customPassword", "==", password)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setError('Invalid password');
        return;
      }

      const studentData = studentSnapshot.docs[0].data();
      
      // Check for duplicate attendance
      const isDuplicate = await checkDuplicateAttendance(studentData.currentnfcId);
      if (isDuplicate) {
        setError('Student has already attended this event');
        return;
      }

      // Record attendance
      await recordAttendance(studentData);
      
      setShowPasswordPrompt(false);
      setPassword('');
      setStudentId('');
      setStatus('Attendance recorded successfully');
      setShowModal(false);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Attendance recorded successfully'
      });
    } catch (error) {
      setError('Error verifying password: ' + error.message);
    }
  };

  const checkDuplicateAttendance = async (nfcId) => {
    try {
      const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
      const snapshot = await get(attendanceRef);
      
      if (snapshot.exists()) {
        const attendanceData = snapshot.val();
        return Object.values(attendanceData).some(record => 
          record.nfcId === nfcId && record !== 'eventId' && record !== 'eventName' && record !== 'startTime'
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicate attendance:', error);
      return false;
    }
  };

  const recordAttendance = async (studentData) => {
    try {
      // Save attendance to realtime database
      const scanDataRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
      const attendanceRecord = {
        nfcId: studentData.currentnfcId,
        dateTimeIn: new Date().toISOString(),
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        studentId: studentData.studentId,
        studentName: studentData.name,
        course: studentData.course,
        section: studentData.section,
        campus: studentData.campus
      };

      await push(scanDataRef, attendanceRecord);

      // Save to student's records
      await saveEventToStudent(studentData);
    } catch (error) {
      throw new Error('Failed to record attendance: ' + error.message);
    }
  };

  const saveEventToStudent = async (studentData) => {
    try {
      const studentEventData = {
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        description: selectedEvent.description,
        location: selectedEvent.locations,
        imageUrl: selectedEvent.imageUrl,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        createdBy: selectedEvent.createdBy,
        status: 'attended',
        attendanceRecorded: new Date().toISOString(),
        studentId: studentData.studentId,
        studentName: studentData.name,
        course: studentData.course,
        section: studentData.section,
        campus: studentData.campus
      };

      await addDoc(collection(db, 'StudentEvents'), studentEventData);
    } catch (error) {
      throw error;
    }
  };



  const handleEventClick = async (event) => {
    setSelectedEvent(event);
  };

  const startNFCRead = async () => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    if (selectedEvent.status === 'Pending') {
      setError('Cannot record attendance for pending events');
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
          
          // Check for duplicate attendance
          const isDuplicate = await checkDuplicateAttendance(nfcId);
          if (isDuplicate) {
            throw new Error('Student has already attended this event');
          }

          // Get student data
          const studentData = await getStudentData(nfcId);
          if (!studentData) {
            throw new Error('Unregistered NFC card');
          }

          // Record attendance
          await recordAttendance(studentData);

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Successfully recorded attendance for ${studentData.name}`
          });
        } catch (error) {
          setError(error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message
          });
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

  const getStudentData = async (nfcId) => {
    try {
      const registeredStudentsRef = collection(db, 'RegisteredStudent');
      const q = query(registeredStudentsRef, where('currentnfcId', '==', nfcId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching student data:', error);
      return null;
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
        const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.selectedscanner}/attendees`);
        const attendanceRecord = {
          studentId: verifiedUser.studentId || verifiedUser.adminId || verifiedUser.teacherId,
          studentName: verifiedUser.name,
          course: verifiedUser.course || verifiedUser.department,
          campus: verifiedUser.campus,
          dateTimeIn: new Date().toISOString(),
          role: verifiedUser.role,
          eventId: selectedEvent.id,
          section: verifiedUser.section,
          eventName: selectedEvent.eventName
        };
  
        await push(attendanceRef, attendanceRecord);
        setStatus('Attendance recorded successfully');
        setVerifiedUser(null);
        setShowVerificationModal(false);
      } catch (error) {
        setError('Failed to record attendance: ' + error.message);
      }
    };
  
    const cancelVerification = () => {
      setVerifiedUser(null);
      setShowVerificationModal(false);
      setStatus('');
    };

// When a user is verified, show the verification modal
  useEffect(() => {
    if (verifiedUser) {
      setShowVerificationModal(true);
    }
  }, [verifiedUser]);

  return (
      <div className={styles.attendance_container}>
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
          <div className={styles.selectedEventContainer}>
            <div className={styles.controls}>
              <h2>Event : {selectedEvent.eventName}</h2>
              {selectedEvent.status !== 'Pending' && (
                <>
                  <button
                    onClick={startNFCRead}
                    disabled={isReading}
                    className={Buttons.buttons}
                  >
                    {isReading ? 'Reading...' : 'Scan Attendance'}
                  </button>
    
                  <button
                    onClick={() => setShowModal(true)}
                    className={Buttons.buttons}
                  >
                    Manual Entry
                  </button>
                </>
              )}
            </div>
    
            {/* Manual Entry Modal */}
            {showModal && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h3>Manual Entry</h3>
                    <button 
                      onClick={() => {
                        setShowModal(false);
                        setShowPasswordPrompt(false);
                        setStudentId('');
                        setPassword('');
                        setError(null);
                      }}
                      className={styles.closeButton}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className={styles.modalContent}>
                    {!showPasswordPrompt ? (
                      <form onSubmit={handleManualEntry}>
                        <div className={styles.formGroup}>
                          <label htmlFor="studentId">Student ID</label>
                          <input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Enter Student ID"
                            className={styles.input}
                          />
                        </div>
                        <button type="submit" className={Buttons.buttons}>
                          Verify ID
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handlePasswordSubmit}>
                        <div className={styles.formGroup}>
                          <label htmlFor="password">Password</label>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className={styles.input}
                          />
                        </div>
                        <button type="submit" className={Buttons.buttons}>
                          Submit
                        </button>
                      </form>
                    )}
                    {error && <div className={styles.error}>{error}</div>}
                  </div>
                </div>
              </div>
            )}
    
            {/* User Verification Modal */}
            {showVerificationModal && verifiedUser && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h3>Verify Attendance</h3>
                    <button 
                      onClick={cancelVerification}
                      className={styles.closeButton}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className={styles.modalContent}>
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
                      <div className={styles.buttonGroup}>
                        <button 
                          onClick={confirmAttendance}
                          className={Buttons.buttons}
                        >
                          Confirm Attendance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
    
            {/* Attendance Table or No Records Message */}
            {attendanceData.length === 0 ? (
              <div className={styles.noRecords}>
                Oops there is no record yet!
              </div>
            ) : (
              <table className={styles.attendanceTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Course/Dept</th>
                    <th>Campus</th>
                    <th>Section</th>
                    <th>Role</th>
                    <th>Time In</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map(record => (
                    <tr key={record.id}>
                      <td>{record.studentId}</td>
                      <td>{record.studentName}</td>
                      <td>{record.course}</td>
                      <td>{record.campus}</td>
                      <td>{record.section}</td>
                      <td>{record.role}</td>
                      <td>{format(new Date(record.dateTimeIn), 'PPpp')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
    
        {status && <div className={styles.status}>{status}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  };
  
  export default NFCReaderAttendance;