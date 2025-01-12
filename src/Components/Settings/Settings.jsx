import React, { useState } from 'react';
import { User, Lock, CreditCard, Upload, Save } from 'lucide-react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './Settings.module.css';
import Loading from '../Loading/Loading.jsx';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile states
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // NFC Card states
  const [nfcPassword, setNfcPassword] = useState('');
  const [confirmNfcPassword, setConfirmNfcPassword] = useState('');

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      let photoURL = user.photoURL;

      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }

      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        name: name || user.displayName,
        photoURL
      });

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNfcPasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (nfcPassword !== confirmNfcPassword) {
      setError('NFC passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        nfcPassword: nfcPassword
      });

      setSuccess('NFC card password updated successfully');
      setNfcPassword('');
      setConfirmNfcPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Processing..." size="large" />
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>Settings</h1>
      
      {/* Settings Navigation */}
      <div className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'password' ? styles.active : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={20} />
          <span>Password</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'nfc' ? styles.active : ''}`}
          onClick={() => setActiveTab('nfc')}
        >
          <CreditCard size={20} />
          <span>NFC Card</span>
        </button>
      </div>

      {/* Messages */}
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.contentSection}>
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Profile Image</label>
              <div className={styles.uploadSection}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className={styles.fileInput}
                  id="profile-image"
                />
                <label htmlFor="profile-image" className={styles.uploadButton}>
                  <Upload size={20} />
                  <span>Upload Image</span>
                </label>
                {profileImage && <span className={styles.fileName}>{profileImage.name}</span>}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Update Profile
            </button>
          </form>
        )}

        {/* Password Settings */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Change Password
            </button>
          </form>
        )}

        {/* NFC Card Settings */}
        {activeTab === 'nfc' && (
          <form onSubmit={handleNfcPasswordUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label>New NFC Card Password</label>
              <input
                type="password"
                value={nfcPassword}
                onChange={(e) => setNfcPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Confirm NFC Card Password</label>
              <input
                type="password"
                value={confirmNfcPassword}
                onChange={(e) => setConfirmNfcPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Update NFC Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;