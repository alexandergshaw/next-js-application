'use client';

import { formatDistanceToNow } from 'date-fns';
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
    <div className="w-64 bg-white border-l h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Online Users</h3>
        <p className="text-sm text-gray-500">{onlineUsers.length} online</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm">No one else is online</p>
          </div>
        ) : (
          <div className="p-2">
            {onlineUsers.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center p-3 rounded-lg mb-2 ${
                  user.id === currentUser?.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">
                      {user.username}
                    </span>
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
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
