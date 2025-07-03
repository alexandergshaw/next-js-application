'use client';

import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import ChatInterface from '../components/ChatInterface';
import ThemeProvider from '../components/ThemeProvider';
import ClientOnly from '../components/ClientOnly';
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
        
        <ClientOnly fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  ChatApp
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading...
                </p>
              </div>
            </div>
          </div>
        }>
          {!isAuthenticated ? (
            <AuthForm />
          ) : (
            <ChatInterface />
          )}
        </ClientOnly>
      </div>
    </ThemeProvider>
  );
}
