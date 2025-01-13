import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Edit2, Trash2, X, Image as ImageIcon, Smartphone, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import styles from './Eventlist.module.css';
import { getDatabase, ref, onValue, off, set, push, remove, get } from 'firebase/database';
import Buttons from '../Button/Button.module.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [scannerStatus, setScannerStatus] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();
  const [showDeviceChoice, setShowDeviceChoice] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerChoice, setScannerChoice] = useState(null);
  const db = getFirestore();
  const realtimeDb = getDatabase();
  const auth = getAuth();

  useEffect(() => {
    // Check if NFC is supported on mount
    checkNFCSupport();
  }, []);

  const checkNFCSupport = () => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      // Cleanup realtime listeners when component unmounts
      if (selectedEvent) {
        const scannerRef = ref(realtimeDb, `scanned-cards/${selectedEvent.selectedscanner}`);
        off(scannerRef);
      }
    };
  }, []);

  // Add new function to fetch student data
  const fetchStudentData = async (nfcId) => {
    try {
      const registeredStudentsRef = collection(db, 'RegisteredStudent');
      const q = query(registeredStudentsRef, where('currentnfcId', '==', nfcId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        return {
          studentId: studentDoc.data().studentId,
          name: studentDoc.data().name,
          course: studentDoc.data().course,
          section: studentDoc.data().section,
          campus: studentDoc.data().campus
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching student data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
      
      onValue(attendanceRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Filter out metadata fields and convert to array
          const rawAttendanceArray = Object.entries(data)
            .filter(([key]) => key !== 'eventId' && key !== 'eventName' && key !== 'startTime')
            .map(([key, value]) => ({
              id: key,
              ...value
            }))
            .sort((a, b) => new Date(b.dateTimeIn) - new Date(a.dateTimeIn));

          // Fetch student data for each attendance record
          const enrichedAttendanceArray = await Promise.all(
            rawAttendanceArray.map(async (record) => {
              const studentData = await fetchStudentData(record.nfcId);
              if (studentData) {
                return {
                  ...record,
                  ...studentData
                };
              }
              return {
                ...record,
                studentId: 'Unknown',
                name: 'Unknown Student',
                course: 'N/A',
                section: 'N/A',
                campus: 'N/A'
              };
            })
          );

          setAttendanceData(enrichedAttendanceArray);
          console.log('Enriched attendance data:', enrichedAttendanceArray);
        } else {
          setAttendanceData([]);
        }
      });

      return () => {
        off(attendanceRef);
      };
    }
  }, [selectedEvent]);

    useEffect(() => {
      if (selectedScanner && selectedEvent) {
        const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedScanner.name}/attendees`);
        
        onValue(attendanceRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Convert object to array and filter for current event
            const attendanceArray = Object.entries(data)
              .map(([key, value]) => ({
                id: key,
                ...value
              }))
              .filter(record => record.eventId === selectedEvent.id);
            
            setAttendanceData(attendanceArray);
          } else {
            setAttendanceData([]);
          }
        });
      }
    }, [selectedScanner, selectedEvent]);

  // Add new helper function to check if student is registered
  const getStudentData = async (nfcId) => {
    try {
      const registeredStudentsRef = collection(db, 'RegisteredStudent');
      const q = query(registeredStudentsRef, where('currentnfcId', '==', nfcId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Return the first matching student's data
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

  // Add function to check for duplicate attendance
  const checkDuplicateAttendance = async (nfcId, eventName) => {
    try {
      const attendanceRef = ref(realtimeDb, `scanned-cards/${eventName}`);
      const snapshot = await get(attendanceRef);
      
      if (snapshot.exists()) {
        const attendanceData = snapshot.val();
        // Check if any existing record has the same nfcId
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

    const setupAttendanceListener = () => {
      if (!selectedEvent) return;
  
      const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedEvent.selectedscanner}/attendees`);
      
      onValue(attendanceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const attendanceArray = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value
            }))
            .filter(record => record.eventId === selectedEvent.id)
            .sort((a, b) => new Date(b.dateTimeIn) - new Date(a.dateTimeIn)); // Sort by latest first
          
          setAttendanceData(attendanceArray);
        } else {
          setAttendanceData([]);
        }
      });
    };

    const checkScannerDevice = async () => {
      try {
        const scannersRef = collection(db, 'ScannerDevices');
        const querySnapshot = await getDocs(scannersRef);
        
        querySnapshot.forEach((doc) => {
          const scannerData = doc.data();
          if (scannerData.name === selectedEvent.selectedscanner) {
            setSelectedScanner({
              id: doc.id,
              ...scannerData
            });
            
            if (scannerData.isActivated && scannerData.job) {
              setScannerStatus('in-use');
            } else if (scannerData.isActivated && !scannerData.job) {
              setScannerStatus('ready');
            } else {
              setScannerStatus('inactive');
            }
          }
        });
      } catch (error) {
        console.error('Error checking scanner device:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const eventsRef = collection(db, 'PendingEvent');
        const q = query(eventsRef, where('createdBy', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/dashboard/edit-event/${eventId}`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete all attendance records.')) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'PendingEvent', eventId));
        
        // Delete from Realtime Database using event name
        if (selectedEvent) {
          const eventRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
          await remove(eventRef);
        }
        
        fetchEvents();
        setSelectedEvent(null);
        setAttendanceData([]);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };


  const handleContinue = (event) => {
    setShowDeviceChoice(true);
    setSelectedEvent(event);
  };

  const handleDeviceChoice = async (choice) => {
    setScannerChoice(choice);
    
    try {
      // Update event status to in-progress
      await updateDoc(doc(db, 'PendingEvent', selectedEvent.id), {
        status: 'ongoing'
      });

      // Initialize event in realtime database
      const eventRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
      await set(eventRef, {
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        startTime: new Date().toISOString(),
      });

      if (choice === 'scanner') {
        if (scannerStatus === 'in-use') {
          alert('This scanner is currently being used by another job');
          return;
        }

        if (scannerStatus !== 'ready') {
          alert('Scanner is not activated or unavailable');
          return;
        }

        if (selectedScanner) {
          await updateDoc(doc(db, 'ScannerDevices', selectedScanner.id), {
            job: selectedEvent.id
          });
        }
      } else if (choice === 'mobile') {
        if (!nfcSupported) {
          alert('Your device does not support NFC scanning');
          return;
        }
        setIsScanning(true);
        startNFCScanning();
      }
    } catch (error) {
      console.error('Error initializing event:', error);
      alert('Error starting the event');
    }
    
    setShowDeviceChoice(false);
  };

  const startNFCScanning = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", async ({ message }) => {
        try {
          const nfcId = new TextDecoder().decode(message.records[0].data);
          
          // Check for duplicate attendance
          const isDuplicate = await checkDuplicateAttendance(nfcId, selectedEvent.eventName);
          if (isDuplicate) {
            alert('This card has already been scanned for this event.');
            return;
          }
  
          // Get student data
          const studentData = await getStudentData(nfcId);
          if (!studentData) {
            alert('This NFC card is not registered to any student.');
            return;
          }
  
          // Save scanned data to realtime database under event name
          const scanDataRef = ref(realtimeDb, `scanned-cards/${selectedEvent.eventName}`);
          const attendanceRecord = {
            nfcId,
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
          
          // Add this line to save the event to student's records
          await saveEventToStudent(studentData, selectedEvent, new Date().toISOString());
          
          alert(`Successfully recorded attendance for ${studentData.name}`);
        } catch (error) {
          console.error('Error processing NFC data:', error);
          alert('Error scanning NFC card');
        }
      });
    } catch (error) {
      console.error('Error starting NFC scan:', error);
      alert('Error initializing NFC scanner');
      setIsScanning(false);
    }
  };

  const handleComplete = async (event) => {
    try {
      // Update Firestore status
      await updateDoc(doc(db, 'PendingEvent', event.id), {
        status: 'completed'
      });

      // Clear scanner job if it exists
      if (selectedScanner) {
        await updateDoc(doc(db, 'ScannerDevices', selectedScanner.id), {
          job: null
        });
      }

      // Remove event data from realtime database
      const eventRef = ref(realtimeDb, `scanned-cards/${event.eventName}`);
      await remove(eventRef);

      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error completing event:', error);
    }
  };

  const saveEventToStudent = async (studentData, eventData, attendanceTime) => {
    try {
      const studentEventData = {
        eventId: eventData.id,
        eventName: eventData.eventName,
        description: eventData.description,
        location: eventData.locations,
        imageUrl: eventData.imageUrl,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        createdBy: eventData.createdBy,
        status: 'attended',
        attendanceRecorded: attendanceTime,
        studentId: studentData.studentId,
        studentName: studentData.name,
        course: studentData.course,
        section: studentData.section,
        campus: studentData.campus
      };
  
      await addDoc(collection(db, 'StudentEvents'), studentEventData);
    } catch (error) {
      console.error('Error saving event to student records:', error);
      throw error;
    }
  };

  return (
    <div className={styles.event_list_container}>
      <h2>Event List</h2>
      
      <div className={styles.events_grid}>
        {events.map((event) => (
          <div 
            key={event.id} 
            className={`${styles.event_card} ${selectedEvent?.id === event.id ? styles.selected : ''}`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className={styles.card_content}>
              <div className={styles.card_image_container}>
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.eventName} 
                    className={styles.card_image}
                  />
                ) : (
                  <div className={styles.card_image_placeholder}>
                    <ImageIcon size={32} />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className={styles.card_basic_info}>
                <h3>{event.eventName}</h3>
                <p>Status: <span className={styles[event.status]}>{event.status}</span></p>
                <p>Created By: {event.name}</p>
                <p>Created: {formatDate(event.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Device Choice Modal */}
      {showDeviceChoice && (
        <div className={`${styles.modal_overlay} ${styles.device_choice_overlay}`}>
          <div className={`${styles.modal_content} ${styles.device_choice_modal}`}>
            <h3>Choose Scanning Device</h3>
            <div className={styles.device_choice_buttons}>
              <button
                className={`${Buttons.buttons} ${styles.device_button}`}
                onClick={() => handleDeviceChoice('scanner')}
              >
                <QrCode size={24} />
                Use Hardware Scanner
              </button>
              <button
                className={`${Buttons.buttons} ${styles.device_button}`}
                onClick={() => handleDeviceChoice('mobile')}
                disabled={!nfcSupported}
              >
                <Smartphone size={24} />
                Use Mobile NFC
                {!nfcSupported && <span className={styles.unsupported_text}>(Not Supported)</span>}
              </button>
            </div>
            <button 
              className={`${Buttons.buttons} ${styles.close_button}`}
              onClick={() => {
                setShowDeviceChoice(false);
                setSelectedEvent(null);
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* NFC Scanner Overlay */}
      {isScanning && (
        <div className={`${styles.modal_overlay} ${styles.nfc_scanner_overlay}`}>
          <div className={styles.nfc_scanner_content}>
            <div className={styles.nfc_animation}>
              <div className={styles.phone_outline}>
                <div className={styles.nfc_waves}></div>
              </div>
            </div>
            <p>Place NFC card near your device</p>
            <button 
              className={`${Buttons.buttons} ${styles.cancel_button}`}
              onClick={() => setIsScanning(false)}
            >
              Cancel Scanning
            </button>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && !showDeviceChoice && (
        <div className={styles.modal_overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3>{selectedEvent.eventName}</h3>
              <button 
                className={`${Buttons.buttons} ${styles.close_button}`}
                onClick={() => setSelectedEvent(null)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modal_image_container}>
              {selectedEvent.imageUrl ? (
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.eventName}
                  className={styles.modal_image}
                />
              ) : (
                <div className={styles.modal_image_placeholder}>
                  <ImageIcon size={48} />
                  <span>No Image Available</span>
                </div>
              )}
            </div>
            
            <div className={styles.event_info}>
              <p><strong>Status:</strong> <span className={styles[selectedEvent.status]}>{selectedEvent.status}</span></p>
              <p><strong>Location:</strong> {selectedEvent.locations}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Start Time:</strong> {selectedEvent.startTime}</p>
              <p><strong>End Time:</strong> {selectedEvent.endTime}</p>
            </div>

            {scannerStatus && (
              <div className={styles.scanner_status}>
                <div className={`${styles.status_indicator} ${styles[scannerStatus]}`} />
                <span>Scanner Status: {scannerStatus}</span>
              </div>
            )}

            <div className={styles.modal_actions}>
              <button
                className={`${Buttons.buttons} ${styles.continue_button}`}
                onClick={() => handleContinue(selectedEvent)}
                disabled={selectedEvent.status === 'completed' || scannerStatus === 'in-use'}
              >
                Continue
              </button>

              <button
                className={`${Buttons.buttons} ${styles.complete_button}`}
                onClick={() => handleComplete(selectedEvent)}
                disabled={selectedEvent.status === 'completed'}
              >
                Complete
              </button>

              <button
                className={`${Buttons.buttons} ${styles.delete_button}`}
                onClick={() => handleDelete(selectedEvent.id)}
              >
                Delete
              </button>
            </div>

            <div className={styles.attendance_section}>
              <h4>Attendance Records ({attendanceData.length})</h4>
              <div className={styles.table_container}>
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Campus</th>
                      <th>Time In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((attendee) => (
                      <tr key={attendee.id}>
                        <td>{attendee.studentId}</td>
                        <td>{attendee.name}</td>
                        <td>{attendee.course}</td>
                        <td>{attendee.section}</td>
                        <td>{attendee.campus}</td>
                        <td>{formatDate(attendee.dateTimeIn)}</td>
                      </tr>
                    ))}
                    {attendanceData.length === 0 && (
                      <tr>
                        <td colSpan="10" className={styles.no_data}>
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
