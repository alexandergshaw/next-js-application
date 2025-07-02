'use client';

import { useEffect, useState } from 'react';
import { Search, Moon, Sun, Settings } from 'lucide-react';
import useChatStore from '../store/chatStore';
import socketService from '../services/socketService';
import authService from '../services/authService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import MessageSearch from './MessageSearch';
import { useTheme } from './ThemeProvider';
import toast from 'react-hot-toast';

export default function ChatInterface() {
  const { 
    user,
    messages, 
    isConnected, 
    socket,
    onlineUsers,
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
    clearSearch
  } = useChatStore();

  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Load persisted messages when component mounts
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (user && !socket) {
      // Enhanced socket connection with Phase 3 features
      const newSocket = socketService.simulateConnectionWithFeatures(
        user,
        // Message handler
        (messageData) => {
          addMessage(messageData);
          // Simulate message delivery status
          setTimeout(() => {
            updateMessageStatus(messageData.id, 'delivered');
          }, 500);
        },
        // Connection handler
        () => {
          setConnected(true);
          toast.success('Connected to chat! 🚀');
          
          // Simulate online users with Phase 3 enhancements
          const mockOnlineUsers = [
            { id: user.id, username: user.username, isOnline: true },
            { id: 2, username: 'Alice', isOnline: true, lastSeen: new Date().toISOString() },
            { id: 3, username: 'Bob', isOnline: true, lastSeen: new Date().toISOString() },
            { id: 4, username: 'Charlie', isOnline: false, lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
          ];
          setOnlineUsers(mockOnlineUsers);
        },
        // Typing handlers
        (typingData) => {
          addTypingUser(typingData.username);
        },
        (typingData) => {
          removeTypingUser(typingData.username);
        },
        // Disconnect handler
        () => {
          setConnected(false);
          setOnlineUsers([]);
          toast.error('Disconnected from chat');
        }
      );
      
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
  }, [user, socket, addMessage, setSocket, setConnected, setOnlineUsers, addTypingUser, removeTypingUser, updateMessageStatus]);

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
    // Scroll to message (simplified for demo)
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">ChatApp</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.username} - Phase 3: Rich Media & UI
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <div className="relative">
                <button
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isSearchOpen 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Search messages"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Search Component */}
                <MessageSearch
                  messages={messages}
                  onSelectMessage={handleSelectMessage}
                  isOpen={isSearchOpen}
                  onClose={() => clearSearch()}
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              
              {/* Settings & Logout */}
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[160px] z-50">
                    <button
                      onClick={() => {
                        // Clear all messages (for demo)
                        if (confirm('Clear all messages? This cannot be undone.')) {
                          useChatStore.getState().clearMessages();
                          toast.success('Messages cleared');
                        }
                        setIsSettingsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Clear Messages
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsSettingsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          onFileSelect={handleFileSelect}
          disabled={!isConnected}
        />
      </div>

      {/* Online Users Sidebar */}
      <OnlineUsers />
    </div>
  );
}
