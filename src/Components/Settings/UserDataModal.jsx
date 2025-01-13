// UserDataModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { User } from 'lucide-react';
import html2canvas from 'html2canvas';
import styles from './UserDataModal.module.css';
import ProfileCard from './ProfileCard';

const UserDataModal = ({ userData, isOpen, onClose }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const modalContentRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (userData) {
      const formattedData = {
        name: userData.name,
        email: userData.email,
        campus: userData.campus,
        course: userData.course,
        section: userData.section,
        studentId: userData.studentId,
        homeAddress: userData.homeAddress,
        elementarySchool: userData.elementarySchool,
        highSchool: userData.highSchool,
        mobileNumber: userData.mobileNumber,
        facebookLink: userData.facebookLink
      };
      const dataString = btoa(JSON.stringify(formattedData));
      setQrCodeData(dataString);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      const compactData = {
        name: userData.name,
        email: userData.email,
        academic: {
          id: userData.studentId,
          campus: userData.campus,
          course: userData.course,
          section: userData.section
        },
        contact: {
          mobile: userData.mobileNumber,
          address: userData.homeAddress,
          facebook: userData.facebookLink
        },
        education: {
          elementary: userData.elementarySchool,
          highSchool: userData.highSchool
        }
      };

      // Add a flag to indicate this QR code should trigger image download
      compactData.downloadImage = true;
      
      const dataString = btoa(JSON.stringify(compactData));
      setQrCodeData(dataString);
    }
  }, [userData]);

  if (!isOpen) return null;

    // Function to handle QR code scan and image download
    const handleQrScan = async () => {
      
        if (modalContentRef.current) {
          try {
            // Capture the modal content as an image
            const canvas = await html2canvas(modalContentRef.current, {
              backgroundColor: '#ffffff',
              scale: 2, // Increase quality
              logging: false,
              useCORS: true
            });
    
            // Convert canvas to blob
            canvas.toBlob((blob) => {
              // Create download link
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${userData?.name || 'user'}-profile.png`;
              
              // Trigger download
              document.body.appendChild(link);
              link.click();
              
              // Cleanup
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }, 'image/png', 1.0);
          } catch (error) {
            console.error('Error generating image:', error);
          }
        }
      };

      return (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} ref={modalContentRef}>
            <div className={styles.modalHeader}>
              <h1 className={styles.title}>Profile Overview</h1>
              <button className={styles.closeButton} onClick={onClose}>&times;</button>
            </div>
    
            <div className={styles.navigation}>
              <button
                className={`${styles.navButton} ${activeTab === 'personal' ? styles.active : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <User size={20} />
                <span>Personal Info</span>
              </button>
              <button
                className={`${styles.navButton} ${activeTab === 'academic' ? styles.active : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                <User size={20} />
                <span>Academic Info</span>
              </button>
              <button
                className={`${styles.navButton} ${activeTab === 'background' ? styles.active : ''}`}
                onClick={() => setActiveTab('background')}
              >
                <User size={20} />
                <span>Background</span>
              </button>
            </div>

        <div className={styles.contentSection}>
          {activeTab === 'personal' && (
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={userData?.name || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={userData?.mobileNumber || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Home Address</label>
                <input
                  type="text"
                  value={userData?.homeAddress || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Facebook Link</label>
                <input
                  type="url"
                  value={userData?.facebookLink || ''}
                  className={styles.input}
                  disabled
                />
              </div>
            </form>
          )}

          {activeTab === 'academic' && (
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Student ID</label>
                <input
                  type="text"
                  value={userData?.studentId || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Campus</label>
                <input
                  type="text"
                  value={userData?.campus || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Course</label>
                <input
                  type="text"
                  value={userData?.course || ''}
                  className={styles.input}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label>Section</label>
                <input
                  type="text"
                  value={userData?.section || ''}
                  className={styles.input}
                  disabled
                />
              </div>
            </form>
          )}

        {activeTab === 'background' && (
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label>Elementary School</label>
              <input
                type="text"
                value={userData?.elementarySchool || ''}
                className={styles.input}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label>High School</label>
              <input
                type="text"
                value={userData?.highSchool || ''}
                className={styles.input}
                disabled
              />
            </div>
            {/* <div className={styles.qrSection}>
              <h3>Profile QR Code</h3>
              <div className={styles.qrCode}>
                {qrCodeData && (
                  <>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=200x200`}
                      alt="Profile QR Code"
                      onClick={handleQrScan}
                      style={{ cursor: 'pointer' }}
                    />
                    <p className={styles.qrText}>
                      Click the QR code or scan with your phone's camera to download profile information as an image
                    </p>
                  </>
                )}
              </div>
            </div> */}
            <ProfileCard 
              userData={userData}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </form>
        )}
        </div>
      </div>
    </div>
  );
};

export default UserDataModal;