import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Loading from '../Loading/Loading.jsx';
import { 
  User, 
  LayoutDashboard, 
  Calendar, 
  Archive, 
  Users, 
  Cpu, 
  FolderOpen, 
  LogOut,
  ClipboardList,
  Menu,
  X,
  Mail,
  MessageCircle 
} from 'lucide-react';

import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

// Initialize IndexedDB
const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('userDataDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'email' });
      }
    };
  });
};

// Save user data to IndexedDB
const saveToIndexedDB = async (userData) => {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction(['userData'], 'readwrite');
    const store = transaction.objectStore('userData');
    await store.put(userData);
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
};

// Get user data from IndexedDB
const getFromIndexedDB = async (email) => {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction(['userData'], 'readonly');
    const store = transaction.objectStore('userData');
    return new Promise((resolve, reject) => {
      const request = store.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading from IndexedDB:', error);
    return null;
  }
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [registeredTeachers, setRegisteredTeachers] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [ndefReader, setNdefReader] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const auth = getAuth();
  const db = getFirestore();

    // Monitor online/offline status
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
  
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
  
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

  useEffect(() => { 
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setIsLoading(true);
      
      if (user) {
        const email = user.email;
        const userData = await fetchUserData(email);
        userData.photoURL = user.photoURL; 
        await saveToIndexedDB(userData);
        setUserData(userData);
        navigate('/dashboard', { state: { userData } });
      }
      setIsLoading(false);
    });

    // Check and cleanup any existing NDEFReader
    const checkAndCleanupNFC = async () => {
      try {
        if ('NDEFReader' in window) {
          const existingReader = await window.NDEFReader;
          if (existingReader) {
            existingReader.abort();
            console.log('Existing NFC reader cleaned up');
          }
        }
      } catch (error) {
        console.error('Error cleaning up NFC reader:', error);
      }
    };

    checkAndCleanupNFC();
    
    return () => {
      unsubscribe();
      // Cleanup NFC reader on component unmount
      if (ndefReader) {
        ndefReader.abort();
      }
    }; 
  }, []);

  useEffect(() => {
    if (currentUser) {
      const messagesRef = collection(db, "Messages");
      const unsubscribe = onSnapshot(
        query(
          messagesRef,
          where("sendTo", "==", currentUser.email),
          where("read", "==", false)
        ),
        (snapshot) => {
          setUnreadMessages(snapshot.docs.length);
        },
        (error) => {
          console.error("Error listening to messages:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [currentUser, db]);

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        // Fetch teachers
        const teachersSnapshot = await getDocs(collection(db, "RegisteredTeacher"));
        const teachersList = teachersSnapshot.docs.map(doc => doc.data().name).slice(0, 5);
        setRegisteredTeachers(teachersList);

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, "RegisteredStudent"));
        const studentsList = studentsSnapshot.docs.map(doc => doc.data().name).slice(0, 5);
        setRegisteredStudents(studentsList);
      } catch (error) {
        console.error("Error fetching registered users:", error);
      }
    };

    fetchRegisteredUsers();
  }, [db]);

  
  
  const fetchUserData = async (email) => {
    try {
      // First try to get data from IndexedDB
      const cachedData = await getFromIndexedDB(email);
      
      if (!isOnline) {
        return cachedData; // Return cached data when offline
      }

      // If online, fetch from Firestore
      const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
      
      for (const collectionName of collections) {
        const q = query(collection(db, collectionName), where("email", "==", email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          // Save to IndexedDB for offline access
          await saveToIndexedDB(userData);
          return userData;
        }
      }

      return cachedData || null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Return cached data if fetch fails
      return await getFromIndexedDB(email);
    }
  };

    const handleCreateEventClick = () => {
      if (userData) {
        navigate('/dashboard/create-event', { state: { userData } });
        setIsOpen(false);
      }
    };

    const handleDashboardClick = () => { 
      setIsOpen(false); 
      navigate('/dashboard', { state: { userData } }); 
    };

    const handleFileManagerClick = () => { 
      setIsOpen(false); 
      navigate('/dashboard/file-manager', { state: { userData } }); 
    };
  
    const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };

    const handleSignOut = async () => {
      try { 
        // Cleanup NFC reader before signing out
        if (ndefReader) {
          ndefReader.abort();
        }
        await signOut(auth); 
        console.log('User signed out successfully'); 
        navigate('/login'); 
      } catch (error) { 
        console.error('Error signing out:', error);
      } 
    };

    const MailboxLink = () => (
      <Link to="/dashboard/request-message" className={styles.navLink} onClick={() => setIsOpen(false)}>
        <div className={styles.navLinkWithBadge}>
          <Mail size={20} />
          <span>Mailbox</span>
          {unreadMessages > 0 && (
            <span className={styles.messageBadge}>{unreadMessages}</span>
          )}
        </div>
      </Link>
    );

  // Check if user is a student
  const isStudent = userData?.position === 'Student';
  const isTeacher = userData?.position === 'Teacher';
  const isAdmin = userData?.position === 'Admin';

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Loading dashboard..." size="large" />
      </div>
    );
  }

  // If no user data is available after loading, show appropriate message
  if (!userData && !isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Loading dashboard..." size="large" />
      </div>
    );
  }

  return (
    <>
    {/* Add offline indicator */}
      {!isOnline && (
      <div className={styles.offlineIndicator}>
          You are currently offline. Some features may be limited.
      </div>
      )}
      <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.profileSection}>
          {currentUser && userData && (
            <>
              <div className={styles.avatar}>
                <img src={currentUser.photoURL || userData.selfieUrl || userData.photoURL} alt="Profile" />
              </div>
              <div className={styles.userInfo}>
                <h3>{userData.name}</h3>
                <p>{currentUser.email}</p>
                <br />
                <span>{userData.position}</span>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li className={styles.navItem}> 
              <div className={styles.navLink} onClick={handleDashboardClick}> 
                <LayoutDashboard size={20} /> 
                <span>Dashboard</span> 
              </div> 
            </li>

            {isStudent ? (
              // Student-specific navigation items
              <>
                <li className={styles.navItem}>
                  <div className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Archive size={20} />
                    <span>Event Attendance</span>
                  </div>
                </li>

                <li className={styles.navItem}>
                  <div className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Archive size={20} />
                    <span>Room Attendance</span>
                  </div>
                </li>

                <li className={styles.navItem}>
                  <div className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Archive size={20} />
                    <span>Membership Attendance</span>
                  </div>
                </li>

                {(isStudent || isTeacher || isAdmin) && <MailboxLink />}

              </>
            ) : isTeacher ? (
              // Teacher-specific navigation items
              <>
                <li className={styles.navItem}>
                  <div onClick={handleCreateEventClick} className={styles.navLink} style={{ cursor: 'pointer' }}>
                    <Calendar size={20} />
                    <span>Create Event</span>
                  </div>
                </li>

                <Link to="/dashboard/event-list" className={styles.navLink} onClick={() => setIsOpen(false)}>
                  <ClipboardList size={20} />
                  <span>Event List</span>
                </Link>

                <li className={styles.navItem}>
                  <div className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Archive size={20} />
                    <span>Archive</span>
                  </div>
                </li>

              <li className={styles.navItem}>
                  <Link to="/dashboard/registered-students" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Users size={20} />
                    <span>Registered Students</span>
                  </Link>
                  <ul className={styles.dropdown}>
                    {registeredStudents.map((student, index) => (
                      <li key={index} className={styles.dropdownItem}>
                        {student}
                      </li>
                    ))}
                  </ul>
              </li>

              {(isStudent || isTeacher || isAdmin) && <MailboxLink />}

              <li className={styles.navItem}> 
                <div className={styles.navLink} onClick={handleFileManagerClick}> 
                  <FolderOpen size={20} /> 
                  <span>File Manager</span> 
                </div> 
              </li>
              </>

              ) : (
              
              <>

              <li className={styles.navItem}>
                <div onClick={handleCreateEventClick} className={styles.navLink} style={{ cursor: 'pointer' }}>
                  <Calendar size={20} />
                  <span>Create Event</span>
                </div>
              </li>

                <Link to="/dashboard/event-list" className={styles.navLink} onClick={() => setIsOpen(false)}>
                  <ClipboardList size={20} />
                  <span>Event List</span>
                </Link>

                <li className={styles.navItem}>
                <div className={styles.navLink} onClick={() => setIsOpen(false)}>
                  <Archive size={20} />
                  <span>Archive</span>
                </div>
                </li>

                {(isStudent || isTeacher || isAdmin) && <MailboxLink />}

                <li className={styles.navItem}>
                  <Link to="/dashboard/registered-students" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Users size={20} />
                    <span>Registered Students</span>
                  </Link>
                  <ul className={styles.dropdown}>
                    {registeredStudents.map((student, index) => (
                      <li key={index} className={styles.dropdownItem}>
                        {student}
                      </li>
                    ))}
                  </ul>
                </li>

                <li className={styles.navItem}>
                  <Link to="/dashboard/registered-teachers" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Users size={20} />
                    <span>Registered Teacher</span>
                  </Link>
                  <ul className={styles.dropdown}>
                    {registeredTeachers.map((teacher, index) => (
                      <li key={index} className={styles.dropdownItem}>
                        {teacher}
                      </li>
                    ))}
                  </ul>
                </li>

                <li className={styles.navItem}>
                  <Link to="/dashboard/teacher-registration" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Users size={20} />
                    <span>Teacher Registration</span>
                  </Link>
                </li>

                <li className={styles.navItem}>
                  <Link to="/dashboard/student-registration" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Users size={20} />
                    <span>Student Registration</span>
                  </Link>
                </li>

                <li className={styles.navItem}>
                  <Link to="/dashboard/nfc-reader" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Cpu size={20} />
                    <span>NFC Reader</span>
                  </Link>
                </li>

                <li className={styles.navItem}>
                  <Link to="/dashboard/nfc-scanner" className={styles.navLink} onClick={() => setIsOpen(false)}>
                    <Cpu size={20} />
                    <span>NFC Scanner</span>
                  </Link>
                </li>

              <li className={styles.navItem}> 
                <div className={styles.navLink} onClick={handleFileManagerClick}> 
                  <FolderOpen size={20} /> 
                  <span>File Manager</span> 
                </div> 
              </li>
              </>
            )}
          </ul>
        </nav>

        {/* Logout Button */}
        <button className={styles.logoutBtn} onClick={handleSignOut}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
    </>
  );
};

export default Sidebar;