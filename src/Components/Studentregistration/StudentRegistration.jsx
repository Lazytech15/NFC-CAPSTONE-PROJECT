import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  getFirestore, doc, getDoc, addDoc, 
  collection, serverTimestamp, updateDoc 
} from 'firebase/firestore';

import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    signOut
  } from 'firebase/auth';

import styles from './StudentRegistration.module.css';
import Buttons from '../Button/Button.module.css';

import { app } from '/utils/firebase-config.js';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const StatusModal = ({ message, type, isProcessing }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
      if (message) {
          setIsVisible(true);
          const timer = setTimeout(() => {
              setIsVisible(false);
          }, 3000);

          return () => clearTimeout(timer);
      }
  }, [message]);

  if (!message || !isVisible) return null;
  
  const getStatusClass = () => {
      switch (type) {
          case 'warning':
              return styles.statusWarning;
          case 'error':
              return styles.statusError;
          case 'success':
              return styles.statusSuccess;
          default:
              return styles.statusInfo;
      }
  };

  return (
      <div className={`${styles.modalOverlay} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
          <div className={styles.modalContent}>
              <div className={`${styles.status} ${getStatusClass()} ${isProcessing ? styles['animate-pulse'] : ''}`}>
                  {message}
              </div>
          </div>
      </div>
  );
};

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [selfie, setSelfie] = useState(null);
  const [uploadOption, setUploadOption] = useState('capture');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [nfcReader, setNfcReader] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [nfcSerialNumber, setNfcSerialNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const fileInputRef = useRef(null);
  const existingImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    campus: '',
    studentId: '',
    upass: ''
  });

  const updateStatus = (message, type = 'info') => {
    setStatus(message);
    setStatusType(type);
  };

  useEffect(() => {
    let abortController;

    const cleanupNFC = () => {
      if (nfcReader && typeof nfcReader.abort === 'function') {
        try {
          nfcReader.abort();
        } catch (error) {
          console.warn('Error cleaning up NFC reader:', error);
        }
      }
    };

    return () => {
      cleanupNFC();
      if (abortController) {
        abortController.abort();
      }
    };
  }, [nfcReader]);

    // Update useEffect to generate password when component mounts
    useEffect(() => {
      const newPassword = generatePassword();
      setGeneratedPassword(newPassword);
      setFormData(prev => ({
        ...prev,
        upass: newPassword
      }));
    }, []);

    // Function to generate random password
    const generatePassword = () => {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    };
  
    // Function to generate username
    const generateUsername = (studentId) => {
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 random digits
      return `${studentId}${randomNum}@icct.com`;
    };

  const handleSelfie = (e) => {
    const file = e.target.files[0];
    setSelfie(file);
  };

  const handleUploadOptionChange = (option) => {
    setUploadOption(option);
    setSelfie(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (existingImageInputRef.current) existingImageInputRef.current.value = '';
  };

  const registerWithFirebaseAuth = async () => {
    try {
      const username = generateUsername(formData.studentId);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        username, // Use generated username instead of email
        generatedPassword // Use generated password
      );
      
      await sendEmailVerification(userCredential.user);
      
      // Update formData with the generated credentials
      setFormData(prev => ({
        ...prev,
        email: username // Store the generated username in email field
      }));
      
      return { user: userCredential.user, username };
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Generated username is already in use');
        case 'auth/invalid-email':
          throw new Error('Invalid username format');
        default:
          throw error;
      }
    }
  };

  const scanNfcTag = async () => {
    if (!('NDEFReader' in window)) {
      throw new Error('NFC not supported on this device');
    }

    try {
      const ndef = new NDEFReader();
      updateStatus('Waiting for NFC tag...', 'info');
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      const signal = abortController.signal;
      
      setNfcReader(ndef);
      await ndef.scan({ signal });

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          abortController.abort();
          reject(new Error('NFC tag read timeout'));
        }, 30000);

        const handleReading = async (event) => {
          try {
            const nfcSerialNumber = event.serialNumber;
            clearTimeout(timeoutId);
            
            const isAuthorized = await checkNfcAuthorization(nfcSerialNumber);
            if (!isAuthorized) {
              reject(new Error('Unauthorized NFC tag'));
              return;
            }

            ndef.removeEventListener("reading", handleReading);
            resolve(nfcSerialNumber);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        };

        ndef.addEventListener("reading", handleReading);

        signal.addEventListener('abort', () => {
          ndef.removeEventListener("reading", handleReading);
          reject(new Error('NFC scan aborted'));
        });
      });
    } catch (error) {
      updateStatus(error.message, 'error');
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      updateStatus('Error signing out: ' + error.message, 'error');
    }
  };

  const uploadSelfie = async () => {
    if (!selfie) return null;
    try {
      updateStatus('Uploading selfie...', 'info');
      const safeEmail = formData.email.replace(/[@.]/g, '_');
      const storageRef = ref(storage, `users/${safeEmail}/profile/${selfie.name}`);
      const snapshot = await uploadBytes(storageRef, selfie);
      const downloadURL = await getDownloadURL(snapshot.ref);
      updateStatus('Selfie uploaded successfully!', 'success');
      return downloadURL;
    } catch (error) {
      updateStatus('Failed to upload selfie: ' + error.message, 'error');
      throw error;
    }
  };

  const completeRegistration = async () => {
    try {
      setIsSaving(true);
      
      // Step 1: Upload selfie first
      const selfieUrl = await uploadSelfie();
      
      // Step 2: Save initial data to Firestore
      updateStatus('Saving your registration details...', 'info');
      const position = "Student";
      const initialData = {
        ...formData,
        nfcSerialNumber,
        selfieUrl,
        position,
        createdAt: serverTimestamp()
      };
  
      const docRef = await addDoc(collection(db, 'RegisteredStudent'), initialData);
      await updateDoc(docRef, { currentnfcId: docRef.id });
      updateStatus('Registration details saved successfully!', 'success');
  
      // Step 3: Write to NFC
      updateStatus('Writing to NFC tag... Please keep your card in place', 'info');
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{
          recordType: "text",
          data: new TextEncoder().encode(docRef.id)
        }]
      });
      updateStatus('NFC tag written successfully!', 'success');
  
      // Step 4: Create Firebase Auth account last
      updateStatus('Creating your account...', 'info');
      const { user: firebaseUser, username } = await registerWithFirebaseAuth();
      
      // Step 5: Update Firestore document with Firebase UID and username
      await updateDoc(docRef, { 
        firebaseUserId: firebaseUser.uid,
        username // Save the generated username
      });
  
      // Final success message
      updateStatus('Registration completed! Please check your email for verification.', 'success');
      
      // Close NFC reader
      if (nfcReader && typeof nfcReader.abort === 'function') {
        try {
          nfcReader.abort();
        } catch (error) {
          console.warn('Error closing NFC reader:', error);
        }
      }
      
      // Reset form after delay
      setTimeout(() => {
        updateStatus('');
        resetForm();
      }, 5000);
  
      return docRef.id;
    } catch (error) {
      console.error('Registration Error:', error);
      let errorMessage = 'Registration failed: ';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'not-found') {
        errorMessage = 'NFC tag not found. Please try again.';
      } else if (error.code === 'network-error') {
        errorMessage = 'Network connection issue. Please check your internet connection.';
      } else {
        errorMessage += error.message;
      }
      
      updateStatus(errorMessage, 'error');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  

  const checkNfcAuthorization = async (serialNumber) => {
    try {
      const docRef = doc(db, 'Toregistered', serialNumber);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('NFC Authorization Check Error:', error);
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      course: '',
      campus: '',
      studentId: '',
      upass: ''
    });
    setSelfie(null);
    setStatus('');
    setNfcSerialNumber(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processNetlifyForm = async (formData) => {
    try {
      const netlifyFormData = new FormData();
      netlifyFormData.append('form-name', 'student-registration');
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        netlifyFormData.append(key, formData[key]);
      });

      // Send to Netlify's form handling endpoint
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(netlifyFormData).toString()
      });
    } catch (error) {
      console.error('Netlify form submission error:', error);
      // Continue with rest of registration even if Netlify form fails
    }
  };

  const sendEmail = async (emailData) => {
    try {
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.message
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!('NDEFReader' in window)) {
      updateStatus('NFC is not supported on this device', 'warning');
      return;
    }
  
    try {
      // Process Netlify form first
      await processNetlifyForm(formData);
      
      updateStatus('Waiting for NFC tag... Please place your card', 'info');
      await scanNfcTag();
      updateStatus('NFC tag detected successfully!', 'success');
  
      if (!window.confirm('Do you want to complete the registration?')) {
        setNfcSerialNumber(null);
        updateStatus('');
        return;
      }
  
      const docId = await completeRegistration();
  
      // Send email after successful registration
      await sendEmail({
        to: formData.email,
        subject: 'Registration Successful',
        message: `Dear ${formData.name},\n\nYour registration is successful. Your student ID is ${formData.studentId}, your generated username is ${formData.email}, and your generated password is ${generatedPassword}.\n\nThank you!`
      });
  
    } catch (error) {
      console.error('Registration Error:', error);
      updateStatus('Registration process failed: ' + error.message, 'error');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Student Registration</h1>

      {/* Hidden Netlify form */}
      <form name="student-registration" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
        <input type="hidden" name="form-name" value="student-registration" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="course" />
        <input type="text" name="studentId" />
        <input type="text" name="campus" />
      </form>

      {/* Status Modal */}
      {(!('NDEFReader' in window) || status) && (
        <StatusModal 
          message={!('NDEFReader' in window) ? 'NFC is not supported on this device' : status}
          type={!('NDEFReader' in window) ? 'warning' : statusType}
          isProcessing={isSaving}
        />
      )}
      
      {/* Your existing form with Netlify attributes added */}
      <form 
        onSubmit={handleSubmit} 
        className={styles.form}
        name="student-registration"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
      >
        <input type="hidden" name="form-name" value="student-registration" />
        {/* Honeypot field */}
        <p hidden>
          <label>Don't fill this out: <input name="bot-field" /></label>
        </p>

        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={isSaving}
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={isSaving}
        />

        <input
          type="text"
          name="course"
          placeholder="Course"
          value={formData.course}
          onChange={(e) => setFormData({...formData, course: e.target.value})}
          required
          disabled={isSaving}
        />

        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
          required
          disabled={isSaving}
        />

        <div className={styles.generatedCredentials}>
          <input
            type="text"
            name="upass"
            placeholder="Password"
            value={generatedPassword}
            readOnly
            disabled
            className={styles.generatedPassword}
          />
          <small className={styles.helpText}>
            This is your auto-generated password. Please save it.
          </small>
        </div>
        
        <select
          name="campus"
          value={formData.campus}
          onChange={(e) => setFormData({...formData, campus: e.target.value})}
          required
          disabled={isSaving}
        >
          <option value="">Select Campus</option>
          <option value="Cainta Campus">Cainta Campus</option>
          <option value="Antipolo Campus">Antipolo Campus</option>
          <option value="San Mateo Campus">San Mateo Campus</option>
          <option value="Binangonan Campus">Binangonan Campus</option>
          <option value="Sumulong Campus">Sumulong Campus</option>
          <option value="Taytay Campus">Taytay Campus</option>
          <option value="Angono Campus">Angono Campus</option>
          <option value="Cogeo Campus">Cogeo Campus</option>
        </select>

        {/* Keep your existing image upload section */}
        <div className={styles.uploadOptionContainer}>
          <label>
            <input
              type="radio"
              name="uploadOption"
              value="capture"
              checked={uploadOption === 'capture'}
              onChange={() => handleUploadOptionChange('capture')}
              disabled={isSaving}
            />
            Capture Selfie
          </label>
          <label>
            <input
              type="radio"
              name="uploadOption"
              value="upload"
              checked={uploadOption === 'upload'}
              onChange={() => handleUploadOptionChange('upload')}
              disabled={isSaving}
            />
            Upload Existing Image
          </label>
        </div>
        
        {uploadOption === 'capture' ? (
          <>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleSelfie}
              accept="image/*"
              capture="user"
              style={{display: 'none'}}
              disabled={isSaving}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={Buttons.buttons}
              disabled={isSaving}
            >
              Take Profile Picture
            </button>
          </>
        ) : (
          <>
            <input 
              type="file"
              ref={existingImageInputRef}
              onChange={handleSelfie}
              accept="image/*"
              style={{display: 'none'}}
              disabled={isSaving}
            />
            <button 
              type="button"
              onClick={() => existingImageInputRef.current.click()}
              className={Buttons.buttons}
              disabled={isSaving}
            >
              Upload Existing Image
            </button>
          </>
        )}
        
        {selfie && (
          <p>
            Selected Image: {selfie.name} 
            <button 
              type="button" 
              onClick={() => setSelfie(null)}
              className={styles.clearImageButton}
              disabled={isSaving}
            >
              Clear
            </button>
          </p>
        )}
        
        <button 
          type="submit"
          className={`${Buttons.buttons} ${isSaving ? 'animate-pulse' : ''}`}
          disabled={!formData.studentId || !selfie || isSaving || !('NDEFReader' in window)}
        >
          {nfcSerialNumber ? 'Complete Registration' : 'Scan NFC Tag'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;