import React, { useState, useEffect } from 'react';
import { User, Lock, CreditCard,Eye } from 'lucide-react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import styles from './Settings.module.css';
import Loading from '../Loading/Loading.jsx';
import UserDataModal from './UserDataModal.jsx';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    initial: true,
    profile: false,
    password: false,
    nfc: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Profile states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    campus: '',
    course: '',
    section: '',
    studentId: '',
    homeAddress: '',
    elementarySchool: '',
    highSchool: '',
    mobileNumber: '',
    facebookLink: ''
  });
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // NFC Card states
  const [nfcPassword, setNfcPassword] = useState('');
  const [confirmNfcPassword, setConfirmNfcPassword] = useState('');

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        const collections = ['RegisteredAdmin', 'RegisteredStudent', 'RegisteredTeacher'];
        
        for (const collectionName of collections) {
          const q = query(
            collection(db, collectionName),
            where("email", "==", user.email)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setUserData(data);
            setProfileData({
              name: data.name || '',
              email: data.email || '',
              campus: data.campus || '',
              course: data.course || '',
              section: data.section || '',
              studentId: data.studentId || '',
              homeAddress: data.homeAddress || '',
              elementarySchool: data.elementarySchool || '',
              highSchool: data.highSchool || '',
              mobileNumber: data.mobileNumber || '',
              facebookLink: data.facebookLink || ''
            });
            break;
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStates(prev => ({ ...prev, initial: false }));
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, profile: true }));
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const collections = ['RegisteredAdmin', 'RegisteredStudent', 'RegisteredTeacher'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = doc(db, collectionName, snapshot.docs[0].id);
          await updateDoc(docRef, {
            homeAddress: profileData.homeAddress,
            elementarySchool: profileData.elementarySchool,
            highSchool: profileData.highSchool,
            mobileNumber: profileData.mobileNumber,
            facebookLink: profileData.facebookLink
          });
          
          setSuccess('Profile updated successfully');
          break;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, password: true }));
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoadingStates(prev => ({ ...prev, password: false }));
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      // Update password in collections
      const collections = ['RegisteredAdmin', 'RegisteredStudent', 'RegisteredTeacher'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = doc(db, collectionName, snapshot.docs[0].id);
          await updateDoc(docRef, {
            customPassword: newPassword,
            upass: newPassword
          });
          break;
        }
      }
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, password: false }));
    }
  };

  const handleNfcPasswordUpdate = async (e) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, nfc: true }));
    setError('');
    setSuccess('');

    if (nfcPassword !== confirmNfcPassword) {
      setError('NFC passwords do not match');
      setLoadingStates(prev => ({ ...prev, nfc: false }));
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const collections = ['RegisteredAdmin', 'RegisteredStudent', 'RegisteredTeacher'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = doc(db, collectionName, snapshot.docs[0].id);
          await updateDoc(docRef, {
            LoginNFC: nfcPassword
          });
          break;
        }
      }

      setSuccess('NFC password updated successfully');
      setNfcPassword('');
      setConfirmNfcPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, nfc: false }));
    }
  };

  if (loadingStates.initial) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Loading user data..." size="large" />
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>Settings</h1>

      <button 
        onClick={() => setIsModalOpen(true)}
        className={styles.navButton}
      >
        <Eye size={20} />
        <span>View Profile</span>
      </button>

      <UserDataModal 
        userData={userData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
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

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.contentSection}>
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={profileData.name}
                className={styles.input}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={profileData.email}
                className={styles.input}
                disabled
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Campus</label>
              <input
                type="text"
                value={profileData.campus}
                className={styles.input}
                disabled
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Course</label>
              <input
                type="text"
                value={profileData.course}
                className={styles.input}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Section</label>
              <input
                type="text"
                value={profileData.section}
                className={styles.input}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Student ID</label>
              <input
                type="text"
                value={profileData.studentId}
                className={styles.input}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Home Address</label>
              <input
                type="text"
                value={profileData.homeAddress}
                onChange={(e) => setProfileData({...profileData, homeAddress: e.target.value})}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Elementary School</label>
              <input
                type="text"
                value={profileData.elementarySchool}
                onChange={(e) => setProfileData({...profileData, elementarySchool: e.target.value})}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>High School</label>
              <input
                type="text"
                value={profileData.highSchool}
                onChange={(e) => setProfileData({...profileData, highSchool: e.target.value})}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mobile Number</label>
              <input
                type="tel"
                value={profileData.mobileNumber}
                onChange={(e) => setProfileData({...profileData, mobileNumber: e.target.value})}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Facebook Link</label>
              <input
                type="url"
                value={profileData.facebookLink}
                onChange={(e) => setProfileData({...profileData, facebookLink: e.target.value})}
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loadingStates.profile}
            >
              {loadingStates.profile ? <Loading text="Updating..." size="small" /> : 'Update Profile'}
            </button>
          </form>
        )}

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

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loadingStates.password}
            >
              {loadingStates.password ? <Loading text="Changing password..." size="small" /> : 'Change Password'}
            </button>
          </form>
        )}

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

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loadingStates.nfc}
            >
              {loadingStates.nfc ? <Loading text="Updating NFC password..." size="small" /> : 'Update NFC Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;