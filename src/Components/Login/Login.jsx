import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  updateDoc 
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

      const userData = await getUserByUid(uid);
      if (!userData) {
        return null;
      }

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
        return { role, docId: roleData.id };
      }

      return null;
    } catch (error) {
      console.error("Error checking user role:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await updateStatus('authenticate --verify-credentials', ['Checking credentials...']);
      
      // Determine login method based on form input
      const isEmailLogin = email && password;
      
      if (isEmailLogin) {
        // Check sign-in methods and authProvider
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        // Get user document to check authProvider
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const userSnapshot = await getDocs(q);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          
          if (userData.authProvider === 'google') {
          // Clear input fields when Google account is detected
              setEmail('');
              setPassword('');

            Swal.fire({
              title: "Google Account Detected",
              text: "This email is registered with Google. Please click the button below to sign in with Google.",
              icon: "info"
            });
            setLoading(false);
            return;
          }
        }

        // Proceed with email login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const roleData = await checkUserRole(userCredential.user.uid);
        
        if (roleData) {
          // Update authProvider if not set
          const userRef = doc(db, 'users', userCredential.user.uid);
          await updateDoc(userRef, {
            authProvider: 'email'
          });

          await updateStatus(
            'grant-access --role ' + roleData.role,
            [`✓ Access granted as ${roleData.role}`, 'Redirecting to dashboard...']
          );
          localStorage.setItem('userRole', roleData.role);
          setIsLoggedIn(true);
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          await signOut(auth);
          throw new Error('Access denied. Please contact your administrator.');
        }
      } else {
        // Google login
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const roleData = await checkUserRole(user.uid);

        if (userData.authProvider === 'email' && result.user) {
          await updateNFCCredentialsForGoogleAuth(
            result.user.email, 
            ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent']
          );
          // Then update authProvider to 'google'
        }
        
        if (roleData) {
          // Update authProvider
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            authProvider: 'google'
          });

          await updateStatus(
            'grant-access --role ' + roleData.role,
            [`✓ Access granted as ${roleData.role}`, 'Redirecting to dashboard...']
          );
          localStorage.setItem('userRole', roleData.role);
          setIsLoggedIn(true);
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          await signOut(auth);
          throw new Error('Access denied. Please contact your administrator.');
        }
      }
    } catch (err) {
      await updateStatus(
        'authenticate --verify-credentials',
        ['✗ Authentication failed']
      );
      Swal.fire({
        title: "Access Denied!",
        text: err.message || "Authentication failed. Please check your credentials.",
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
              await updateStatus(
                'authenticate --method nfc',
                ['Authenticating with stored credentials...']
              );
              
              try {
                // First try with the nfcPassword if it exists
                if (userData.nfcPassword) {
                  await signInWithEmailAndPassword(auth, userData.email, userData.nfcPassword);
                } else {
                  // Fallback to customPassword if nfcPassword doesn't exist
                  await signInWithEmailAndPassword(auth, userData.email, userData.customPassword);
                  
                  // If login successful with customPassword, store it as nfcPassword for future use
                  const docRef = doc(db, collections[i], snapshot.docs[0].id);
                  await updateDoc(docRef, {
                    nfcPassword: userData.customPassword
                  });
                }
  
                await updateStatus(
                  'grant-role --type ' + roles[i],
                  [`✓ ${roles[i]} privileges confirmed`]
                );
                return roles[i];
              } catch (authError) {
                // If authentication fails, check if it's a Google-linked account
                const methods = await fetchSignInMethodsForEmail(auth, userData.email);
                if (methods.includes('google.com')) {
                  throw new Error('Please update your NFC card settings. Account is now linked to Google.');
                }
                throw authError;
              }
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
  
  // Helper function to update NFC password when user switches to Google auth
  const updateNFCCredentialsForGoogleAuth = async (userEmail, collections) => {
    try {
      // Generate a secure random password for NFC login
      const nfcPassword = Math.random().toString(36).slice(-12) + 
                         Math.random().toString(36).slice(-12);
      
      // Search through all role collections
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("email", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docRef = doc(db, collectionName, snapshot.docs[0].id);
          await updateDoc(docRef, {
            nfcPassword: nfcPassword
          });
          
          // Create a credential and link it to the account
          const credential = EmailAuthProvider.credential(userEmail, nfcPassword);
          const auth = getAuth();
          if (auth.currentUser) {
            await linkWithCredential(auth.currentUser, credential);
          }
          
          break;
        }
      }
    } catch (error) {
      console.error("Error updating NFC credentials:", error);
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
          
          <form onSubmit={handleLogin} className={styles.login_form}>
            <div className={styles.form_group}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.login_input}
              />
            </div>
            
            <div className={styles.form_group}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.login_input}
              />
            </div>
            
            {error && <div className={styles.error_message}>{error}</div>}
            
            <button 
              onClick={handleLogin}
              className={styles.login_button}
              disabled={loading}
            >
              {loading ? "Please wait..." : (email && password ? 'Login with Email' : 'Sign in with Google')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;