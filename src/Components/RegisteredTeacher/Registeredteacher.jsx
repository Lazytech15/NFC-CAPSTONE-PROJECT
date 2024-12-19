import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  listAll,
  getDownloadURL
} from 'firebase/storage';
import { Users, Eye, Edit, Trash2, X } from 'lucide-react';
import styles from './Registeredteacher.module.css';

const UserLogViewer = ({ email, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const storage = getStorage();

  const formatEmailForPath = (email) => {
    return email.replace(/[@.]/g, '_');
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const userEmail = formatEmailForPath(email);
        const logsRef = ref(storage, `users/${userEmail}/process_log`);
        
        const fileList = await listAll(logsRef);
        const logPromises = fileList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const response = await fetch(url);
          const content = await response.text();
          
          // Extract timestamp from filename
          const filename = item.name.split('/').pop();
          const timestamp = filename.replace('.txt', '');
          
          return {
            timestamp,
            content,
            filename
          };
        });

        const logResults = await Promise.all(logPromises);
        
        // Sort logs by timestamp (newest first)
        const sortedLogs = logResults.sort((a, b) => 
          b.timestamp.localeCompare(a.timestamp)
        );
        
        setLogs(sortedLogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to fetch logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [email]);

  if (loading) {
    return <div className={styles.logLoading}>Loading logs...</div>;
  }

  if (error) {
    return <div className={styles.logError}>{error}</div>;
  }

  return (
    <div className={styles.logViewerContainer}>
      <div className={styles.logViewerHeader}>
        <h2>User Activity Logs for {email}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
      </div>
      {logs.length === 0 ? (
        <p className={styles.noLogsMessage}>No logs found</p>
      ) : (
        <div className={styles.logsList}>
          {logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              <h3>Log from {log.timestamp}</h3>
              <pre className={styles.logContent}>{log.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RegisteredTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    const fetchRegisteredTeachers = async () => {
      try {
        const db = getFirestore();
        const teachersSnapshot = await getDocs(collection(db, "RegisteredTeacher"));
        const teachersList = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTeachers(teachersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching registered teachers:", error);
        setError("Failed to load teachers");
        setLoading(false);
      }
    };

    fetchRegisteredTeachers();
  }, []);

  const handleViewLogs = (teacher) => {
    setSelectedTeacher(teacher);
    setIsLogModalOpen(true);
  };

  const handleEdit = (teacher) => {
    console.log('Edit teacher:', teacher);
    // Placeholder for edit functionality
  };

  const handleDelete = (teacher) => {
    console.log('Delete teacher:', teacher);
    // Placeholder for delete functionality
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedTeacher(null);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading teachers...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.registeredUsersContainer}>
      <div className={styles.header}>
        <Users size={24} />
        <h2>Registered Teachers</h2>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>Teacher ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>NFC CARD</th>
              <th>Campus</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className={styles.teacherRow}>
                  <td data-label="Teacher ID">{teacher.teacherId}</td>
                  <td data-label="Name">{teacher.name}</td>
                  <td data-label="Email">{teacher.email}</td>
                  <td data-label="NFC CARD">{teacher.currentnfcId}</td>
                  <td data-label="Campus">{teacher.campus}</td>
                  <td data-label="Date Added">
                    {new Date(teacher.createdAt * 1000).toLocaleString()}
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionButtons}>
                      <button 
                        onClick={() => handleViewLogs(teacher)}
                        className={styles.viewLogsButton}
                        title="View Logs"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(teacher)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher)}
                        className={styles.deleteButton}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          {/* <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className={styles.teacherRow}>
                <td>{teacher.teacherId}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.currentnfcId}</td>
                <td>{teacher.campus}</td>
                <td>{new Date(teacher.createdAt * 1000).toLocaleString()}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => handleViewLogs(teacher)}
                      className={styles.viewLogsButton}
                      title="View Logs"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(teacher)}
                      className={styles.editButton}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(teacher)}
                      className={styles.deleteButton}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>

      {teachers.length === 0 && (
        <div className={styles.noUsersContainer}>
          No registered teachers found.
        </div>
      )}

      {isLogModalOpen && selectedTeacher && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <UserLogViewer 
              email={selectedTeacher.email} 
              onClose={handleCloseLogModal} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredTeachers;