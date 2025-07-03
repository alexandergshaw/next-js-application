'use client';

import { useState, useEffect } from 'react';
import { Hash, Plus, Users, MessageCircle } from 'lucide-react';
import useChatStore from '../store/chatStore';
import socketService from '../services/socketService';

export default function RoomSelector({ onRoomSelect }) {
  const { 
    currentRoom, 
    availableRooms, 
    unreadMessages,
    setAvailableRooms,
    switchRoom,
    markRoomRead
  } = useChatStore();

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    // Load available rooms when component mounts
    loadRooms();
    
    // Set up interval to refresh room data (including user counts) every 10 seconds
    const interval = setInterval(() => {
      loadRooms();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    const rooms = await socketService.getRooms();
    setAvailableRooms(rooms);
  };

  const handleRoomSwitch = (roomId, roomName) => {
    switchRoom(roomId, roomName);
    markRoomRead(roomId);
    // If a callback is provided (mobile), call it to close the sidebar
    if (typeof onRoomSelect === 'function') {
      onRoomSelect();
    }
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      // For now, we'll just add it to the available rooms
      // In a real implementation, this would create a room on the server
      const newRoom = {
        id: newRoomName.toLowerCase().replace(/\s+/g, '-'),
        name: newRoomName,
        userCount: 1,
        createdAt: new Date().toISOString()
      };
      
      setAvailableRooms([...availableRooms, newRoom]);
      handleRoomSwitch(newRoom.id, newRoom.name);
      setNewRoomName('');
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Channels
        </h2>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Default General Room */}
          <button
            onClick={() => handleRoomSwitch('general', 'General')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-1 ${
              currentRoom.id === 'general' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              <span>General</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {availableRooms.find(room => room.id === 'general')?.userCount || 1}
              </span>
              {unreadMessages.general > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {unreadMessages.general}
                </span>
              )}
            </div>
          </button>

          {/* Other Rooms */}
          {availableRooms.filter(room => room.id !== 'general').map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSwitch(room.id, room.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-1 ${
                currentRoom.id === room.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                <span>{room.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {room.userCount}
                </span>
                {unreadMessages[room.id] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadMessages[room.id]}
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Create Room Section */}
          <div className="mb-4 pb-4  border-b border-gray-200 dark:border-gray-700">
            {!isCreatingRoom ? (
              <button
                onClick={() => setIsCreatingRoom(true)}
                className="w-full flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Channel
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateRoom();
                    } else if (e.key === 'Escape') {
                      setIsCreatingRoom(false);
                      setNewRoomName('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateRoom}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingRoom(false);
                      setNewRoomName('');
                    }}
                    className="flex-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
