import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Components/Dashboard/Dashboard';
import CreateEvent from './Components/Create-event/CreateEvent';
import StudentRegistration from './Components/Studentregistration/StudentRegistration';
import NFCReader from './Components/NFC-Reader/Nfcreader';
import Login from './Components/Login/Login.jsx';
import EventList from './Components/Eventlist/Eventlist.jsx';
import FileManager from './Components/Filemanager/Filemanager.jsx';
import TeacherRegistration from './Components/Teacherregistration/Teacherregistration.jsx';
import RegisteredTeachers from './Components/RegisteredTeacher/Registeredteacher.jsx';
import RegisteredStudents from './Components/RegisteredStudent/Registeredstudent.jsx';
import Process_log from './Components/Process_log/Process_log.jsx';
import RequestForm from './Components/Requestmessage/Requestmessage.jsx';
import NFCScanner from './Components/Dashboard/Nfcscanner/Nfcscanner.jsx';
import PWARegistration from './Components/PWARegistration.jsx';
import NotificationManager from './Components/NotificationManager.jsx';

function App() {
  return (
    <>
    <NotificationManager/>
      <PWARegistration />
      <Process_log>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />}>
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="registered-teachers" element={<RegisteredTeachers />} />
              <Route path="registered-students" element={<RegisteredStudents />} />
              <Route path="teacher-registration" element={<TeacherRegistration />} />
              <Route path="student-registration" element={<StudentRegistration />} />
              <Route path="nfc-reader" element={<NFCReader />} />
              <Route path="event-list" element={<EventList />} />
              <Route path="request-message" element={<RequestForm />} />
              <Route path="nfc-scanner" element={<NFCScanner />} />
              <Route path="file-manager" element={<FileManager />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Process_log>
    </>
  );
}

export default App;
