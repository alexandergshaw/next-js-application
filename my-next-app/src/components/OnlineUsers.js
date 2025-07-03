
'use client';

import { formatDistanceToNow } from 'date-fns';
import { Users } from 'lucide-react';
import useChatStore from '../store/chatStore';

export default function OnlineUsers() {
  const onlineUsers = useChatStore(state => state.onlineUsers);
  const currentUser = useChatStore(state => state.user);

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Just now';
    try {
      const date = new Date(lastSeen);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header to match Channels */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Online Users
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{onlineUsers.length} online</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <></>
        ) : (
          <div className="p-2">
            {onlineUsers.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center p-3 rounded-lg mb-2 ${
                  user.id === currentUser?.id 
                    ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {user.username}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
