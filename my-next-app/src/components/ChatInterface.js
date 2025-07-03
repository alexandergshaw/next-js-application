'use client';

import { useEffect, useState } from 'react';
import { Search, Moon, Sun, Settings, Wifi, WifiOff } from 'lucide-react';
import useChatStore from '../store/chatStore';
import socketService from '../services/socketService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import MessageSearch from './MessageSearch';
import RoomSelector from './RoomSelector';
import { useTheme } from './ThemeProvider';
import toast from 'react-hot-toast';

export default function ChatInterface() {
  const [showSidebar, setShowSidebar] = useState(false); // For mobile sidebar toggle
  const { 
    user,
    messages, 
    isConnected, 
    socket,
    onlineUsers,
    currentRoom,
    addMessage, 
    addFileMessage,
    setSocket, 
    setConnected,
    setOnlineUsers,
    addTypingUser,
    removeTypingUser,
    updateMessageStatus,
    loadMessages,
    logout,
    isSearchOpen,
    setSearchOpen,
    clearSearch,
    handleReaction,
    handleRoomData,
    addPrivateMessage,
    addNotification,
    incrementUnreadCount
  } = useChatStore();

  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Keyboard shortcut: Ctrl+F (or Cmd+F) to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F (Windows/Linux) or Cmd+F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        // Only trigger if not already focused on an input/textarea/select
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    // Load persisted messages when component mounts
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (user && !socket) {
      // Connect to real Socket.io server
      const newSocket = socketService.connect(user, {
        // Connection confirmed
        onConnect: (data) => {
          setConnected(true);
          toast.success('Connected to chat server! 🚀');
          if (data && data.room) {
            handleRoomData(data.room);
          }
        },
        
        // Room data received
        onRoomData: (roomData) => {
          handleRoomData(roomData);
        },

        // Message received
        onMessage: (messageData) => {
          addMessage(messageData);
          
          // If message is not from current user and not in current room, increment unread count
          if (messageData.userId !== user.id && messageData.roomId !== currentRoom.id) {
            incrementUnreadCount(messageData.roomId);
          }
        },

        // User events
        onUserJoined: (data) => {
          if (data.users) {
            setOnlineUsers(data.users);
          }
          if (data.user && data.user.id !== user.id) {
            addNotification({
              id: Date.now(),
              type: 'user_joined',
              message: `${data.user.username} joined the chat`,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        },

        onUserLeft: (data) => {
          if (data.users) {
            setOnlineUsers(data.users);
          }
          if (data.user && data.user.id !== user.id) {
            addNotification({
              id: Date.now(),
              type: 'user_left',
              message: `${data.user.username} left the chat`,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        },

        // Typing indicators
        onTypingStart: (typingData) => {
          if (typingData.username !== user.username) {
            addTypingUser(typingData.username);
          }
        },

        onTypingStop: (typingData) => {
          if (typingData.username !== user.username) {
            removeTypingUser(typingData.username);
          }
        },

        // Message status updates
        onMessageStatus: (statusData) => {
          updateMessageStatus(statusData.messageId, statusData.status);
        },

        // Reactions
        onMessageReaction: (reactionData) => {
          handleReaction(reactionData);
        },

        // Private messages
        onPrivateMessage: (messageData) => {
          addPrivateMessage(messageData);
          addNotification({
            id: Date.now(),
            type: 'private_message',
            message: `Private message from ${messageData.from.username}`,
            timestamp: new Date().toISOString(),
            read: false
          });
        },

        onPrivateMessageSent: (messageData) => {
          addPrivateMessage(messageData);
        },

        // Room switching
        onRoomSwitched: (data) => {
          handleRoomData(data.room);
          toast.success(`Switched to #${data.room.name}`);
        },

        // Disconnection
        onDisconnect: () => {
          setConnected(false);
          setOnlineUsers([]);
          toast.error('Disconnected from chat server');
        }
      });
      
      setSocket(newSocket);
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socketService.disconnect();
        setSocket(null);
        setConnected(false);
        setOnlineUsers([]);
      }
    };
  }, [user, socket]);

  // Reload messages when switching rooms
  useEffect(() => {
    // Load messages when current room changes
    loadMessages();
  }, [currentRoom.id, loadMessages]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSendMessage = (message) => {
    if (socket && message.trim()) {
      const messageData = {
        username: user.username,
        userId: user.id,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };
      
      socket.emit('send_message', messageData);
    }
  };

  const handleFileSelect = (fileData) => {
    addFileMessage(fileData);
    toast.success(`File "${fileData.name}" shared! 📎`);
  };

  const handleLogout = () => {
    logout();
    clearSearch();
    toast.success('Logged out successfully');
  };

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      clearSearch();
    } else {
      setSearchOpen(true);
    }
  };

  const handleSelectMessage = (message) => {
    setSearchOpen(false);
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${message.id}`);
      if (messageElement) {
        // Remove any previous highlight
        messageElement.classList.remove('subtle-highlight');
        // Smooth scroll to message
        messageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        // Subtle highlight
        setTimeout(() => {
          messageElement.classList.add('subtle-highlight');
          setTimeout(() => {
            messageElement.classList.remove('subtle-highlight');
          }, 1200);
        }, 200);
      }
    }, 120);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Header (always visible, even when search is open) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 sticky top-0">
        <button
          onClick={() => setShowSidebar(true)}
          className="p-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">#{currentRoom.name}</h1>
        <button
          onClick={() => setSearchOpen(!isSearchOpen)}
          className={`ml-2 p-2 rounded-lg transition-colors ${isSearchOpen ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          title="Search Messages (Ctrl+F)"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar (channels + online users) */}
        {/* Overlay for mobile */}
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${showSidebar ? 'block' : 'hidden'}`} onClick={() => setShowSidebar(false)}></div>
        {/* Sidebar: on desktop, stack RoomSelector and OnlineUsers vertically in one column */}
        <aside className={`fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-700 shadow-lg transform transition-transform duration-200 md:static md:translate-x-0 md:flex md:flex-col md:w-64 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Mobile: show RoomSelector and OnlineUsers in menu */}
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 block md:hidden border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setShowSidebar(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none" aria-label="Close menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <RoomSelector onRoomSelect={() => setShowSidebar(false)} />
              <OnlineUsers />
            </div>
            {/* Desktop: stack RoomSelector and OnlineUsers vertically, seamless background, scrollable */}
            <div className="hidden md:flex md:flex-col md:h-full md:overflow-y-auto md:bg-white md:dark:bg-gray-900">
              <div className="flex-shrink-0">
              <RoomSelector />
              </div>
              <div className="flex-1 overflow-y-auto">
                <OnlineUsers />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Desktop Header */}
          <div className="hidden md:flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  #{currentRoom.name}
                </h1>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {onlineUsers.length} member{onlineUsers.length !== 1 ? 's' : ''} online
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-lg transition-colors ${isSearchOpen ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Search Messages (Ctrl+F)"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {/* Settings Dropdown */}
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      Logged in as <strong>{user.username}</strong>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Panel */}
          {isSearchOpen && (
            <>
              {/* Mobile: overlay tray below header. Desktop: normal flow below desktop header. */}
              <div
                className="block md:hidden fixed top-[56px] left-0 w-full z-40"
              >
                <MessageSearch
                  messages={messages}
                  onSelectMessage={handleSelectMessage}
                  isOpen={isSearchOpen}
                  onClose={() => setSearchOpen(false)}
                />
              </div>
              <div className="hidden md:block w-full">
                <MessageSearch
                  messages={messages}
                  onSelectMessage={handleSelectMessage}
                  isOpen={isSearchOpen}
                  onClose={() => setSearchOpen(false)}
                />
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <MessageList />
              <MessageInput 
                onSendMessage={handleSendMessage}
                onFileSelect={handleFileSelect}
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
