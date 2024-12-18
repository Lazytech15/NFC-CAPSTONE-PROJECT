import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadString,
  getDownloadURL
} from 'firebase/storage';
import { format } from 'date-fns';

const UserActionLogger = ({ children, currentPath, userData }) => {
  const auth = getAuth();
  const storage = getStorage();
  const [pendingLogs, setPendingLogs] = useState([]);

  const formatEmailForPath = (email) => {
    return email.replace(/[@.]/g, '_');
  };

  const saveLogsToFile = async () => {
    if (!auth.currentUser || pendingLogs.length === 0) return;

    const userEmail = formatEmailForPath(auth.currentUser.email);
    const today = format(new Date(), 'yyyy-MM-dd');
    const logPath = `users/${userEmail}/process_log/${today}_activity.txt`;
    const storageRef = ref(storage, logPath);

    try {
      // First, try to get existing content
      let existingContent = '';
      try {
        const url = await getDownloadURL(storageRef);
        const response = await fetch(url);
        existingContent = await response.text();
      } catch (error) {
        // File doesn't exist yet, start with empty content
        console.log('Creating new log file for today');
      }

      // Combine existing content with new logs
      const newContent = pendingLogs.join('\n');
      const fullContent = existingContent 
        ? `${existingContent}\n${newContent}`
        : newContent;

      // Upload the combined content
      await uploadString(storageRef, fullContent, 'raw', { contentType: 'text/plain' });
      console.log('Logs saved successfully');
      
      // Clear pending logs after successful save
      setPendingLogs([]);
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };

  const addLog = (action) => {
    if (!auth.currentUser) return;
    
    const logEntry = `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${action}`;
    setPendingLogs(prev => [...prev, logEntry]);
  };

  const getElementDescription = (element) => {
    // First, check for file upload input
    if (element.type === 'file') {
      const files = element.files;
      if (files && files.length > 0) {
        return Array.from(files).map(f => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join(', ');
      }
      return 'File upload input';
    }

    const navLinkSpan = element.querySelector('span');
    if (navLinkSpan) {
      return navLinkSpan.textContent.trim();
    }

    // Fallback to existing description methods
    const spanInside = element.querySelector('span');
    if (spanInside) return spanInside.textContent.trim();

    if (element.tagName.toLowerCase() === 'a') {
      return element.getAttribute('to') || element.getAttribute('href') || 'Link';
    }

    if (element.tagName.toLowerCase() === 'input') {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) return `Input: ${placeholder}`;

      const name = element.getAttribute('name');
      if (name) return `Input: ${name}`;

      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) return `Input: ${labelElement.textContent.trim()}`;
    }

    if (element.tagName.toLowerCase() === 'select') { 
        const name = element.getAttribute('name'); 
        if (name) return `Select: ${name}`; 
    }

    return element.className || element.tagName.toLowerCase();
  };

  // Save logs periodically and when component unmounts
  useEffect(() => {
    const saveInterval = setInterval(saveLogsToFile, 60000); // Save every minute

    return () => {
      clearInterval(saveInterval);
      saveLogsToFile(); // Save remaining logs on unmount
    };
  }, [pendingLogs]);

  // Set up event listeners
  useEffect(() => {

    const handleClick = (e) => {
      const element = e.target;
      
      const sidebarNavItem = element.closest('.styles_navItem__');
      
      if (sidebarNavItem) {
        const description = getElementDescription(sidebarNavItem);
        
        // Categorize sidebar actions more specifically
        let actionCategory = 'Sidebar Navigation';
        
        // Check for specific sidebar sections
        if (description.includes('Dashboard')) {
          actionCategory = 'Dashboard Navigation';
        } else if (description.includes('Create Event')) {
          actionCategory = 'Event Creation';
        } else if (description.includes('Event List')) {
          actionCategory = 'Event Listing';
        } else if (description.includes('Registered Students')) {
          actionCategory = 'Student Management';
        } else if (description.includes('Registered Teacher')) {
          actionCategory = 'Teacher Management';
        } else if (description.includes('Teacher Registration')) {
          actionCategory = 'Teacher Registration';
        } else if (description.includes('Student Registration')) {
          actionCategory = 'Student Registration';
        } else if (description.includes('NFC Reader')) {
          actionCategory = 'NFC Management';
        } else if (description.includes('File Manager')) {
          actionCategory = 'File Management';
        } else if (description.includes('Logout')) {
          actionCategory = 'Authentication';
        }

        const actionDescription = `${actionCategory}: Clicked "${description}"`;
        addLog(actionDescription);
      }
      
      // Specific handling for file manager action buttons
      if (['button', 'div', 'li', 'a'].includes(element.tagName.toLowerCase())) {
        const buttonText = element.textContent?.trim().toLowerCase();    

       // General description logging
        const description = getElementDescription(element);
        const actionDescription = `Clicked on ${element.tagName.toLowerCase()}: ${description}`;
        addLog(actionDescription);
      }
    };

    const handleBlur = (e) => {
      const element = e.target;
      if (['input', 'textarea', 'select'].includes(element.tagName.toLowerCase())) {
        const description = getElementDescription(element);
        const actionDescription = `Input value in ${description} - Final Value: ${element.value}`;
        addLog(actionDescription);
      }
    };

    const handleFormSubmit = (e) => {
      const element = e.target;
      const name = element.getAttribute('name');
      const id = element.getAttribute('id');
      const actionDescription = `Form submitted${name ? ` - Form Name: "${name}"` : id ? ` - Form ID: "${id}"` : ''}`;
      addLog(actionDescription);
      // Save logs immediately on form submit
      saveLogsToFile();
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('blur', handleBlur, true); // Use capture phase
    document.addEventListener('submit', handleFormSubmit);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('blur', handleBlur, true);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [auth.currentUser]);

  useEffect(() => {
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const uploadPath = `${currentPath}/${file.name}`;
      const fileDetails = `File Upload: "${file.name}" (${(file.size / 1024).toFixed(2)} KB) to "${uploadPath}"`;
      addLog(fileDetails);
    };

    const handleCreateFolder = (folderName) => {
      const folderPath = `${currentPath}/${folderName}`;
      const folderDetails = `Created Folder: "${folderName}" at "${folderPath}"`;
      addLog(folderDetails);
    };

    const handleMove = (item, destinationPath) => {
      const sourcePath = `${currentPath}/${item.name}`;
      const moveDetails = `Moved ${item.type}: "${item.name}" from "${sourcePath}" to "${destinationPath}"`;
      addLog(moveDetails);
    };

    const handleCopy = (item, destinationPath) => {
      const sourcePath = `${currentPath}/${item.name}`;
      const copyDetails = `Copied ${item.type}: "${item.name}" from "${sourcePath}" to "${destinationPath}"`;
      addLog(copyDetails);
    };

    const handleDelete = (item) => {
      const itemPath = `${currentPath}/${item.name}`;
      const deleteDetails = `Deleted ${item.type}: "${item.name}" from "${itemPath}"`;
      addLog(deleteDetails);
    };

    const handleRename = (oldItem, newName) => {
      const oldPath = `${currentPath}/${oldItem.name}`;
      const newPath = `${currentPath}/${newName}`;
      const renameDetails = `Renamed ${oldItem.type}: from "${oldItem.name}" to "${newName}" at path "${currentPath}"`;
      addLog(renameDetails);
    };

    // Expose methods to be called from the file manager
    window.userActionLogger = {
      onFileUpload: handleFileUpload,
      onCreateFolder: handleCreateFolder,
      onMove: handleMove,
      onCopy: handleCopy,
      onDelete: handleDelete,
      onRename: handleRename
    };

    // Cleanup
    return () => {
      delete window.userActionLogger;
    };
  }, [currentPath, userData]);

  return <>{children}</>;
};

export default UserActionLogger;