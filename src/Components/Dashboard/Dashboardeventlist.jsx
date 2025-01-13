import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import styles from './Dashboardeventlist.module.css';
import Loading from '../Loading/Loading';
import Buttons from '../Button/Button.module.css';
import { 
  Calendar, Clock, MapPin, User, Mail, Info, Users, Timer,
  ChevronDown, ChevronUp, X
} from 'lucide-react';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendedEvents, setAttendedEvents] = useState(new Set());
  const location = useLocation();
  const userData = location.state?.userData;
  const realtimeDb = getDatabase();

  const attendanceListeners = React.useRef({});

  // Ref to store all active listeners
  const activeListeners = React.useRef({});

    // Function to clean up listeners
    const cleanupListeners = () => {
      Object.values(activeListeners.current).forEach(listener => {
        if (listener.ref) {
          off(listener.ref);
        }
      });
      activeListeners.current = {};
    };

    // Function to check attendance for a specific event
    const checkEventAttendance = (event, studentId) => {
      const attendanceRef = ref(realtimeDb, `scanned-cards/${event.eventName}`);
      
      return new Promise((resolve) => {
        onValue(attendanceRef, (snapshot) => {
          if (snapshot.exists()) {
            const attendanceData = snapshot.val();
            const records = Object.values(attendanceData);
            const hasAttended = records.some(record => 
              record.studentId === studentId || 
              record.nfcId === userData?.currentnfcId
            );
            
            if (hasAttended) {
              setAttendedEvents(prev => new Set([...prev, event.id]));
              setAttendanceStatus(prev => ({
                ...prev,
                [event.id]: "✅ Your attendance has been recorded"
              }));
            }
            resolve(hasAttended);
          } else {
            resolve(false);
          }
        }, {
          onlyOnce: true
        });
      });
    };

// Function to set up realtime attendance monitoring
const setupAttendanceMonitoring = (event) => {
  if (activeListeners.current[event.id]) {
    return; // Already monitoring this event
  }

  const attendanceRef = ref(realtimeDb, `scanned-cards/${event.eventName}`);
  
  const callback = onValue(attendanceRef, (snapshot) => {
    if (snapshot.exists()) {
      const attendanceData = snapshot.val();
      const records = Object.values(attendanceData);
      const hasAttended = records.some(record => 
        record.studentId === userData?.studentId ||
        record.nfcId === userData?.currentnfcId
      );

      if (hasAttended) {
        setAttendedEvents(prev => new Set([...prev, event.id]));
        setAttendanceStatus(prev => ({
          ...prev,
          [event.id]: "✅ Your attendance has been recorded"
        }));
        setCheckingAttendance(prev => ({
          ...prev,
          [event.id]: false
        }));
      }
    }
  });

  activeListeners.current[event.id] = {
    ref: attendanceRef,
    callback
  };
};

