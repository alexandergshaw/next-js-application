import { create } from 'zustand';
import authService from '../services/authService';
import messageService from '../services/messageService';

const useChatStore = create((set, get) => ({
  // Authentication state
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  
  // Connection state
  isConnected: false,
  
  // Messages state
  messages: [],
  
  // Socket state
  socket: null,
  
  // Online users
  onlineUsers: [],
  
  // Typing indicators
  typingUsers: [],
  
  // UI state
  isLoading: false,
  error: null,

  // Phase 3: Search state
  searchQuery: '',
  searchResults: [],
  isSearchOpen: false,

  // Phase 4: Room/Channel state
  currentRoom: { id: 'general', name: 'General' },
  availableRooms: [],
  privateMessages: [],

  // Phase 4: Notifications
  unreadMessages: {},
  notifications: [],

  // Authentication actions
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = authService.login(username, password);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        messages: messageService.getMessagesForRoom('general') // Load persisted messages for default room
      });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = authService.register(username, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      messages: [],
      onlineUsers: [],
      typingUsers: [],
      isConnected: false,
      socket: null,
      searchQuery: '',
      searchResults: [],
      isSearchOpen: false,
      currentRoom: { id: 'general', name: 'General' },
      availableRooms: [],
      privateMessages: [],
      unreadMessages: {},
      notifications: []
    });
  },

  // Connection actions
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
  
  // Message actions
  addMessage: (message) => {
    const state = get();
    const roomId = state.currentRoom.id || 'general';
    const newMessage = messageService.addMessageToRoom(roomId, message);
    
    // Only add to current state if it's for the current room
    if (newMessage.roomId === roomId) {
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
    }
    
    return newMessage;
  },

  // Phase 3: Add message with file/media support
  addFileMessage: (fileData) => {
    const message = {
      username: get().user?.username || 'Unknown',
      userId: get().user?.id,
      message: fileData.type.startsWith('image/') ? `📷 Shared an image: ${fileData.name}` : `📎 Shared a file: ${fileData.name}`,
      timestamp: new Date().toISOString(),
      fileData: {
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        url: fileData.url
      }
    };
    
    return get().addMessage(message);
  },

  // Phase 3: Add reaction to message (now with real socket support)
  addReaction: (messageId, emoji) => {
    const state = get();
    const userId = state.user?.id;
    if (!userId || !state.socket) return;

    // Send reaction through socket (property must be 'reaction' not 'emoji')
    state.socket.emit('add_reaction', { 
      messageId, 
      reaction: emoji, 
      roomId: state.currentRoom.id 
    });

    // Update local state (will be confirmed by server)
    const updatedMessage = messageService.addReaction(messageId, userId, emoji);
    
    if (updatedMessage) {
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      }));
    }
  },

  // Handle reaction from server
  handleReaction: (reactionData) => {
    set((state) => ({
      messages: state.messages.map(msg => {
        if (msg.id === reactionData.messageId) {
          // Always use the updated reactions array from the server
          return {
            ...msg,
            reactions: reactionData.reactions || []
          };
        }
        return msg;
      })
    }));
  },
  
  updateMessageStatus: (messageId, status) => {
    const updatedMessage = messageService.updateMessageStatus(messageId, status);
    if (updatedMessage) {
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      }));
    }
  },

  loadMessages: () => {
    const state = get();
    const roomId = state.currentRoom.id || 'general';
    const messages = messageService.getMessagesForRoom(roomId);
    set({ messages });
  },

  loadMessagesForRoom: (roomId) => {
    const messages = messageService.getMessagesForRoom(roomId);
    set({ messages });
  },
  
  clearMessages: () => {
    messageService.clearMessages();
    set({ messages: [] });
  },
  
  // Online users actions
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  // Typing indicators
  addTypingUser: (username) => set((state) => ({
    typingUsers: [...state.typingUsers.filter(user => user !== username), username]
  })),
  
  removeTypingUser: (username) => set((state) => ({
    typingUsers: state.typingUsers.filter(user => user !== username)
  })),
  
  clearTypingUsers: () => set({ typingUsers: [] }),

  // Phase 3: Search actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    
    if (query.trim() === '') {
      set({ searchResults: [] });
      return;
    }

    // Perform search
    const results = messageService.searchMessages(query);
    set({ searchResults: results });
  },

  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),

  clearSearch: () => set({ 
    searchQuery: '', 
    searchResults: [], 
    isSearchOpen: false 
  }),

  // Phase 4: Room/Channel actions
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setAvailableRooms: (rooms) => set({ availableRooms: rooms }),
  
  switchRoom: (roomId, roomName) => {
    const state = get();
    
    // Save current room messages before switching
    if (state.currentRoom.id && state.messages.length > 0) {
      messageService.saveMessagesForRoom(state.currentRoom.id, state.messages);
    }
    
    // Load messages for the new room
    const roomMessages = messageService.getMessagesForRoom(roomId);
    
    if (state.socket) {
      state.socket.emit('switch_room', { roomId });
    }
    
    set({ 
      currentRoom: { id: roomId, name: roomName },
      messages: roomMessages // Load room-specific messages
    });
  },

  handleRoomData: (roomData) => {
    const state = get();
    const roomId = roomData.id;
    
    // Load existing messages for the room
    const existingMessages = messageService.getMessagesForRoom(roomId);
    
    // Merge with any new messages from room data
    const newMessages = roomData.messages || [];
    const allMessages = [...existingMessages];
    
    // Add any new messages that don't already exist
    newMessages.forEach(newMsg => {
      if (!allMessages.find(existing => existing.id === newMsg.id)) {
        allMessages.push(newMsg);
      }
    });
    
    // Save the merged messages
    messageService.saveMessagesForRoom(roomId, allMessages);
    
    set({
      currentRoom: { id: roomData.id, name: roomData.name },
      messages: allMessages,
      onlineUsers: roomData.users || []
    });
  },

  // Phase 4: Private messaging
  addPrivateMessage: (message) => {
    set((state) => ({
      privateMessages: [...state.privateMessages, message]
    }));
  },

  sendPrivateMessage: (recipientId, message) => {
    const state = get();
    if (state.socket) {
      state.socket.emit('send_private_message', { recipientId, message });
    }
  },

  // Phase 4: Notifications
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications.slice(0, 9)] // Keep last 10
    }));
  },

  markNotificationRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  // Phase 4: Unread message tracking
  markRoomRead: (roomId) => {
    set((state) => ({
      unreadMessages: {
        ...state.unreadMessages,
        [roomId]: 0
      }
    }));
  },

  incrementUnreadCount: (roomId) => {
    set((state) => ({
      unreadMessages: {
        ...state.unreadMessages,
        [roomId]: (state.unreadMessages[roomId] || 0) + 1
      }
    }));
  },

  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Helper to get current state
  getState: () => get(),
}));

export default useChatStore;
