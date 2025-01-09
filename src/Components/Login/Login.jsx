import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} from "firebase/firestore";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from 'sweetalert2';
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

  const getUserByUid = async (uid) => {
    try {
      // First check the users collection
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  
  const checkUserRole = async (uid) => {
    try {
      await updateStatus(
        'check-role --user ' + uid,
        ['Checking user permissions...']
      );

      // Get user data from users collection
      const userData = await getUserByUid(uid);
      if (!userData) {
        return null;
      }

      // Check role and get detailed data from appropriate collection
      let roleData = null;
      let role = userData.role;

      switch (role) {
        case 'admin':
          await updateStatus('verify-role --collection RegisteredAdmin', ['Checking admin privileges...']);
          roleData = await getDoc(doc(db, 'RegisteredAdmin', userData.adminDocId));
          break;
        case 'teacher':
          await updateStatus('verify-role --collection RegisteredTeacher', ['Checking teacher privileges...']);
          roleData = await getDoc(doc(db, 'RegisteredTeacher', userData.teacherDocId));
          break;
        case 'student':
          await updateStatus('verify-role --collection RegisteredStudent', ['Checking student privileges...']);
          roleData = await getDoc(doc(db, 'RegisteredStudent', userData.studentDocId));
          break;
        default:
          return null;
      }

      if (roleData && roleData.exists()) {
        await updateStatus(
          'grant-role --type ' + role,
          [`✓ ${role} privileges confirmed`]
        );
        return role;
      }

      return null;
    } catch (error) {
      console.error("Error checking user role:", error);
      return null;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await updateStatus('authenticate --verify-credentials', ['Checking credentials...']);
      
      // First try regular email/password login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Check user role using UID
      const role = await checkUserRole(uid);
      
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
          ['✗ Account not registered in the system']
        );
        await signOut(auth);
        setError('Access denied. Please contact your administrator.');
        Swal.fire({
          title: "Access Denied!",
          text: "Account not registered in the system",
          icon: "error"
        });
      }
    } catch (err) {
      await updateStatus(
        'authenticate --verify-credentials',
        ['✗ Authentication failed']
      );
      Swal.fire({
        title: "Access Denied!",
        text: "Please check your email and password",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      
      // Check user role using UID
      const role = await checkUserRole(uid);
      
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
          ['✗ Account not registered in the system']
        );
        await signOut(auth);
        setError('Access denied. Please contact your administrator.');
        Swal.fire({
          title: "Access Denied!",
          text: "Account not registered in the system",
          icon: "error"
        });
      }
    } catch (err) {
      await updateStatus(
        'authenticate --verify-credentials',
        ['✗ Authentication failed']
      );
      Swal.fire({
        title: "Access Denied!",
        text: "Authentication failed",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let nfcReaderInstance = null;

    // Only initialize NFC if not logged in
    const checkNFCSupport = async () => {
      if (isLoggedIn) return;

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
                Swal.fire({
                  title: "Access Denied!",
                  text: "Please check you NFC card if it is registered",
                  icon: "error"
                });
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
      // Check collections in sequence
      const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
      const roles = ['admin', 'teacher', 'student'];
      
      for (let i = 0; i < collections.length; i++) {
        await updateStatus(
          `verify-role --collection ${collections[i]}`,
          [`Checking ${roles[i]} privileges...`]
        );
        
        const q = query(
          collection(db, collections[i]),
          where("currentnfcId", "==", nfcId)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          if (userData.uid) {
            // Get user data from users collection
            const userDoc = await getDoc(doc(db, 'users', userData.uid));
            if (userDoc.exists()) {
              // Sign in with stored credentials
              await signInWithEmailAndPassword(auth, userData.email, userData.customPassword);
              await updateStatus(
                'grant-role --type ' + roles[i],
                [`✓ ${roles[i]} privileges confirmed`]
              );
              return roles[i];
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error checking user role by NFC:", error);
      throw error;
    }
  };

  const settings = { 
    dots: false, 
    infinite: true, 
    speed: 500, 
    slidesToShow: 1, 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false
  };

  return (
    <div className={styles.login_container}>
    <Slider {...settings} className={styles.carousel}> 
        <div> 
          <img src="/images/image01.jpg" alt="Login" /> 
        </div>
        <div>
          <img src="/images/image02.jpg" alt="Login" /> 
        </div>
        <div>
          <img src="/images/image03.jpg" alt="Login" /> 
        </div>
    </Slider>

    <div className={styles.login_form_container}>
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
    </div>
  );
};

export default Login;