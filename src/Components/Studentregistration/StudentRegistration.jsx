import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  getFirestore, doc, getDoc, addDoc, 
  collection, serverTimestamp, updateDoc, setDoc 
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
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.upass
      );
      
      // Send email verification
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
      updateStatus('Waiting for NFC tag...', 'info');
      const ndef = new NDEFReader();
      
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
      
      // Step 1: Create Firebase Auth account first to get UID
      updateStatus('Creating your account...', 'info');
      const firebaseUser = await registerWithFirebaseAuth();
      const uid = firebaseUser.uid;

      // Step 2: Upload selfie
      const selfieUrl = await uploadSelfie();
      
      // Step 3: Save data to Firestore with UID
      updateStatus('Saving your registration details...', 'info');
      const position = "Student";
      const initialData = {
        ...formData,
        uid: uid, // Store the Firebase UID
        nfcSerialNumber,
        selfieUrl,
        position,
        createdAt: serverTimestamp(),
        authProvider: 'email', // Track authentication method
        customPassword: formData.upass // Store the custom password for dual auth
      };
  
      // Save in RegisteredStudent collection
      const studentDocRef = await addDoc(collection(db, 'RegisteredStudent'), initialData);
      await updateDoc(studentDocRef, { 
        currentnfcId: studentDocRef.id,
        documentId: studentDocRef.id // Store document ID for reference
      });

      // Also save in a users collection for authentication purposes
      await setDoc(doc(db, 'users', uid), {
        email: formData.email,
        uid: uid,
        role: 'student',
        studentDocId: studentDocRef.id,
        customPassword: formData.upass,
        authMethods: ['email'],
        createdAt: serverTimestamp()
      });

      updateStatus('Registration details saved successfully!', 'success');
  
      // Step 4: Write to NFC
      updateStatus('Writing to NFC tag... Please keep your card in place', 'info');
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{
          recordType: "text",
          data: new TextEncoder().encode(studentDocRef.id)
        }]
      });
      updateStatus('NFC tag written successfully!', 'success');
  
      // Final success message
      updateStatus('Registration completed! Please check your email for verification.', 'success');
      
      // Sign out
      await handleSignOut();
      
      // Reset form after delay
      setTimeout(() => {
        updateStatus('');
        resetForm();
      }, 5000);
  
      return studentDocRef.id;
    } catch (error) {
      console.error('Registration Error:', error);
      let errorMessage = 'Registration failed: ';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
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

      await completeRegistration();

    // Send email after successful registration
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1>Welcome to Our School!</h1>
            </div>
            
            <div style="padding: 20px; background-color: #ffffff; border: 1px solid #dddddd;">
                <div style="font-size: 24px; margin-bottom: 20px; color: #2563eb;">
                    Dear ${formData.name},
                </div>
                
                <p>Congratulations on successfully registering as a student! We're excited to have you join our academic community.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h2>Your Registration Details</h2>
                    <div style="margin: 10px 0;">
                        <strong>Student ID:</strong> ${formData.studentId}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Email:</strong> ${formData.email}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Password:</strong> ${formData.upass}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Course:</strong> ${formData.course}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Campus:</strong> ${formData.campus}
                    </div>
                </div>

                <p>Please keep these credentials safe and change your password upon your first login.</p>
                
                <p>To get started:</p>
                <ol>
                    <li>Visit our student portal</li>
                    <li>Log in with your email and password</li>
                    <li>Complete your email verification</li>
                    <li>Update your password</li>
                </ol>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                <div style="text-align: center; margin-top: 20px; color: #666666;">
                    <p>Best regards,<br>Team Loigasm</p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({
        to: formData.email,
        subject: 'Welcome to Our School - Registration Successful!',
        html: emailContent
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

        <input
          type="text"
          name="upass"
          placeholder="Password"
          value={formData.upass}
          onChange={(e) => setFormData({...formData, upass: e.target.value})}
          required
          disabled={isSaving}
        />
        
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