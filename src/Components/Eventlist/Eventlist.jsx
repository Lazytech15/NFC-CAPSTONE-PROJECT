import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import styles from './Eventlist.module.css';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [scannerStatus, setScannerStatus] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();
  const db = getFirestore();
  const realtimeDb = getDatabase();
  const auth = getAuth();

  useEffect(() => {
    fetchEvents();
    return () => {
      // Cleanup realtime listeners when component unmounts
      if (selectedScanner) {
        const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedScanner.Unique_id}/attendees`);
        off(attendanceRef);
      }
    };
  }, []);

    // Effect to check scanner status when an event is selected
    useEffect(() => {
      if (selectedEvent) {
        checkScannerDevice();
      }
    }, [selectedEvent]);

    useEffect(() => {
      if (selectedScanner && selectedEvent) {
        const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedScanner.Unique_id}/attendees`);
        
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
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'PendingEvent', eventId));
        fetchEvents();
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleContinue = async (event) => {
    try {
      // Check if scanner is available
      if (scannerStatus === 'in-use') {
        alert('This scanner is currently being used by another job');
        return;
      }

      if (scannerStatus !== 'ready') {
        alert('Scanner is not activated or unavailable');
        return;
      }

      // Update event status
      await updateDoc(doc(db, 'PendingEvent', event.id), {
        status: 'in-progress'
      });

      // Create realtime database reference for scanned cards
      if (selectedScanner) {
        const scanDataRef = ref(realtimeDb, `scanned-cards/${selectedScanner.Unique_id}`);
        
        // Initialize the collection in realtime database
        await set(scanDataRef, {
          eventId: event.id,
          eventName: event.eventName,
          startTime: new Date().toISOString(),
          scannedCards: []
        });

        // Update scanner job status
        await updateDoc(doc(db, 'ScannerDevices', selectedScanner.id), {
          job: event.id
        });
      }

      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleComplete = async (event) => {
    try {
      await updateDoc(doc(db, 'PendingEvent', event.id), {
        status: 'completed'
      });
      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error completing event:', error);
    }
  };

  return (
    <div className={styles.event_list_container}>
      <h2>Event List</h2>
      
      <div className={styles.events_grid}>
        {events.map((event) => (
          <div 
            key={event.id} 
            className={styles.event_card}
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
                <p>ID: {event.id}</p>
                <p>Created By: {event.name}</p>
                <p>Created: {formatDate(event.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className={styles.modal_overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.close_button}
              onClick={() => setSelectedEvent(null)}
            >
              <X size={24} />
            </button>
            
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
            
            <h3>{selectedEvent.eventName}</h3>
            
            <div className={styles.event_info}>
              <p><strong>Location:</strong> {selectedEvent.locations}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Start Time:</strong> {selectedEvent.startTime}</p>
              <p><strong>End Time:</strong> {selectedEvent.endTime}</p>
            </div>

            {scannerStatus && (
              <div className={styles.scanner_status}>
                <div className={`${styles.status_indicator} ${styles[scannerStatus]}`} />
                <span>
                  {scannerStatus === 'in-use' && 'Scanner is currently in use'}
                  {scannerStatus === 'ready' && 'Scanner is ready'}
                  {scannerStatus === 'inactive' && 'Scanner is inactive'}
                </span>
              </div>
            )}

            <div className={styles.modal_actions}>
              <button
                className={styles.continue_btn}
                onClick={() => handleContinue(selectedEvent)}
              >
                Continue
              </button>

              <button
                className={styles.complete_btn}
                onClick={() => handleComplete(selectedEvent)}
              >
                Complete
              </button>

              <button
                className={styles.complete_btn}
                onClick={() => handleDelete(selectedEvent.id)}
              >
               Delete event
              </button>
            </div>

            <br />

            <div className={styles.table_container}>
              <table>
                <thead>
                  <tr>
                    <th>STUDENT ID</th>
                    <th>STUDENT NAME</th>
                    <th>COURSE</th>
                    <th>CAMPUS</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((attendee, index) => (
                    <tr key={attendee.id}>
                      <td>{attendee.studentId}</td>
                      <td>{attendee.studentName}</td>
                      <td>{attendee.course}</td>
                      <td>{attendee.campus}</td>
                      <td>{formatDate(attendee.dateTimeIn)}</td>
                      <td>
                        <div className={styles.action_buttons}>
                          <button
                            className={styles.edit_btn}
                            onClick={() => handleEdit(selectedEvent.id)}
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
