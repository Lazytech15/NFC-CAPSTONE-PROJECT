import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import styles from './Eventlist.module.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

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
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    }
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
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
      await updateDoc(doc(db, 'PendingEvent', event.id), {
        status: 'in-progress'
      });
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
                  {selectedEvent.attendees?.map((attendee, index) => (
                    <tr key={index}>
                      <td>{attendee.studentId}</td>
                      <td>{attendee.name}</td>
                      <td>{attendee.course}</td>
                      <td>{attendee.campus}</td>
                      <td>{formatDate(attendee.dateAttended)}</td>
                      <td>
                        <div className={styles.action_buttons}>
                          <button
                            className={styles.edit_btn}
                            onClick={() => handleEdit(selectedEvent.id)}
                          >
                            <Edit2 size={16} />
                          </button>
                          {/* <button
                            className={styles.delete_btn}
                            onClick={() => handleDelete(selectedEvent.id)}
                          >
                            <Trash2 size={16} />
                          </button> */}
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
