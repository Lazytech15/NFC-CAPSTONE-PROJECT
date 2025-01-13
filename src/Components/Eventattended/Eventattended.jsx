import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Image as ImageIcon, X } from 'lucide-react';
import styles from './Eventattended.module.css';

const EventAttended = () => {
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchAttendedEvents();
  }, []);

  const fetchAttendedEvents = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const studentsRef = collection(db, 'RegisteredStudent');
      const studentQuery = query(studentsRef, where('email', '==', user.email));
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setError('No student record found');
        setLoading(false);
        return;
      }

      const studentId = studentSnapshot.docs[0].data().studentId;

      const eventsRef = collection(db, 'StudentEvents');
      const eventsQuery = query(eventsRef, where('studentId', '==', studentId));
      const eventsSnapshot = await getDocs(eventsQuery);

      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAttendedEvents(events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attended events:', error);
      setError('Failed to load attended events');
      setLoading(false);
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

  if (loading) {
    return <div className={styles.loading}>Loading attended events...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.event_list_container}>
      <h2>My Attended Events</h2>
      
      <div className={styles.events_grid}>
        {attendedEvents.map((event) => (
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
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Event Start:</strong> {formatDate(event.startTime)}</p>
                <p><strong>Attendance:</strong> {formatDate(event.attendanceRecorded)}</p>
              </div>
            </div>
          </div>
        ))}
        
        {attendedEvents.length === 0 && (
          <div className={styles.no_events}>
            <p>No attended events found</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className={styles.modal_overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3>{selectedEvent.eventName}</h3>
              <button 
                className={styles.close_button}
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
              <p><strong>Status:</strong> <span className={styles.completed}>Attended</span></p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Event Start:</strong> {formatDate(selectedEvent.startTime)}</p>
              <p><strong>Event End:</strong> {formatDate(selectedEvent.endTime)}</p>
              <p><strong>Attendance Recorded:</strong> {formatDate(selectedEvent.attendanceRecorded)}</p>
              <p><strong>Created By:</strong> {selectedEvent.createdBy}</p>
              <p><strong>Student ID:</strong> {selectedEvent.studentId}</p>
              <p><strong>Course:</strong> {selectedEvent.course}</p>
              <p><strong>Section:</strong> {selectedEvent.section}</p>
              <p><strong>Campus:</strong> {selectedEvent.campus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAttended;