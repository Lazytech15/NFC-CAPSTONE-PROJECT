import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ size = 'default', text = 'Loading...' }) => {
  const containerClass = `${styles.loading_container} ${size !== 'default' ? styles[size] : ''}`;
  
  return (
    <div className={containerClass}>
      <div className={styles.hand_container}>
        <div className={`${styles.finger} ${styles.finger1}`}>
          <div className={styles.finger_item}>
            <span></span><i></i>
          </div>
        </div>
        <div className={`${styles.finger} ${styles.finger2}`}>
          <div className={styles.finger_item}>
            <span></span><i></i>
          </div>
        </div>
        <div className={`${styles.finger} ${styles.finger3}`}>
          <div className={styles.finger_item}>
            <span></span><i></i>
          </div>
        </div>
        <div className={`${styles.finger} ${styles.finger4}`}>
          <div className={styles.finger_item}>
            <span></span><i></i>
          </div>
        </div>
        <div className={styles.last_finger}>
          <div className={styles.last_finger_item}><i></i></div>
        </div>
      </div>
      <p className={styles.loading_text}>{text}</p>
    </div>
  );
};

export default Loading;