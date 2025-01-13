import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, School, Building, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './ProfileCard.module.css';

const ProfileCard = ({ userData, isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [imageUrl, setImageUrl] = useState('');
  const cardRef = useRef(null);
  const storage = getStorage();

  const captureAndUpload = async () => {
    if (cardRef.current) {
      try {
        // Capture the card content as an image
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });

        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        
        // Create Firebase storage reference
        const storageRef = ref(storage, `users/${userData.email.replace('@', '_').replace('.', '_')}/academic_image/${userData.name}-profile.png`);
        
        // Upload to Firebase
        await uploadBytes(storageRef, blob);
        
        // Get download URL
        const downloadUrl = await getDownloadURL(storageRef);
        
        // Generate QR code with the download URL
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(downloadUrl)}&size=200x200`;
        setQrCodeUrl(qrUrl);
        setImageUrl(downloadUrl);
      } catch (error) {
        console.error('Error generating/uploading image:', error);
      }
    }
  };

  useEffect(() => {
    if (userData) {
      captureAndUpload();
    }
  }, [userData]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Profile Card Content */}
        <div ref={cardRef} className={styles.cardContent}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
            <img 
              src="/api/placeholder/120/120" 
              alt="Profile"
              className={styles.profileImage}
            />
          </div>

          {/* Main Content Grid */}
          <div className={styles.gridContainer}>
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className={styles.sectionTitle}>
                Personal Information
              </h2>
              <div className="space-y-3">
                <div className={styles.infoItem}>
                  <User className={styles.icon} size={20} />
                  <span className="font-medium">{userData?.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail className={styles.icon} size={20} />
                  <span>{userData?.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone className={styles.icon} size={20} />
                  <span>{userData?.mobileNumber}</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.icon} size={20} />
                  <span>{userData?.homeAddress}</span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className={styles.sectionTitle}>
                Academic Information
              </h2>
              <div className="space-y-3">
                <div className={styles.infoItem}>
                  <Building className={styles.icon} size={20} />
                  <span>Campus: {userData?.campus}</span>
                </div>
                <div className={styles.infoItem}>
                  <BookOpen className={styles.icon} size={20} />
                  <span>Course: {userData?.course}</span>
                </div>
                <div className={styles.infoItem}>
                  <User className={styles.icon} size={20} />
                  <span>Student ID: {userData?.studentId}</span>
                </div>
                <div className={styles.infoItem}>
                  <School className={styles.icon} size={20} />
                  <span>Section: {userData?.section}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Background */}
          <div className="mt-8">
            <h2 className={styles.sectionTitle}>
              Educational Background
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className={styles.infoItem}>
                <School className={styles.icon} size={20} />
                <div>
                  <p className="font-medium">Elementary School</p>
                  <p className="text-gray-600">{userData?.elementarySchool}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <School className={styles.icon} size={20} />
                <div>
                  <p className="font-medium">High School</p>
                  <p className="text-gray-600">{userData?.highSchool}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className={styles.qrCodeContainer}>
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt="Profile QR Code"
                  className={styles.qrCode}
                />
                <p className={styles.qrCodeText}>
                  Scan to view profile information
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
