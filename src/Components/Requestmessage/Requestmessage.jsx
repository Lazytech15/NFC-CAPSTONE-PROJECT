import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Paperclip, Mail, Inbox, ExternalLink, Trash, Menu, Bell } from 'lucide-react';
import styles from './Requestmessage.module.css';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { requestNotificationPermission, onMessageListener, showNotification } from '/utils/firebase-messaging';
import Buttons from '../Button/Button.module.css';
import NotificationDialog from './NotificationDialog.jsx'
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("oISKdHxQTlz06KQWx");

const RequestForm = ({ onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isNotificationRequesting, setIsNotificationRequesting] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [hasClosedPrompt, setHasClosedPrompt] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [showNotificationUI, setShowNotificationUI] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      const isGranted = Notification.permission === 'granted';
      setNotificationEnabled(isGranted);
      setShowNotificationUI(!isGranted);
    }
  }, []);
  // Add this useEffect to check notification status when component mounts
useEffect(() => {
  if ('Notification' in window) {
    setNotificationEnabled(Notification.permission === 'granted');
  }
}, []);

  // Initialize service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
      });
    }
  }, []);

  const showNotificationMessage = async (title, options) => {
    if (!swRegistration) return;
    
    try {
      await swRegistration.showNotification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    attachment: null
  });

  const db = getFirestore();
  const auth = getAuth();
  const functions = getFunctions();
  const sidebarRef = useRef(null);

  const findUserCollectionAndUpdate = async (email, updateData) => {
    const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
    
    for (const collectionName of collections) {
      const q = query(collection(db, collectionName), where("email", "==", email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userRef = doc(db, collectionName, userDoc.id);
        console.log(useRef);
        
        // Update the document directly
        await updateDoc(userRef, updateData);
        
        return {
          collectionName,
          docId: userDoc.id,
          userData: { ...userDoc.data(), ...updateData }
        };
      }
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload) => {
        const { title, body } = payload.notification;
        showNotification(title, {
          body,
          icon: '/path/to/your/icon.png',
          clickHandler: () => {
            // Handle notification click
            if (payload.data?.messageId) {
              // Navigate to the message or update UI
              const message = messages.find(m => m.id === payload.data.messageId);
              if (message) {
                setSelectedMessage(message);
                setShowCompose(false);
              }
            }
          }
        });
        
        // Refresh messages list
        fetchMessages();
      })
      .catch(err => console.error('Failed to process notification:', err));
  
    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkNotificationStatus();
        fetchMessages();
      } else {
        setNotificationEnabled(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest(`.${styles.hamburgerMenu}`)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
      const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
  
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName), 
          where("email", "==", currentUser.email)
        );
        const snapshot = await getDocs(q);
  
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          // Check if fcmTokens array exists and has at least one valid token
          const hasValidToken = userData.fcmTokens && 
            Array.isArray(userData.fcmTokens) && 
            userData.fcmTokens.length > 0 &&
            userData.fcmTokens.some(tokenData => tokenData.token);
          
          setNotificationEnabled(hasValidToken);
          break;
        }
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleEnableNotifications = async () => {
    if (isNotificationRequesting) return;
    
    setIsNotificationRequesting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please sign in to enable notifications');
        return;
      }

      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== 'granted') {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      const token = await requestNotificationPermission(currentUser.uid);
      if (token) {
        const userInfo = await findUserCollectionAndUpdate(currentUser.email, {
          fcmTokens: [{
            token: token,
            lastUpdated: new Date().toISOString(),
            device: navigator.userAgent
          }]
        });

        if (!userInfo) {
          throw new Error('User not found in any collection');
        }

        setNotificationEnabled(true);
        setShowNotificationUI(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsNotificationRequesting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotificationUI(false);
  };
  
  const handleNotificationConfirm = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Please sign in to enable notifications');
      return;
    }

    // First request notification permission
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== 'granted') {
      alert('Notification permission denied. Please enable notifications in your browser settings.');
      return;
    }

    // Then proceed with Firebase token request
    const token = await requestNotificationPermission(currentUser.uid);
    if (token) {
      const userInfo = await findUserCollectionAndUpdate(currentUser.email, {
        fcmTokens: [{
          token: token,
          lastUpdated: new Date().toISOString(),
          device: navigator.userAgent
        }]
      });

      if (!userInfo) {
        alert('User not found in any collection');
        return;
      }

      setNotificationEnabled(true);
    }
  } catch (error) {
    console.error('Error enabling notifications:', error);
    alert('Failed to enable notifications. Please try again.');
  } finally {
    setShowNotificationDialog(false);
  }
};

  const fetchMessages = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
      const messagesRef = collection(db, 'Messages');
      
      // Fetch Inbox Messages
      const inboxQuery = query(messagesRef, where('sendTo', '==', currentUser.email));
      const inboxSnapshot = await getDocs(inboxQuery);
      const inboxFetchedMessages = [];
      inboxSnapshot.forEach((doc) => {
        inboxFetchedMessages.push({ id: doc.id, ...doc.data() });
      });
      
      // Fetch Sent Messages
      const sentQuery = query(messagesRef, where('sender', '==', currentUser.email));
      const sentSnapshot = await getDocs(sentQuery);
      const sentFetchedMessages = [];
      sentSnapshot.forEach((doc) => {
        sentFetchedMessages.push({ id: doc.id, ...doc.data() });
      });

      // Sort messages by timestamp in descending order
      inboxFetchedMessages.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
      sentFetchedMessages.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());

      // Update state
      setInboxMessages(inboxFetchedMessages);
      setSentMessages(sentFetchedMessages);
      
      // Set messages based on current folder
      setMessages(currentFolder === 'inbox' ? inboxFetchedMessages : sentFetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFolderChange = (folder) => {
    setCurrentFolder(folder);
    setShowCompose(false);
    setSelectedMessage(null);
    
    // Set messages based on selected folder
    setMessages(folder === 'inbox' ? inboxMessages : sentMessages);
  };
  
  const handleToread = async (messageId) => {
    try {
      const messageRef = doc(db, 'Messages', messageId);
      await updateDoc(messageRef, {
        read: true
      });
      console.log('Message marked as read');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  async function sendEmail(to, subject, text) {
    const response = await fetch('https://next-gen-permss.netlify.app/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, subject, text })
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    const data = await response.json();
    return data;
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Dynamically set the recipient's email address
        const emailParams = {
            to: formData.to, // Use the email address entered in the form
            subject: formData.subject,
            text: formData.message // Use 'text' instead of 'message'
        };

        try {
            const emailResponse = await sendEmail(emailParams.to, emailParams.subject, emailParams.text);

            if (emailResponse.status === 200) {
                console.log('Email sent successfully');
            }
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // We'll continue with Firebase storage even if email fails
        }

        // Store message in Firebase (now optional - for registered users only)
        const recipientExists = await checkIfRecipientExists(formData.to);

        if (recipientExists) {
            const messageRef = await addDoc(collection(db, 'Messages'), {
                sendTo: formData.to,
                subject: formData.subject,
                message: formData.message,
                sender: currentUser.email,
                timestamp: serverTimestamp(),
                read: false
            });

            // Handle notifications for registered recipients
            const recipientData = await getRecipientData(formData.to);

            if (recipientData?.fcmToken) {
                const sendNotification = httpsCallable(functions, 'sendNotification');
                await sendNotification({
                    token: recipientData.fcmToken,
                    title: `New message from ${currentUser.email}`,
                    body: formData.subject,
                    data: {
                        messageId: messageRef.id,
                        type: 'new_message',
                        url: `/messages/${messageRef.id}`
                    }
                });
            }
        }

        // Show success notification to sender
        if (notificationEnabled && swRegistration) {
            await showNotificationMessage('Message Sent', {
                body: `Your message "${formData.subject}" has been sent to ${formData.to}`,
                icon: '/icons/icon.svg'
            });
        }

        // Reset form and update UI
        setFormData({
            to: '',
            subject: '',
            message: '',
            attachment: null
        });
        setShowCompose(false);
        fetchMessages();

    } catch (error) {
        console.error('Error in send process:', error);
        // Show error notification
        if (notificationEnabled && swRegistration) {
            await showNotificationMessage('Error Sending Message', {
                body: 'There was an error sending your message. Please try again.',
                icon: '/icons/icon.svg'
            });
        }
    }
};

  

  // Helper function to check if recipient is registered
    const checkIfRecipientExists = async (email) => {
      const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
      
      for (const collectionName of collections) {
        const q = query(collection(db, collectionName), where('email', '==', email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return true;
        }
      }
      return false;
    };
  
    // Helper function to get recipient data
    const getRecipientData = async (email) => {
      const collections = ['RegisteredAdmin', 'RegisteredTeacher', 'RegisteredStudent'];
      
      for (const collectionName of collections) {
        const q = query(collection(db, collectionName), where('email', '==', email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
      }
      return null;
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      attachment: e.target.files[0]
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = (folder) => {
    setCurrentFolder(folder);
    setShowCompose(false);
    setSelectedMessage(null);
    setIsSidebarOpen(false);
  };
  
  const renderFormHeader = () => (
    <div className={styles.composeHeader}>
      <button className={Buttons.buttons} onClick={() => handleFolderChange('inbox')}>
        BACK
      </button>
      <h2 className={styles.headerTitle}>Messages</h2>
      {showNotificationUI && !notificationEnabled && !isNotificationRequesting && (
        <button
          onClick={handleEnableNotifications}
          className={`${styles.notificationButton} ${Buttons.buttons}`}
          disabled={isNotificationRequesting}
          title="Enable notifications"
        >
          <Bell />
        </button>
      )}
      <button className={styles.hamburgerMenu} onClick={toggleSidebar}>
        <Menu />
      </button>
    </div>
  );

  return (
    <>
      <div className={`${styles.formOverlay} ${isMinimized ? '' : styles.visible}`} onClick={onClose} />
      <div className={`${styles.composeWrapper} ${isMinimized ? styles.minimized : ''}`}>
      {renderFormHeader()}

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Sidebar */}
          <div ref={sidebarRef} className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarMobile : ''}`}>
          
            <button 
              className={Buttons.buttons}
              onClick={() => {
                setShowCompose(true);
                setSelectedMessage(null);
                setIsSidebarOpen(false);
              }}
            >
              <Mail /> Compose
            </button>
            
            <div className={styles.sidebarMenu}>
              <button 
                className={`${styles.menuItem} ${currentFolder === 'inbox' && !showCompose ? styles.active : ''}`}
                onClick={() => handleFolderChange('inbox')}
              >
                <Inbox /> Inbox ({inboxMessages.length})
              </button>
              <button 
                className={`${styles.menuItem} ${currentFolder === 'sent' && !showCompose ? styles.active : ''}`}
                onClick={() => handleFolderChange('sent')}
              >
                <ExternalLink /> Sent ({sentMessages.length})
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className={styles.contentArea}>
            {showCompose ? (
              // Compose Form
              <form onSubmit={handleSubmit} className={styles.composeForm}>
                <div className={styles.formGroup}>
                  <input
                    type="email"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="To"
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your request here..."
                    className={styles.messageInput}
                    required
                  />
                </div>

                <div className={styles.formFooter}>
                  <div className={styles.footerActions}>
                    <button type="submit" className={styles.sendButton}>
                      <Send className={styles.sendIcon} />
                      Send
                    </button>
                    
                    <label className={styles.attachButton}>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                      />
                      <Paperclip className={styles.attachIcon} />
                    </label>
                  </div>

                  {formData.attachment && (
                    <span className={styles.attachmentName}>
                      {formData.attachment.name}
                    </span>
                  )}
                </div>
              </form>
            ) : selectedMessage ? (
              // Message View
              <div className={styles.messageView}>
                <div className={styles.messageHeader}>
                  <h3>{selectedMessage.subject}</h3>
                  <span className={styles.messageDate}>{formatDate(selectedMessage.timestamp)}</span>
                </div>
                <div className={styles.messageMeta}>
                  <span>From: {selectedMessage.sender}</span>
                  <span>To: {selectedMessage.sendTo}</span>
                </div>
                <div className={styles.messageBody}>
                  {selectedMessage.message}
                </div>
              </div>
            ) : (
              // Message List
              <div className={styles.messageList}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageItem} ${!message.read && currentFolder === 'inbox' ? styles.unread : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (currentFolder === 'inbox') {
                        handleToread(message.id);
                      }
                    }}                      
                  >
                    <div className={styles.messagePreview}>
                      <span className={styles.sender}>
                        {currentFolder === 'inbox' ? message.sender : message.sendTo}
                      </span>
                      <span className={styles.subject}>{message.subject}</span>
                      <span className={styles.timestamp}>{formatDate(message.timestamp)}</span>
                    </div>
                    <div className={styles.messageSnippet}>
                      {message.message.substring(0, 100)}...
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className={styles.noMessages}>
                    No messages in your {currentFolder}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add this just before the final closing tag */}
        {/* <NotificationDialog 
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          onEnable={handleNotificationConfirm}
        /> */}
        <NotificationDialog 
          isEnabled={notificationEnabled}
          onEnable={handleEnableNotifications}
          onClose={handleNotificationClose}
        />
    </>
  );
};

export default RequestForm;
