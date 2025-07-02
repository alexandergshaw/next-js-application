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

  // Authentication actions
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = authService.login(username, password);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        messages: messageService.getMessages() // Load persisted messages
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
      isSearchOpen: false
    });
  },

  // Connection actions
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
  
  // Message actions
  addMessage: (message) => {
    const newMessage = messageService.addMessage(message);
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));
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

  // Phase 3: Add reaction to message
  addReaction: (messageId, emoji) => {
    const state = get();
    const userId = state.user?.id;
    if (!userId) return;

    // Update in messageService
    const updatedMessage = messageService.addReaction(messageId, userId, emoji);
    
    if (updatedMessage) {
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      }));
    }
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
    const messages = messageService.getMessages();
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

  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Helper to get current state
  getState: () => get(),
}));

export default useChatStore;
