import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, School, Building, BookOpen, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './ProfileCard.module.css';
import Buttons from '../Button/Button.module.css';

const ProfileCard = ({ userData, isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const cardRef = useRef(null);
  const storage = getStorage();

  const captureAndUpload = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        const storageRef = ref(storage, `users/${userData.email.replace('@', '_').replace('.', '_')}/academic_image/${userData.name}-profile.png`);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(downloadUrl)}&size=200x200`;
        setQrCodeUrl(qrUrl);
        setImageUrl(downloadUrl);
      } catch (error) {
        console.error('Error generating/uploading image:', error);
      }
    }
  };

  useEffect(() => {
    if (userData && isOpen) {
      captureAndUpload();
    }
  }, [userData, isOpen]);

  if (!isOpen || !userData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={`${Buttons.buttons} ${styles.closeModalButton}`}>
          <X size={24} />
        </button>
        
        <div ref={cardRef} className={styles.cardContent}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.headerTitle}>Student Profile</h1>
              <p className={styles.headerSubtitle}>{userData.studentId}</p>
            </div>
            <div className={styles.profileImageContainer}>
              <img 
                src={userData.selfieUrl}
                alt={userData.name}
                className={styles.profileImage}
              />
              <p className={styles.profileName}>{userData.name}</p>
            </div>
          </div>

          <div className={styles.gridContainer}>
            <section className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Mail className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{userData.email}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Phone className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{userData.mobileNumber}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Address</span>
                    <span className={styles.infoValue}>{userData.homeAddress}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.infoSection}>
              <h2 className={styles.sectionTitle}>Academic Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Building className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Campus</span>
                    <span className={styles.infoValue}>{userData.campus}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <BookOpen className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Course</span>
                    <span className={styles.infoValue}>{userData.course}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <School className={styles.icon} size={20} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Section</span>
                    <span className={styles.infoValue}>{userData.section}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className={styles.educationSection}>
            <h2 className={styles.sectionTitle}>Educational Background</h2>
            <div className={styles.educationGrid}>
              <div className={styles.infoItem}>
                <School className={styles.icon} size={20} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>Elementary School</span>
                  <span className={styles.infoValue}>{userData.elementarySchool}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <School className={styles.icon} size={20} />
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>High School</span>
                  <span className={styles.infoValue}>{userData.highSchool}</span>
                </div>
              </div>
            </div>
          </section>

          {qrCodeUrl && (
            <section className={styles.qrCodeSection}>
              <div className={styles.qrCodeContainer}>
                <img
                  src={qrCodeUrl}
                  alt="Profile QR Code"
                  className={styles.qrCode}
                />
                <p className={styles.qrCodeText}>
                  Scan to view digital profile
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
