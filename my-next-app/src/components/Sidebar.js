'use client';

import { X, ChevronLeft } from 'lucide-react';
import RoomSelector from './RoomSelector';
import OnlineUsers from './OnlineUsers';

export default function Sidebar({ isOpen, onToggle, isMobile }) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden" 
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-full w-64 
          bg-white dark:bg-gray-800 
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-50 md:z-0
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            Chat Rooms
          </h2>
          
          {/* Toggle button - only show on desktop */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Toggle sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Close button - only show on mobile */}
          {isMobile && (
            <button 
              onClick={onToggle}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <RoomSelector onRoomSelect={isMobile ? onToggle : undefined} />
          <OnlineUsers />
        </div>
      </aside>
    </>
  );
} 