useEffect(() => {
  const fetchAndMonitorEvents = async () => {
    if (!userData) {
      setError("User data not found");
      setIsLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const pendingEventsRef = collection(db, "PendingEvent");
      const querySnapshot = await getDocs(pendingEventsRef);
      
      const filteredEvents = [];
      
      for (const doc of querySnapshot.docs) {
        const eventData = doc.data();
        let shouldInclude = false;

        // Check event visibility
        if (eventData.PublicValue === "Public" && eventData.PublicTarget === "" || eventData.PublicValue === "Public" && eventData.PublicTarget === userData?.campus ) {
          shouldInclude = true;
        } else if (eventData.PublicValue === "Private") {
          if (eventData.PublicTarget === userData?.campus && eventData.ForUser === userData?.section) {
            shouldInclude = true;
          } else if (eventData.ForUser === userData?.section || eventData.ForUser === userData?.course) {
            shouldInclude = true;
          }
        }

        if (shouldInclude) {
          const event = {
            id: doc.id,
            ...eventData
          };
          
          filteredEvents.push(event);

          // Check initial attendance status
          await checkEventAttendance(event, userData.studentId);
          
          // Set up monitoring for ongoing events
          if (event.status === "Ongoing") {
            setupAttendanceMonitoring(event);
          }
        }
      }

      setEvents(filteredEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
      setIsLoading(false);
    }
  };

  fetchAndMonitorEvents();

  // Cleanup function
  return () => {
    cleanupListeners();
  };
}, [userData, realtimeDb]);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const db = getFirestore();
        const pendingEventsRef = collection(db, "PendingEvent");
        const querySnapshot = await getDocs(pendingEventsRef);
        
        const filteredEvents = [];
        
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          let shouldInclude = false;

          if (eventData.PublicValue === "Public") {
            shouldInclude = true;
          } else if (eventData.PublicValue === "Private") {
            if (eventData.PublicTarget === userData?.campus && eventData.ForUser === userData?.section) {
              shouldInclude = true;
            } else if (eventData.ForUser === userData?.section || eventData.ForUser === userData?.course) {
              shouldInclude = true;
            }
          }

          if (shouldInclude) {
            // Check if attendance is already recorded
            const attendanceRef = ref(realtimeDb, `scanned-cards/${eventData.selectedscanner}/attendees`);
            onValue(attendanceRef, (snapshot) => {
              if (snapshot.exists()) {
                const attendanceData = snapshot.val();
                const found = Object.values(attendanceData).some(
                  record => record.studentId === userData?.studentId
                );
                if (found) {
                  setAttendedEvents(prev => new Set([...prev, doc.id]));
                  setAttendanceStatus(prev => ({
                    ...prev,
                    [doc.id]: "✅ Your attendance has been recorded"
                  }));
                }
              }
            }, { onlyOnce: true });

            filteredEvents.push({
              id: doc.id,
              ...eventData
            });
          }
        });

        setEvents(filteredEvents);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
        setIsLoading(false);
      }
    };

    if (userData) {
      fetchEvents();
    } else {
      setError("User data not found");
      setIsLoading(false);
    }

    return () => {
      Object.values(attendanceListeners.current).forEach(listener => {
        if (listener.ref) {
          off(listener.ref);
        }
      });
    };
  }, [userData, realtimeDb]);

  const startAttendanceCheck = (event) => {
    if (!userData?.currentnfcId) {
      setAttendanceStatus(prev => ({
        ...prev,
        [event.id]: "No NFC ID found for your account"
      }));
      return;
    }

    setCheckingAttendance(prev => ({
      ...prev,
      [event.id]: true
    }));
    setAttendanceStatus(prev => ({
      ...prev,
      [event.id]: "Waiting for tap..."
    }));

    // Set up or refresh the monitoring for this event
    setupAttendanceMonitoring(event);
  };

  const cancelAttendanceCheck = (eventId) => {
    if (activeListeners.current[eventId]) {
      off(activeListeners.current[eventId].ref);
      delete activeListeners.current[eventId];
    }
    setCheckingAttendance(prev => ({
      ...prev,
      [eventId]: false
    }));
    setAttendanceStatus(prev => ({
      ...prev,
      [eventId]: null
    }));
  };

  const toggleEventDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  // if (isLoading) {
  //   return (
  //     <div className={styles.loadingContainer}>
  //       <Loading text="Loading events..." size="large" />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorMessage}>{error}</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyMessage}>No events available.</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Available Events</h1>
      </div>
      <div className={styles.eventGrid}>
        {events.map((event) => (
          <div 
            key={event.id} 
            className={`${styles.eventCard} ${attendedEvents.has(event.id) ? styles.eventAttended : ''}`}
          >
            {event.imageUrl && (
              <div className={styles.eventImage}>
                <img src={event.imageUrl} alt={event.eventName} />
              </div>
            )}
            <div className={styles.eventHeader}>
              <h2>{event.eventName}</h2>
              <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                {event.status}
              </span>
              <button 
                className={styles.expandButton}
                onClick={() => toggleEventDetails(event.id)}
              >
                {expandedEvent === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedEvent === event.id && (
              <div className={styles.expandedContent}>
                <div className={styles.eventInfo}>
                  <Calendar size={20} />
                  <div>
                    <span className={styles.label}>Date:</span>
                    <span>{event.startDate} to {event.endDate}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <Clock size={20} />
                  <div>
                    <span className={styles.label}>Time:</span>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <MapPin size={20} />
                  <div>
                    <span className={styles.label}>Location:</span>
                    <span>{event.locations}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <User size={20} />
                  <div>
                    <span className={styles.label}>Organizer:</span>
                    <span>{event.name}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <Mail size={20} />
                  <div>
                    <span className={styles.label}>Contact:</span>
                    <span>{event.createdBy}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <Users size={20} />
                  <div>
                    <span className={styles.label}>For:</span>
                    <span>
                      {event.PublicValue === 'Public' && event.PublicTarget 
                        ? event.PublicTarget 
                        : (event.ForUser || 'All Campuses')
                      }
                    </span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <Timer size={20} />
                  <div>
                    <span className={styles.label}>Entry Limit:</span>
                    <span>{event.entryLimit}</span>
                  </div>
                </div>
                {event.description && (
                  <div className={styles.eventInfo}>
                    <Info size={20} />
                    <div>
                      <span className={styles.label}>Description:</span>
                      <span>{event.description}</span>
                    </div>
                  </div>
                )}
                
                {event.status === "Ongoing" && userData?.position === "Student" && (
                  <div className={styles.attendanceSection}>
                    {!checkingAttendance[event.id] && !attendedEvents.has(event.id) ? (
                      <button 
                        className={Buttons.buttons}
                        onClick={() => startAttendanceCheck(event)}
                      >
                        Start Attendance Check
                      </button>
                    ) : checkingAttendance[event.id] ? (
                      <div className={styles.attendanceCheckingContainer}>
                        <div className={styles.loadingSpinner}>
                          <Loading size="small" text={attendanceStatus[event.id]} />
                        </div>
                        <button 
                          className={`${Buttons.buttons} ${styles.cancelButton}`}
                          onClick={() => cancelAttendanceCheck(event.id)}
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    ) : null}
                    {attendanceStatus[event.id] && (
                      <div className={styles.attendanceStatus}>
                        {attendanceStatus[event.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;