import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FolderPlus, Upload, Folder, File, ArrowLeft, MoreVertical, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import styles from './Filemanager.module.css';
import Buttons from '../Button/Button.module.css';
import Process_log from '../Process_log/Process_log.jsx';

const ActionDropdown = ({ isOpen, onClose, onMove, onCopy, onDelete, onRename }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return isOpen ? (
    <div className={styles.dropdownMenu} ref={dropdownRef}>
      <button onClick={onMove}>Move</button>
      <button onClick={onCopy}>Copy</button>
      <button onClick={onRename}>Rename</button>
      <button onClick={onDelete} className={styles.deleteButton}>Delete</button>
    </div>
  ) : null;
};

const FolderSelector = ({ isOpen, onClose, currentPath, userData, selectedItem, operation, onSelect }) => {
  const [folders, setFolders] = useState([]);
  const [path, setPath] = useState('');
  const storage = getStorage();
  const [persistentSelectedItem, setPersistentSelectedItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const rootPath = `users/${userData.email.replace('@', '_').replace('.', '_')}`;
      setPath(rootPath);
      listFolders(rootPath);
    }
  }, [isOpen, userData]);

  const listFolders = async (folderPath) => {
    try {
      const storageRef = ref(storage, folderPath);
      const result = await listAll(storageRef);
      
      const foldersData = result.prefixes.map(folder => ({
        name: folder.name,
        fullPath: `${folderPath}/${folder.name}`,
      }));

      setFolders(foldersData);
    } catch (error) {
      console.error('Error listing folders:', error);
    }
  };

  const navigateToFolder = (folderPath) => {
    if (persistentSelectedItem) {
      setPersistentSelectedItem(persistentSelectedItem);
    }
    setPath(folderPath);
    listFolders(folderPath);
  };

  const goBack = () => {
    const rootPath = `users/${userData.email.replace('@', '_').replace('.', '_')}`;
    const newPath = path.split('/').slice(0, -1).join('/');
    if (newPath.startsWith(rootPath)) {
      setPath(newPath);
      listFolders(newPath);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Select Destination Folder</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalNavigation}>
          <button onClick={goBack} className={styles.backButton}>
            <ArrowLeft size={20} />
            Back
          </button>
          <span className={styles.currentPath}>{path}</span>
        </div>

        <div className={styles.folderList}>
          {folders.map(folder => (
            <div key={folder.fullPath} className={styles.folderItem}>
              <div
                className={styles.folderContent}
                onClick={() => navigateToFolder(folder.fullPath)}
              >
                <Folder size={24} />
                <span>{folder.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={() => {
              onSelect(path);
            }}
            className={Buttons.buttons}
          >
            Select This Folder
          </button>
          <button
            onClick={onClose}
            className={`${Buttons.buttons} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const FileManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [nfcSupported, setNfcSupported] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const storage = getStorage();
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const userData = location.state?.userData;
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);
  const [operation, setOperation] = useState(null);
  const [persistentSelectedItem, setPersistentSelectedItem] = useState(null);

  useEffect(() => {
    // Check for NFC support
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userData) {
      const userFolder = `users/${userData.email.replace('@', '_').replace('.', '_')}`;
      setCurrentPath(userFolder);
      listFilesAndFolders(userFolder);
    }
  }, [isAuthenticated, userData]);

  const handlePasswordAuth = () => {
    if (password === userData?.upass) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleNFCAuth = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ serialNumber }) => {
        if (serialNumber === userData?.nfcSerialNumber) {
          setIsAuthenticated(true);
          setError('');
        } else {
          setError('Invalid NFC card');
        }
      });
    } catch (error) {
      setError('Error reading NFC: ' + error.message);
    }
  };

  const listFilesAndFolders = async (path) => {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const filesPromises = result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url,
          type: 'file'
        };
      });
  
      const foldersData = result.prefixes
        .filter(folder => folder.name !== 'process_log' && folder.name !== 'event_images' && folder.name !== 'profile') // Filter out the process_log, event_images, and profile folders
        .map(folder => ({
          name: folder.name,
          type: 'folder'
        }));
  
      const filesData = await Promise.all(filesPromises);
      setFiles(filesData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error listing files:', error);
    }
  };
  
  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileRef = ref(storage, `${currentPath}/${file.name}`);
      await uploadBytes(fileRef, file);

          // Call the logger
    if (window.userActionLogger) {
      window.userActionLogger.onFileUpload(event);
    }

      await listFilesAndFolders(currentPath);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const createFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const placeholderRef = ref(storage, `${currentPath}/${folderName}/.placeholder`);
    const emptyBlob = new Blob([''], { type: 'text/plain' });
    await uploadBytes(placeholderRef, emptyBlob);

      // Call the logger
    if (window.userActionLogger) {
      window.userActionLogger.onCreateFolder(folderName);
    }

    await listFilesAndFolders(currentPath);
  };

  const navigateToFolder = (folderName) => {
    const newPath = `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
    listFilesAndFolders(newPath);
  };

  const goBack = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    if (newPath.startsWith(`users/${userData.email.replace('@', '_').replace('.', '_')}`)) {
      setCurrentPath(newPath);
      listFilesAndFolders(newPath);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <h2>Authentication Required</h2>
        <div className={styles.authMethods}>
          <div className={styles.passwordAuth}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={styles.passwordInput}
            />
            <button onClick={handlePasswordAuth} className={Buttons.buttons}>
              Submit
            </button>
          </div>
          
          {nfcSupported && (
            <div className={styles.nfcAuth}>
              <button onClick={handleNFCAuth} className={Buttons.buttons}>
                Authenticate with NFC
              </button>
            </div>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }
  
    const handleActionClick = (e, item) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({ x: rect.left, y: rect.bottom });
  
      // Set both states explicitly
      setSelectedItem(item);
      setPersistentSelectedItem(item);
    };
  
const handleMove = async () => {
  if (!persistentSelectedItem) {
      alert('Please select an item to move');
      console.log(persistentSelectedItem);
      return;
  }
  setOperation('move');
  setIsFolderSelectorOpen(true);
};

const handleCopy = async () => {
  if (!persistentSelectedItem) {
      alert('Please select an item to copy');
      console.log(persistentSelectedItem);
      return;
  }
  setOperation('copy');
  setIsFolderSelectorOpen(true);
};
  
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      // Use a different approach to delete files and folders
      const itemPath = `${currentPath}/${selectedItem.name}`;
      const itemRef = ref(storage, itemPath);

      if (selectedItem.type === 'file') {
        await deleteObject(itemRef);
      } else {
        // For folders, recursively delete all contents
        await deleteFolderRecursive(itemPath);
      }

          // Call the logger
    if (window.userActionLogger) {
      window.userActionLogger.onDelete(selectedItem);
    }

      await listFilesAndFolders(currentPath);
      // setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      // More user-friendly error handling
      alert(`Failed to delete ${selectedItem.name}. ${error.message}`);
    }
  };

  const deleteFolderRecursive = async (folderPath) => {
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);

      // Delete all files in the folder
      for (const item of result.items) {
        await deleteObject(item);
      }

      // Recursively delete all subfolders
      for (const folder of result.prefixes) {
        await deleteFolderRecursive(`${folderPath}/${folder.name}`);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const handleRename = async () => {
    if (!selectedItem) return;

    const newName = prompt('Enter new name:', selectedItem.name);
    if (!newName || newName === selectedItem.name) {
      // setSelectedItem(null);
      return;
    }

    try {
      // For simplicity, we'll implement rename as copy + delete
      const oldRef = ref(storage, `${currentPath}/${selectedItem.name}`);
      const newRef = ref(storage, `${currentPath}/${newName}`);

      if (selectedItem.type === 'file') {
        const url = await getDownloadURL(oldRef);
        const response = await fetch(url);
        const blob = await response.blob();
        await uploadBytes(newRef, blob);
        await deleteObject(oldRef);
      }

          // Call the logger
    if (window.userActionLogger) {
      window.userActionLogger.onRename(selectedItem, newName);
    }

      await listFilesAndFolders(currentPath);
      // setSelectedItem(null);
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  const handleFolderSelect = async (destinationPath) => {
    console.log('Debug - Folder Selection:', {
      persistentSelectedItem,
      currentPath,
      destinationPath,
      operation
    });
  
    if (!persistentSelectedItem) {
      console.error('No item selected');
      alert('Please select an item to move or copy');
      setIsFolderSelectorOpen(false);
      return;
  }
  
    try {
      const sourceRef = ref(storage, `${currentPath}/${persistentSelectedItem.name}`);
      const destinationRef = ref(storage, `${destinationPath}/${persistentSelectedItem.name}`);
  
      if (persistentSelectedItem.type === 'file') {
        const url = await getDownloadURL(sourceRef);
        const response = await fetch(url);
        const blob = await response.blob();
        await uploadBytes(destinationRef, blob);
  
        if (operation === 'move') {
          await deleteObject(sourceRef);
        }
      } else {
        await copyFolderRecursive(
          `${currentPath}/${persistentSelectedItem.name}`,
          `${destinationPath}/${persistentSelectedItem.name}`,
          operation === 'move'
        );
      }

          // Call the logger
    if (window.userActionLogger) {
      if (operation === 'move') {
        window.userActionLogger.onMove(persistentSelectedItem, destinationPath);
      } else if (operation === 'copy') {
        window.userActionLogger.onCopy(persistentSelectedItem, destinationPath);
      }
    }
  
      // Reset states
      setIsFolderSelectorOpen(false);
      // setSelectedItem(null);
      // setPersistentSelectedItem(null);
      setOperation(null);
      
      await listFilesAndFolders(currentPath);
    } catch (error) {
      console.error(`Error ${operation}ing item:`, error);
      alert(`Failed to ${operation} item: ${error.message}`);
      setIsFolderSelectorOpen(false);
      // setSelectedItem(null);
      // setPersistentSelectedItem(null);
      setOperation(null);
    }
  };

  const copyFolderRecursive = async (sourcePath, destinationPath, isMove = false) => {
    try {
      const sourceRef = ref(storage, sourcePath);
      const result = await listAll(sourceRef);

      // Copy all files in the current folder
      for (const item of result.items) {
        const url = await getDownloadURL(item);
        const response = await fetch(url);
        const blob = await response.blob();
        const newItemRef = ref(storage, `${destinationPath}/${item.name}`);
        await uploadBytes(newItemRef, blob);

        if (isMove) {
          await deleteObject(item);
        }
      }

      // Recursively copy all subfolders
      for (const folder of result.prefixes) {
        await copyFolderRecursive(
          `${sourcePath}/${folder.name}`,
          `${destinationPath}/${folder.name}`,
          isMove
        );
      }
    } catch (error) {
      console.error('Error copying folder:', error);
      throw error;
    }
  };

  const renderItem = (item, type) => (
    <div
      key={`${type}-${item.name}`}
      className={styles.item}
      onClick={(e) => {
        // Prevent file/folder opening when clicking on action button or dropdown
        if (e.target.closest(`.${styles.actionButton}`) || e.target.closest(`.${styles.dropdownMenu}`)) {
          return;
        }
        if (type === 'folder') {
          navigateToFolder(item.name);
        } else {
          window.open(item.url, '_blank');
        }
      }}
    >
      <div className={styles.itemContent}>
        {type === 'folder' ? <Folder size={24} /> : <File size={24} />}
        <span>{item.name}</span>
      </div>
      <button
        className={styles.actionButton}
        onClick={(e) => {
          e.stopPropagation(); 
          const itemWithType = { ...item, type };
          handleActionClick(e, itemWithType);
        }}
      >
        <MoreVertical size={16} />
      </button>
      {selectedItem?.name === item.name && (
        <ActionDropdown
          isOpen={true}
          onClose={() => {
            setSelectedItem(null);
            // Do not reset persistentSelectedItem here
          }}
          onMove={handleMove}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      )}
    </div>
  );

  return (
    <Process_log currentPath={currentPath} userData={userData}>
    <div className={styles.fileManager}>
      <div className={styles.header}>
        <h2>File Manager</h2>
        <div className={styles.actions}>
          {currentPath === `users/${userData.email.replace('@', '_').replace('.', '_')}` && (
            <button onClick={createFolder} className={Buttons.buttons}>
              <FolderPlus size={20} />
              New Folder
            </button>
          )}
          <label className={Buttons.buttons}>
            <Upload size={20} />
            Upload File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className={styles.navigation}>
        <button onClick={goBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back
        </button>
        <span className={styles.currentPath}>{currentPath}</span>
      </div>

      <div className={styles.content}>
        {folders.map(folder => renderItem(folder, 'folder'))}
        {files.map(file => renderItem(file, 'file'))}
      </div>

      <FolderSelector
          isOpen={isFolderSelectorOpen}
          onClose={() => {
            setIsFolderSelectorOpen(false);
            setOperation(null);
          }}
          currentPath={currentPath}
          userData={userData}
          selectedItem={persistentSelectedItem}
          operation={operation}
          onSelect={handleFolderSelect}
      />

    </div>
    </Process_log>
  );
};

export default FileManager;
