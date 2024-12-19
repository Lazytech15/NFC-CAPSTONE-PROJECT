import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  deleteUser 
} from "firebase/auth";

import { app } from '/utils/firebase-config.js';

const googleProvider = new GoogleAuthProvider();
const auth = getAuth();
const db = getFirestore(app);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcReader, setNfcReader] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusDetails, setStatusDetails] = useState([]);

  const updateStatus = (command, details) => {
    setStatusMessage(command);
    setStatusDetails(details);
    // For very quick operations, add a minimum display time
    return new Promise(resolve => setTimeout(resolve, 800));
  };
  
  const checkUserRole = async (userEmail) => {
    try {
      await updateStatus(
        'check-role --user ' + userEmail,
        ['Checking user permissions...']
      );
  
      // Check in RegisteredAdmin collection
      await updateStatus(
        'verify-role --collection RegisteredAdmin',
        ['Checking admin privileges...']
      );
      const adminQuery = query(
        collection(db, "RegisteredAdmin"),
        where("email", "==", userEmail)
      );
      const adminSnapshot = await getDocs(adminQuery);
      if (!adminSnapshot.empty) {
        await updateStatus(
          'grant-role --type admin',
          ['✓ Admin privileges confirmed']
        );
        return 'admin';
      }
  
      // Check in RegisteredTeacher collection
      await updateStatus(
        'verify-role --collection RegisteredTeacher',
        ['Checking teacher privileges...']
      );
      const teacherQuery = query(
        collection(db, "RegisteredTeacher"),
        where("email", "==", userEmail)
      );
      const teacherSnapshot = await getDocs(teacherQuery);
      if (!teacherSnapshot.empty) {
        await updateStatus(
          'grant-role --type teacher',
          ['✓ Teacher privileges confirmed']
        );
        return 'teacher';
      }
  
      // Check in RegisteredStudent collection
      await updateStatus(
        'verify-role --collection RegisteredStudent',
        ['Checking student privileges...']
      );
      const studentQuery = query(
        collection(db, "RegisteredStudent"),
        where("email", "==", userEmail)
      );
      const studentSnapshot = await getDocs(studentQuery);
      if (!studentSnapshot.empty) {
        await updateStatus(
          'grant-role --type student',
          ['✓ Student privileges confirmed']
        );
        return 'student';
      }
  
      await updateStatus(
        'verify-role --result none',
        ['✗ No role assignments found']
      );
      setTimeout(() => {
        setStatusMessage('');
        setStatusDetails([]);
      }, 1000);
      return null;
    } catch (error) {
      await updateStatus(
        'verify-role --error',
        ['✗ Error checking roles', error.message]
      );
      setTimeout(() => {
        setStatusMessage('');
        setStatusDetails([]);
      }, 1000);
      console.error("Error checking user role:", error);
      return null;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsReading(true);
    setError('');
    
    try {
      await updateStatus('authenticate --verify-credentials', ['Checking credentials...']);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await checkUserRole(userCredential.user.email);
      
      if (role) {
        await updateStatus(
          'grant-access --role ' + role,
          [`✓ Access granted as ${role}`, 'Redirecting to dashboard...']
        );
        localStorage.setItem('userRole', role);
        setIsLoggedIn(true);
        // Add small delay before navigation
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await updateStatus(
          'verify-access --check-registration',
          ['✗ Your account is not registered in the system']
        );
        setTimeout(() => {
          setStatusMessage('');
          setStatusDetails([]);
        }, 1000);
        await signOut(auth);
        setError('Access denied. Please contact your administrator.');
      }
    } catch (err) {
      await updateStatus(
        'authenticate --verify-credentials',
        ['✗ Authentication failed']
      );
      setTimeout(() => {
        setStatusMessage('');
        setStatusDetails([]);
      }, 1000);
      setError("Access Denied, Please check you email and password");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setIsReading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const role = await checkUserRole(result.user.email);
      
      if (role) {
        await updateStatus(
          'grant-access --role ' + role,
          [`✓ Access granted as ${role}`, 'Redirecting to dashboard...']
        );
        localStorage.setItem('userRole', role);
        setIsLoggedIn(true); // Set logged in state
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await updateStatus(
          'verify-access --check-registration',
          ['✗ Your account is not registered in the system']
        );
        await signOut(auth);
        setError('Access denied. Please contact your administrator.');
      }
    } catch (err) {
      await updateStatus(
        'authenticate --verify-credentials',
        ['✗ Authentication failed', authError.message]
      )
      setTimeout(() => {
        setStatusMessage('');
        setStatusDetails([]);
      }, 1000);
      setError(err.message);
      
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    let nfcReaderInstance = null;

    // Only initialize NFC if not logged in
    const checkNFCSupport = async () => {
      if (isLoggedIn) return; // Don't initialize if logged in

      if ('NDEFReader' in window) {
        try {
          const reader = new window.NDEFReader();
          await reader.scan();
          setNfcSupported(true);
          setNfcReader(reader);
          nfcReaderInstance = reader;
          setIsReading(true);
          await updateStatus(
            'initialize-nfc --scan-mode',
            ['✓ NFC reader initialized', 'Waiting for NFC card...']
          );

          setTimeout(() => {
            setStatusMessage('');
            setStatusDetails([]);
          }, 1000);    
          
          reader.onreading = async ({ message }) => {
            try {
              const nfcRecord = message.records.find(
                record => record.recordType === "text"
              );
          
              if (!nfcRecord) {
                await updateStatus(
                  'verify-nfc --check-data',
                  ['✗ Invalid NFC card: No user data found']
                );
                throw new Error('Invalid NFC card: No user data found');
              }
          
              const nfcId = new TextDecoder().decode(nfcRecord.data);
              await updateStatus(
                'read-nfc --get-data',
                [`✓ NFC data retrieved: ${nfcId}`]
              );
              
              try {
                
                await updateStatus(
                  'authenticate --verify-credentials',
                  ['Checking user credentials...']
                );
                const role = await checkUserRoleByNFC(nfcId);
                if (role) {
                  await updateStatus(
                    'grant-access --role ' + role,
                    [`✓ Access granted as ${role}`, 'Redirecting to dashboard...']
                  );
                  localStorage.setItem('userRole', role);
                  setIsLoggedIn(true);
                  setTimeout(() => navigate('/dashboard'), 1000);
                } else {
                  await updateStatus(
                    'verify-access --check-registration',
                    ['✗ NFC card is not registered in the system']
                  );
                  setTimeout(() => {
                    setStatusMessage('');
                    setStatusDetails([]);
                  }, 1000);
                  setError('NFC card is not registered in the system.');
                }
              } catch (authError) {
                await updateStatus(
                  'authenticate --verify-credentials',
                  ['✗ Authentication failed', authError.message]
                );
                setTimeout(() => {
                  setStatusMessage('');
                  setStatusDetails([]);
                }, 1000);
                console.error('Authentication error:', authError);
                setError('Failed to authenticate with NFC card.');
              }
            } catch (err) {
              console.error('Error processing NFC card:', err);
              setError('Failed to process NFC card.');
            }
          };
          
          reader.onerror = async (error) =>  {
            await updateStatus(
              'nfc-error --get-details',
              ['✗ Error reading NFC card', error.message]
            );
            setTimeout(() => {
              setStatusMessage('');
              setStatusDetails([]);
            }, 1000);
            console.error('NFC read error:', error);
            setError('Error reading NFC card.');
          };
          
        } catch (err) {
          await updateStatus(
            'initialize-nfc --check-support',
            ['✗ NFC initialization failed', err.message]
          );
          setTimeout(() => {
            setStatusMessage('');
            setStatusDetails([]);
          }, 1000);
          console.error('Error setting up NFC:', err);
          setNfcSupported(false);
        }
      }else{
        await updateStatus(
          'initialize-nfc --check-support',
          ['✗ NFC initialization failed']
        );
        setTimeout(() => {
          setStatusMessage('');
          setStatusDetails([]);
        }, 2000);
      } 
    };
  
    checkNFCSupport();
  
    // Cleanup function
    return async () => {
      if (nfcReaderInstance) {
        try {
          // Abort the NFC scan
          nfcReaderInstance.abort();
          // Remove all listeners
          nfcReaderInstance.removeAllListeners?.();
          setNfcReader(null);
          setNfcSupported(false);
          await updateStatus(
            'cleanup-nfc --remove-listeners',
            ['✓ NFC reader cleaned up successfully']
          );
        } catch (err) {
          console.error('Error cleaning up NFC reader:', err);
        }
      }
    };
  }, [isLoggedIn]); // Add isLoggedIn to dependency array

  const checkUserRoleByNFC = async (nfcId) => {
    try {
      await updateStatus(
        'verify-role --collection RegisteredAdmin',
        ['Checking admin privileges...']
      );
      // Check in RegisteredAdmin collection
      const adminQuery = query(
        collection(db, "RegisteredAdmin"),
        where("currentnfcId", "==", nfcId)
      );
      const adminSnapshot = await getDocs(adminQuery);
      if (!adminSnapshot.empty) {
        const userData = adminSnapshot.docs[0].data();
        await signInWithEmailAndPassword(auth, userData.email, userData.upass);
        await updateStatus(
          'grant-role --type admin',
          ['✓ Admin privileges confirmed']
        );
        return 'admin';
      }

      await updateStatus(
        'verify-role --collection RegisteredTeacher',
        ['Checking teacher privileges...']
      );
  
      // Check in RegisteredTeacher collection
      const teacherQuery = query(
        collection(db, "RegisteredTeacher"),
        where("currentnfcId", "==", nfcId)
      );
      const teacherSnapshot = await getDocs(teacherQuery);
      if (!teacherSnapshot.empty) {
        const userData = teacherSnapshot.docs[0].data();
        await signInWithEmailAndPassword(auth, userData.email, userData.upass);
        await updateStatus(
          'grant-role --type teacher',
          ['✓ Teacher privileges confirmed']
        );
        return 'teacher';
      }
  
      await updateStatus(
        'verify-role --collection RegisteredStudent',
        ['Checking student privileges...']
      );

      // Check in RegisteredStudent collection
      const studentQuery = query(
        collection(db, "RegisteredStudent"),
        where("currentnfcId", "==", nfcId)
      );
      const studentSnapshot = await getDocs(studentQuery);
      if (!studentSnapshot.empty) {
        const userData = studentSnapshot.docs[0].data();
        await signInWithEmailAndPassword(auth, userData.email, userData.upass);
        await updateStatus(
          'grant-role --type student',
          ['✓ Student privileges confirmed']
        );
        return 'student';
      }
  
      return null;
    } catch (error) {
      console.error("Error checking user role by NFC:", error);
      throw error; // Propagate the error to handle it in the calling function
    }
  };

  return (
    <div className={styles.login_container}>

    {/* Status Display */}
    {(statusMessage || loading) && ( 
      <div className={`${styles.status} ${isReading ? styles.reading : ''}`}> 
        <div className={styles.status_command}>
          {statusMessage}
        </div> 
        {statusDetails.map((detail, index) => ( 
          <div 
            key={index} 
            className={`${styles.status_detail} ${detail.includes('failed') ? 'error' : ''}`}
          >
            {detail}
          </div> 
        ))} 
      </div> 
    )}



      <div className={styles.login_card}>
        <h1 className={styles.login_title}>Login</h1>
        
        {/* {nfcSupported && (
          <div className={styles.nfc_status}>
            <p>NFC is enabled. Tap your card to login.</p>
          </div>
        )} */}
        
        <form onSubmit={handleEmailLogin} className={styles.login_form}>
          <div className={styles.form_group}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.login_input}
            />
          </div>
          
          <div className={styles.form_group}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.login_input}
            />
          </div>
          
          {error && (
            <div className={styles.error_message}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className={styles.login_button}
            disabled={loading}
          >
            {loading ? "Please wait.." : 'Login'}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={styles.google_button}
        >
          <svg className={styles.google_icon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;