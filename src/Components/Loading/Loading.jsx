import React from 'react';
import styles from './Loading.module.css'; 

const Loading = ({ size = 'default', text = 'Loading...' }) => {
  const spinnerClass = `${styles.loading_spinner} ${size !== 'default' ? styles[size] : ''}`;
  
  return (
    <div className={styles.loading_container}>
      <div className={spinnerClass}></div>
      <p className={styles.loading_text}>{text}</p>
    </div>
  );
};

export default Loading;
