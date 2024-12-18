import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { initializeApp } from "firebase/app";
import { Users, UserCheck, Mail, Clock, CalendarCheck, Calendar, Nfc, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  ResponsiveContainer
} from 'recharts';

import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit,
  getFirestore 
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",
    authDomain: "online-attendance-21f95.firebaseapp.com",
    databaseURL: "https://online-attendance-21f95-default-rtdb.firebaseio.com",
    projectId: "online-attendance-21f95",
    storageBucket: "online-attendance-21f95.appspot.com",
    messagingSenderId: "756223518392",
    appId: "1:756223518392:web:5e8d28c78f7eefb8be764d"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DashboardStats = () => {
  // State for storing fetched data
  const [registrationData, setRegistrationData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [stats, setStats] = useState([
    { 
      title: 'Total Students', 
      value: '0', 
      icon: Users, 
      color: 'blue',
      details: [
        { label: 'Recent Registrations', value: '0' },
        { label: 'Active Students', value: '0' },
        { label: 'New This Month', value: '0' }
      ]
    },
    { 
      title: 'Total Teachers', 
      value: '0', 
      icon: UserCheck, 
      color: 'green',
      details: [
        { label: 'Full-Time', value: '0' },
        { label: 'Part-Time', value: '0' },
        { label: 'New Hires', value: '0' }
      ]
    },
    { 
      title: 'Messages Today', 
      value: '0', 
      icon: Mail, 
      color: 'yellow',
      details: [
        { label: 'Unread', value: '0' },
        { label: 'Priority', value: '0' },
        { label: 'Average Response Time', value: 'N/A' }
      ]
    },
    { 
      title: 'Pending Messages', 
      value: '0', 
      icon: Clock, 
      color: 'red',
      details: [
        { label: 'Waiting >24hrs', value: '0' },
        { label: 'High Priority', value: '0' },
        { label: 'Department Breakdown', value: 'N/A' }
      ]
    },
    { 
      title: 'Pending NFC Card', 
      value: '0', 
      icon: Nfc, 
      color: 'purple',
      details: [
        { label: 'Processed', value: '0' },
        { label: 'In Review', value: '0' },
        { label: 'Awaiting Approval', value: '0' }
      ]
    },
    { 
      title: 'Pending Events', 
      value: '0', 
      icon: Calendar, 
      color: 'orange',
      details: [
        { label: 'Upcoming', value: '0' },
        { label: 'This Week', value: '0' },
        { label: 'Requires Action', value: '0' }
      ]
    }
  ]);

  // State to manage which stats card is expanded
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  const updateStatsDetails = async () => {
    try {
      // You would fetch specific details for each stat category here
      // This is a placeholder implementation
      setStats(prevStats => prevStats.map((stat, index) => {
        switch(stat.title) {
          case 'Total Students':
            return {
              ...stat, 
              details: [
                { ...stat.details[0], value: '15' },
                { ...stat.details[1], value: '250' },
                { ...stat.details[2], value: '45' }
              ]
            };
          case 'Total Teachers':
            return {
              ...stat, 
              details: [
                { ...stat.details[0], value: '30' },
                { ...stat.details[1], value: '10' },
                { ...stat.details[2], value: '5' }
              ]
            };
          case 'Messages Today':
            return {
              ...stat, 
              details: [
                { ...stat.details[0], value: '25' },
                { ...stat.details[1], value: '3' },
                { ...stat.details[2], value: '2hrs' }
              ]
            };
          // Add similar logic for other stat categories
          default:
            return stat;
        }
      }));
    } catch (error) {
      console.error('Error updating stats details:', error);
    }
  };

    // Fetch all data on component mount
    useEffect(() => {
        fetchRegistrationData();
        fetchMessagesData();
        fetchEventsData();
        updateStatsDetails(); // New method to fetch additional details
      }, []);

      const toggleDropdown = (index) => {
        setExpandedCardIndex(expandedCardIndex === index ? null : index);
      };

  // Fetch registration data (students, teachers)
  const fetchRegistrationData = async () => {
    try {
      // Fetch students
      const studentsRef = collection(db, 'RegisteredStudent');
      const studentsSnapshot = await getDocs(studentsRef);
      const studentCount = studentsSnapshot.size;

      // Fetch teachers
      const teachersRef = collection(db, 'RegisteredTeacher');
      const teachersSnapshot = await getDocs(teachersRef);
      const teacherCount = teachersSnapshot.size;

      // Prepare monthly registration data
      const monthlyRegistrations = await Promise.all([
        fetchMonthlyRegistrations('RegisteredStudent'),
        fetchMonthlyRegistrations('RegisteredTeacher'),
        fetchMonthlyRegistrations('RegisteredAdmin')
      ]);

      setRegistrationData(monthlyRegistrations.flat());

      // Update stats
      setStats(prevStats => prevStats.map(stat => 
        stat.title === 'Total Students' ? { ...stat, value: studentCount.toString() } :
        stat.title === 'Total Teachers' ? { ...stat, value: teacherCount.toString() } :
        stat
      ));
    } catch (error) {
      console.error('Error fetching registration data:', error);
    }
  };

  // Fetch monthly registrations
  const fetchMonthlyRegistrations = async (collectionName) => {
    try {
      const ref = collection(db, collectionName);
      const q = query(
        ref, 
        orderBy('createdAt', 'desc'), 
        limit(4)
      );
      const snapshot = await getDocs(q);

      // Group registrations by month
      const monthlyData = snapshot.docs.reduce((acc, doc) => {
        const date = doc.data().createdAt.toDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const existingMonth = acc.find(item => item.month === month);

        if (existingMonth) {
          existingMonth[collectionName.replace('Registered', '').toLowerCase() + 's']++;
        } else {
          acc.push({
            month,
            [collectionName.replace('Registered', '').toLowerCase() + 's']: 1,
            students: 0,
            teachers: 0,
            admins: 0
          });
        }

        return acc;
      }, []);

      return monthlyData;
    } catch (error) {
      console.error(`Error fetching ${collectionName} data:`, error);
      return [];
    }
  };

  // Fetch messages data
  const fetchMessagesData = async () => {
    try {
      const messagesRef = collection(db, 'Messages');
      
      // Today's messages
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayMessagesQuery = query(
        messagesRef, 
        where('createdAt', '>=', todayStart)
      );
      const todayMessagesSnapshot = await getDocs(todayMessagesQuery);
      const totalMessages = todayMessagesSnapshot.size;

      // Pending messages
      const pendingMessagesQuery = query(
        messagesRef, 
        where('status', '==', 'pending')
      );
      const pendingMessagesSnapshot = await getDocs(pendingMessagesQuery);
      const pendingMessages = pendingMessagesSnapshot.size;

      // Daily message trend
      const dailyMessagesData = await fetchDailyMessages();
      setMessageData(dailyMessagesData);

      // Update stats
      setStats(prevStats => prevStats.map(stat => 
        stat.title === 'Messages Today' ? { ...stat, value: totalMessages.toString() } :
        stat.title === 'Pending Messages' ? { ...stat, value: pendingMessages.toString() } :
        stat
      ));
    } catch (error) {
      console.error('Error fetching messages data:', error);
    }
  };

  // Fetch daily messages
  const fetchDailyMessages = async () => {
    try {
      const messagesRef = collection(db, 'Messages');
      const last5DaysStart = new Date();
      last5DaysStart.setDate(last5DaysStart.getDate() - 5);

      const q = query(
        messagesRef, 
        where('createdAt', '>=', last5DaysStart),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);

      // Group messages by day
      const dailyData = snapshot.docs.reduce((acc, doc) => {
        const date = doc.data().createdAt.toDate();
        const day = date.toLocaleString('default', { weekday: 'short' });
        const existingDay = acc.find(item => item.day === day);

        if (existingDay) {
          existingDay.messages++;
          if (doc.data().status === 'pending') {
            existingDay.pending++;
          }
        } else {
          acc.push({
            day,
            messages: 1,
            pending: doc.data().status === 'pending' ? 1 : 0
          });
        }

        return acc;
      }, []);

      return dailyData;
    } catch (error) {
      console.error('Error fetching daily messages:', error);
      return [];
    }
  };

  // Fetch events data
  const fetchEventsData = async () => {
    try {
      const registeredEventsRef = collection(db, 'Toregistered');
      const pendingEventsRef = collection(db, 'PendingEvent');

      const registeredEventsSnapshot = await getDocs(registeredEventsRef);
      const pendingEventsSnapshot = await getDocs(pendingEventsRef);

      const registeredEventsCount = registeredEventsSnapshot.size;
      const pendingEventsCount = pendingEventsSnapshot.size;

      // Update stats
      setStats(prevStats => prevStats.map(stat => 
        stat.title === 'Pending NFC Card' ? { ...stat, value: registeredEventsCount.toString() } :
        stat.title === 'Pending Events' ? { ...stat, value: pendingEventsCount.toString() } :
        stat
      ));
    } catch (error) {
      console.error('Error fetching events data:', error);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchRegistrationData();
    fetchMessagesData();
    fetchEventsData();
  }, []);

  return (
    <div className={styles.dashboardStatisticContainer}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statsCard}>
            <div 
              className={styles.statsCardContent} 
              onClick={() => toggleDropdown(index)}
            >
              <div className={styles.statsTextContainer}>
                <p className={styles.statsTitle}>{stat.title}</p>
                <p className={styles.statsValue}>{stat.value}</p>
              </div>
              <div className={styles.statsIconContainer}>
                <stat.icon className={`${styles.statsIcon} ${styles[`icon-${stat.color}`]}`} />
                {expandedCardIndex === index ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>
            
            {/* Dropdown Details */}
            {expandedCardIndex === index && (
              <div className={styles.statsDropdown}>
                {stat.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className={styles.statsDropdownItem}>
                    <span className={styles.statsDropdownLabel}>{detail.label}</span>
                    <span className={styles.statsDropdownValue}>{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        {/* Registration Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Registration Trends</h3>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={registrationData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="teachers" fill="#22c55e" name="Teachers" />
                <Bar dataKey="admins" fill="#eab308" name="Admins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Messages Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Message Activity</h3>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messageData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#3b82f6" 
                  name="Total Messages"
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#ef4444" 
                  name="Pending Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;