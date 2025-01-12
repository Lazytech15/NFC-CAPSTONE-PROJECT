import React, { useState, useEffect, useRef } from 'react';
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

const RECAPTCHA_SITE_KEY = '6LcqH7UqAAAAAHx2W0OhNceJ68TNJlxpFos3h1yv';

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
    const [nfcEnabled, setNfcEnabled] = useState(true);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const recaptchaRef = useRef(null);
    const recaptchaWrapperRef = useRef(null);

    useEffect(() => {
        if (email && password) {
            setShowCaptcha(true);
        } else {
            setShowCaptcha(false);
            setCaptchaVerified(false);
        }
    }, [email, password]);

    // Handle CAPTCHA initialization
    useEffect(() => {
        let script = null;
        let grecaptchaInterval = null;

        const initializeCaptcha = () => {
            // Clear any existing CAPTCHA
            if (recaptchaWrapperRef.current) {
                recaptchaWrapperRef.current.innerHTML = '';
            }

            // Create new CAPTCHA container
            const captchaDiv = document.createElement('div');
            captchaDiv.id = 'recaptcha-container';
            if (recaptchaWrapperRef.current) {
                recaptchaWrapperRef.current.appendChild(captchaDiv);
            }

            // Render CAPTCHA
            window.grecaptcha.render('recaptcha-container', {
                'sitekey': RECAPTCHA_SITE_KEY,
                'callback': onCaptchaVerified,
                'expired-callback': onCaptchaExpired
            });
        };

        if (showCaptcha) {
            // Load reCAPTCHA script if not already loaded
            if (!window.grecaptcha) {
                script = document.createElement('script');
                script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                // Wait for grecaptcha to be available
                grecaptchaInterval = setInterval(() => {
                    if (window.grecaptcha && window.grecaptcha.render) {
                        clearInterval(grecaptchaInterval);
                        initializeCaptcha();
                    }
                }, 100);
            } else {
                // If script is already loaded, just initialize CAPTCHA
                initializeCaptcha();
            }
        }

        // Cleanup
        return () => {
            if (grecaptchaInterval) {
                clearInterval(grecaptchaInterval);
            }
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [showCaptcha]);

    const onCaptchaVerified = (token) => {
        setCaptchaVerified(true);
        setError('');
    };

    const onCaptchaExpired = () => {
        setCaptchaVerified(false);
    };

    const resetCaptcha = () => {
        if (window.grecaptcha) {
            window.grecaptcha.reset();
        }
        setCaptchaVerified(false);
    };


    const updateStatus = (command, details) => {
        setStatusMessage(command);
        setStatusDetails(details);
        return new Promise(resolve => setTimeout(resolve, 800));
    };

    const getUserByUid = async (uid) => {
        try {
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

    const handleNFCAuthentication = async (nfcId) => {
    // Check if user is already logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
        setIsLoggedIn(true);
        setNfcEnabled(false); // Disable NFC if user is logged in
        return;
    }

        try {
            await updateStatus('read-nfc --get-data', [`✓ NFC data retrieved: ${nfcId}`]);
            await updateStatus('authenticate --verify-credentials', ['Checking user credentials...']);
            const role = await checkUserRoleByNFC(nfcId);
            
            if (role) {
                await updateStatus('grant-access --role ' + role, [`✓ Access granted as ${role}`, 'Redirecting to dashboard...']);
                localStorage.setItem('userRole', role);
                setIsLoggedIn(true);
                // Disable NFC after successful login
                setNfcEnabled(false);
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                await updateStatus('verify-access --check-registration', ['✗ NFC card is not registered in the system']);
                setTimeout(() => {
                    setStatusMessage('');
                    setStatusDetails([]);
                }, 1000);
                setError('NFC card is not registered in the system.');
                
                Swal.fire({
                    title: "Access Denied!",
                    text: "Please check if your NFC card is registered",
                    icon: "error"
                });
            }
        } catch (err) {
            console.error('Error processing NFC card:', err);
            setError('Failed to process NFC card.');
            
            Swal.fire({
                title: "Authentication Error",
                text: err.message || "Failed to process NFC card",
                icon: "error"
            });
        }
    };

    const checkUserRole = async (uid) => {
        try {
            await updateStatus('check-role --user ' + uid, ['Checking user permissions...']);
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
                await updateStatus('grant-role --type ' + role, [`✓ ${role} privileges confirmed`]);
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

        // Check CAPTCHA verification for email/password login
        if (email && password && !captchaVerified) {
            setError('Please complete the CAPTCHA verification');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateStatus('authenticate --verify-credentials', ['Checking credentials...']);

            const isEmailLogin = email && password;

            if (isEmailLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const roleData = await checkUserRole(userCredential.user.uid);

                if (roleData) {
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
                // Google login section
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                const roleData = await checkUserRole(user.uid);

                const usersRef = collection(db, 'users');
                const userQuery = query(usersRef, where('email', '==', user.email));
                const userSnapshot = await getDocs(userQuery);

                if (userSnapshot.empty) {
                    throw new Error('User not found in the system');
                }

                const existingUserData = userSnapshot.docs[0].data();

                // Check if user is switching from email to Google
                if (existingUserData.authProvider === 'email') {
                    await updateStatus(
                        'update-auth --provider google',
                        ['Updating authentication method...']
                    );

                    // Update NFC credentials for Google auth
                    await updateNFCCredentialsForGoogleAuth(user.email,
                        ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent']
                    );
                }

                if (roleData) {
                    // Always update auth credentials when using Google
                    await updateNFCCredentialsForGoogleAuth(user.email,
                        ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent']
                    );

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
            resetCaptcha();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let nfcReaderInstance = null;

        const checkNFCSupport = async () => {
            // Check if user is already logged in
            const currentUser = auth.currentUser;
            if (currentUser) {
                setIsLoggedIn(true);
                setNfcEnabled(false); // Disable NFC if user is logged in
                return;
            }

            if ('NDEFReader' in window) {
                try {
                    const reader = new window.NDEFReader();
                    await reader.scan();
                    setNfcSupported(true);
                    setNfcReader(reader);
                    nfcReaderInstance = reader;
                    setIsReading(true);
                    await updateStatus('initialize-nfc --scan-mode', ['✓ NFC reader initialized', 'Waiting for NFC card...']);
                    setTimeout(() => {
                        setStatusMessage('');
                        setStatusDetails([]);
                    }, 1000);

                    reader.onreading = async ({ message }) => {
                        // Check if NFC is enabled before processing
                        if (!nfcEnabled) {
                            return;
                        }

                        try {
                            const nfcRecord = message.records.find(record => record.recordType === "text");
                            if (!nfcRecord) {
                                await updateStatus('verify-nfc --check-data', ['✗ Invalid NFC card: No user data found']);
                                throw new Error('Invalid NFC card: No user data found');
                            }

                            const nfcId = new TextDecoder().decode(nfcRecord.data);
                            await handleNFCAuthentication(nfcId);
                        } catch (err) {
                            console.error('Error processing NFC card:', err);
                            setError('Failed to process NFC card.');
                        }
                    };

                    reader.onerror = async (error) => {
                        await updateStatus('nfc-error --get-details', ['✗ Error reading NFC card', error.message]);
                        setTimeout(() => {
                            setStatusMessage('');
                            setStatusDetails([]);
                        }, 1000);
                        console.error('NFC read error:', error);
                        setError('Error reading NFC card.');
                    };
                } catch (err) {
                    await updateStatus('initialize-nfc --check-support', ['✗ NFC initialization failed', err.message]);
                    setTimeout(() => {
                        setStatusMessage('');
                        setStatusDetails([]);
                    }, 1000);
                    console.error('Error setting up NFC:', err);
                    setNfcSupported(false);
                }
            } else {
                await updateStatus('initialize-nfc --check-support', ['✗ NFC initialization failed']);
                setTimeout(() => {
                    setStatusMessage('');
                    setStatusDetails([]);
                }, 2000);
            }
        };

        checkNFCSupport();

        return async () => {
            if (nfcReaderInstance) {
                try {
                    // Properly clean up NFC reader
                    nfcReaderInstance.removeAllListeners?.();
                    await nfcReaderInstance.abort?.();
                    setNfcReader(null);
                    setNfcSupported(false);
                    await updateStatus('cleanup-nfc --remove-listeners', ['✓ NFC reader cleaned up successfully']);
                } catch (err) {
                    console.error('Error cleaning up NFC reader:', err);
                }
            }
        };
    }, [isLoggedIn]);

    const checkUserRoleByNFC = async (nfcId) => {
    // Check if user is already logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
        setIsLoggedIn(true);
        setNfcEnabled(false); // Disable NFC if user is logged in
        return;
    }
        try {
            const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
            const roles = ['admin', 'teacher', 'student'];

            for (let i = 0; i < collections.length; i++) {
                const q = query(collection(db, collections[i]), where("currentnfcId", "==", nfcId));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data();
                    if (userData.uid) {
                        const userDoc = await getDoc(doc(db, 'users', userData.uid));
                        if (userDoc.exists()) {
                            await updateStatus('authenticate --method nfc', ['Authenticating with stored credentials...']);
                            try {
                                const methods = await fetchSignInMethodsForEmail(auth, userData.email);
                                if (methods.includes('google.com')) {
                                    throw new Error('This account is linked to Google. Please use Google Sign-In.');
                                }

                                const password = userData.customPassword;
                                if (!password) {
                                    throw new Error('No valid password found for NFC authentication');
                                }

                                await signInWithEmailAndPassword(auth, userData.email, password);
                                return roles[i];
                            } catch (authError) {
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

    const updateNFCCredentialsForGoogleAuth = async (userEmail, collections) => {
        try {
            // Search through all role collections
            for (const collectionName of collections) {
                const q = query(
                    collection(db, collectionName),
                    where("email", "==", userEmail)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const docRef = doc(db, collectionName, snapshot.docs[0].id);

                    // Store customPassword to maintain consistency
                    const userData = snapshot.docs[0].data();
                    const customPassword = userData.customPassword;

                    await updateDoc(docRef, {
                        authProvider: 'google'
                    });

                    // Update the user document
                    if (userData.uid) {
                        const userRef = doc(db, 'users', userData.uid);
                        await updateDoc(userRef, {
                            authProvider: 'google'
                        });
                    }

                    // Create and link email credential after updating documents
                    if (auth.currentUser) {
                        try {
                            const credential = EmailAuthProvider.credential(userEmail, customPassword);
                            await linkWithCredential(auth.currentUser, credential);
                        } catch (linkError) {
                            console.log("Credential already exists:", linkError);
                            // This is fine - we just updated the password in Firestore
                        }
                    }
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
                            <div key={index} className={`${styles.status_detail} ${detail.includes('failed') ? 'error' : ''}`}>
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
                        {/* Add reCAPTCHA container */}
                        {showCaptcha && (
                            <div className={styles.captcha_container}>
                                <div ref={recaptchaWrapperRef}></div>
                            </div>
                        )}
                        {error && <div className={styles.error_message}>{error}</div>}
                        <button
                            onClick={handleLogin}
                            className={styles.login_button}
                            disabled={loading || (email && password && !captchaVerified)}
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
