import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container); 
root.render(<App />);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/NFC-CAPSTONE-PROJECT/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registration successful with scope: ', registration.scope);
    }).catch((error) => {
      console.log('Service Worker registration failed: ', error);
    });
}
