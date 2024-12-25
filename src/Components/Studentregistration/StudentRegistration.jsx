import React, { useState, useRef, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { useNavigate } from 'react-router-dom';
import nodemailer from 'nodemailer';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    campus: '',
    studentId: '',
    upass: ''
  });

  const [selfie, setSelfie] = useState(null);
  const [uploadOption, setUploadOption] = useState('capture');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [nfcReader, setNfcReader] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [nfcSerialNumber, setNfcSerialNumber] = useState(null);
  
  const fileInputRef = useRef(null);
  const existingImageInputRef = useRef(null);

  const updateStatus = (message, type = 'info') => {
    setStatus(message);
    setStatusType(type);
  };

  useEffect(() => {
    return () => {
      if (nfcReader) {
        nfcReader.abort();
      }
    };
  }, [nfcReader]);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.upass
      );
      
      await sendEmailVerification(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email is already registered');
        case 'auth/invalid-email':
          throw new Error('Invalid email format');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Use a stronger password');
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
      setStatus('Waiting for NFC tag...');
      const ndef = new NDEFReader();
      setNfcReader(ndef);
      await ndef.scan();

      const serialNumber = await new Promise((resolve, reject) => {
        const handleReading = async (event) => {
          try {
            const nfcSerialNumber = event.serialNumber;
            
            // Check NFC authorization
            const isAuthorized = await checkNfcAuthorization(nfcSerialNumber);
            if (!isAuthorized) {
              reject(new Error('Unauthorized NFC tag'));
              return;
            }

            ndef.removeEventListener("reading", handleReading);
            resolve(nfcSerialNumber);
          } catch (error) {
            reject(error);
          }
        };

        ndef.addEventListener("reading", handleReading);

        setTimeout(() => {
          ndef.removeEventListener("reading", handleReading);
          reject(new Error('NFC tag read timeout'));
        }, 30000);
      });

      setNfcSerialNumber(serialNumber);
      updateStatus('NFC tag detected successfully', 'success');
      return serialNumber;
    } catch (error) {
      updateStatus(error.message, 'error');
      throw error;
    } finally {
      if (nfcReader) {
        nfcReader.abort();
        setNfcReader(null);
      }
    }
  };

const handleSignOut = async () => {
  const auth = getAuth();
  const navigate = useNavigate();

  try {
    await signOut(auth);
    console.log('User signed out successfully');

    
    setTimeout(() => {
      navigate('/login'); 
    }, 2000);
  } catch (error) {
    console.error('Error signing out:', error);
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
      const firebaseUser = await registerWithFirebaseAuth();
      
      // Step 5: Update Firestore document with Firebase UID
      await updateDoc(docRef, { 
        firebaseUserId: firebaseUser.uid 
      });

      await sendRegistrationEmail(formData);
  
      // Final success message
      updateStatus('Registration completed! Please check your email for verification.', 'success');
      
      // Step 6: Sign out
      await handleSignOut();
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!('NDEFReader' in window)) {
      updateStatus('NFC is not supported on this device', 'warning');
      return;
    }

    try {
      updateStatus('Waiting for NFC tag... Please place your card', 'info');
      await scanNfcTag();
      updateStatus('NFC tag detected successfully!', 'success');

      if (!window.confirm('Do you want to complete the registration?')) {
        setNfcSerialNumber(null);
        updateStatus('');
        return;
      }

      await completeRegistration();
    } catch (error) {
      console.error('Registration Error:', error);
      updateStatus('Registration process failed: ' + error.message, 'error');
    }
  };

  
  const sendRegistrationEmail = async (studentData) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'capstoneantipoloicct@gmail.com',
        pass: 'capstonepassword'
      }
    });

    const mailOptions = {
      from: 'capstoneantipoloicct@gmail.com',
      to: studentData.email,
      subject: 'Welcome to ICCT Colleges',
      text: `
Dear ${studentData.name},

Thank you for registering at ICCT Colleges. Here are your registration details:

Student ID: ${studentData.studentId}
Course: ${studentData.course}
Campus: ${studentData.campus}

Please verify your email to complete the registration process.

Best regards,
ICCT Colleges
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      updateStatus('Registration email sent successfully', 'success');
    } catch (error) {
      console.error('Error sending email:', error);
      updateStatus('Registration completed, but email notification failed', 'warning');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Student Registration</h1>

      {/* Status Modal */}
      {(!('NDEFReader' in window) || status) && (
        <StatusModal 
          message={!('NDEFReader' in window) ? 'NFC is not supported on this device' : status}
          type={!('NDEFReader' in window) ? 'warning' : statusType}
          isProcessing={isSaving}
        />
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Student Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={isSaving}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={isSaving}
        />

        <input
          type="text"
          placeholder="Course"
          value={formData.course}
          onChange={(e) => setFormData({...formData, course: e.target.value})}
          required
          disabled={isSaving}
        />

        <input
          type="text"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={(e) => setFormData({...formData, studentId: e.target.value})}
          required
          disabled={isSaving}
        />

        <input
          type="text"
          placeholder="Password"
          value={formData.upass}
          onChange={(e) => setFormData({...formData, upass: e.target.value})}
          required
          disabled={isSaving}
        />
        
        <select
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
        
        {/* Conditional rendering based on upload option */}
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
        
        {/* Show selected image name if image is selected */}
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