import React from 'react';
import styles from './loadingbutton.module.css';

const ButtonLoader = () => {
  return (
    <span className={styles.button_loader}>
      <span className={styles.hand_container}>
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
      </span>
    </span>
  );
};

export default ButtonLoader;