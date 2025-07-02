'use client';

import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import ChatInterface from '../components/ChatInterface';
import ThemeProvider from '../components/ThemeProvider';
import useChatStore from '../store/chatStore';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isAuthenticated, clearError } = useChatStore();

  useEffect(() => {
    // Clear any existing errors on mount
    clearError();
  }, [clearError]);

  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        
        {!isAuthenticated ? (
          <AuthForm />
        ) : (
          <ChatInterface />
        )}
      </div>
    </ThemeProvider>
  );
}
