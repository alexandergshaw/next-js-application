'use client';

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Settings, Wifi, WifiOff, Menu, LogOut } from 'lucide-react';
import useChatStore from '../store/chatStore';
import socketService from '../services/socketService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MessageSearch from './MessageSearch';
import { useTheme } from './ThemeProvider';
import toast from 'react-hot-toast';
import AISettings from './AISettings';
import DeviceSimulator from './DeviceSimulator';
import Sidebar from './Sidebar';

export default function ChatInterface() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { socket, isConnected, user, logout, setSocket, setConnected } = useChatStore();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close sidebar by default on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to handle socket connection
  useEffect(() => {
    if (!socket && user) {
      const newSocket = socketService.connect(user, {
        onConnect: () => {
          setConnected(true);
        },
        onDisconnect: () => {
          setConnected(false);
          toast.error('Disconnected from chat server');
        }
      });
      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, [socket, user, setSocket, setConnected]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800">
          {/* Left section with menu and title */}
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Right section with controls */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Search messages"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Connection status */}
            <div className="text-sm">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
            </div>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <MessageInput disabled={!isConnected} />
        </div>

        {/* Overlays */}
        {isSearchOpen && (
          <MessageSearch onClose={() => setSearchOpen(false)} />
        )}
        {isSettingsOpen && (
          <AISettings onClose={() => setIsSettingsOpen(false)} />
        )}
      </main>
    </div>
  );
}
