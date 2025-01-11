import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';
import styles from './Dashboardeventlist.module.css';
import Loading from '../Loading/Loading';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Info,
  Users,
  Timer,
  Tag,
  Image,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const location = useLocation();
  const userData = location.state?.userData;
  const realtimeDb = getDatabase();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const db = getFirestore();
        const pendingEventsRef = collection(db, "PendingEvent");
        const querySnapshot = await getDocs(pendingEventsRef);
        
        const filteredEvents = [];
        
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          
          if (eventData.PublicValue === "Private" && eventData.ForUser === "Antipolo") {
            if (userData.position === "Student") {
              const forUserArray = eventData.ForUser.split(",").map(item => item.trim());
              if (forUserArray.includes(userData.section)) {
                filteredEvents.push({
                  id: doc.id,
                  ...eventData
                });
              }
            } 
            else if (["Teacher", "Admin"].includes(userData.position)) {
              const forUserArray = eventData.ForUser.split(",").map(item => item.trim());
              if (forUserArray.includes(userData.position)) {
                filteredEvents.push({
                  id: doc.id,
                  ...eventData
                });
              }
            }
          }
          else if (eventData.PublicValue !== "Private") {
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
  }, [userData]);

  const toggleEventDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const checkAttendance = async (eventId, selectedscanner) => {
    if (!userData?.currentnfcId) {
      setAttendanceStatus(prev => ({
        ...prev,
        [eventId]: "No NFC ID found for your account"
      }));
      return;
    }

    setCheckingAttendance(prev => ({
      ...prev,
      [eventId]: true
    }));
    setAttendanceStatus(prev => ({
      ...prev,
      [eventId]: "Waiting for data..."
    }));

    const attendanceRef = ref(realtimeDb, `scanned-cards/${selectedscanner}/attendees`);
    
    onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const attendanceData = snapshot.val();
        const found = Object.values(attendanceData).some(
          record => record.studentId === userData.studentId
        );

        setAttendanceStatus(prev => ({
          ...prev,
          [eventId]: found ? "✅ Your attendance has been recorded" : "❌ No attendance record found"
        }));
      } else {
        setAttendanceStatus(prev => ({
          ...prev,
          [eventId]: "No attendance records found for this event"
        }));
      }
      setCheckingAttendance(prev => ({
        ...prev,
        [eventId]: false
      }));
    }, {
      onlyOnce: true
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Loading events..." size="large" />
      </div>
    );
  }

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
        <span className={styles.emptyMessage}>No events available for your section/position.</span>
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
          <div key={event.id} className={styles.eventCard}>
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
                    <span>{event.ForUser}</span>
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
                    <button 
                      className={styles.checkAttendanceButton}
                      onClick={() => checkAttendance(event.id, event.selectedscanner)}
                      disabled={checkingAttendance[event.id]}
                    >
                      {checkingAttendance[event.id] ? 'Checking...' : 'Check Attendance'}
                    </button>
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