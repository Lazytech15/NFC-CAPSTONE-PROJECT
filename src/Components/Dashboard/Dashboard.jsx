import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatisticsChart from './Dashboardstatistic';
import styles from './Dashboard.module.css';
import Dashboardeventlist from './Dashboardeventlist';

function Dashboard() {
  const location = useLocation();
  const userData = location.state?.userData;
  const isRootPath = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        {isRootPath ? (
          <>
            <div className={styles.welcomeContainer}>
              <h1 className={styles.welcomeTitle}>
                Welcome<br/> 
                <span>{userData?.name}</span>
              </h1>
              <p className={styles.welcomeText}>
                Select an option from the sidebar to get started
              </p>
            </div>
            {userData && userData.position !== "Student" && userData.position !== "Teacher" && (
              <StatisticsChart />
            )}
            {userData && userData.position !== "Admin" && userData.position !== "Teacher" && (
              <Dashboardeventlist />
            )}
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
