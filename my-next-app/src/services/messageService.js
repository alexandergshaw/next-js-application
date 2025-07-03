class MessageService {
  constructor() {
    this.storageKey = 'chatapp_messages';
  }

  // Load messages from localStorage (client-side only)
  loadMessages() {
    if (typeof window === 'undefined') return [];
    
    try {
      const messages = localStorage.getItem(this.storageKey);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Save messages to localStorage (client-side only)
  saveMessages(messages) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  // Add a new message
  addMessage(messageData) {
    const messages = this.loadMessages();
    
    const newMessage = {
      id: Date.now() + Math.random(),
      ...messageData,
      timestamp: new Date().toISOString(),
      status: 'sent', // sent, delivered, read
      reactions: []
    };

    messages.push(newMessage);
    this.saveMessages(messages);
    
    return newMessage;
  }

  // Update message status
  updateMessageStatus(messageId, status) {
    const messages = this.loadMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages[messageIndex].status = status;
      messages[messageIndex].updatedAt = new Date().toISOString();
      this.saveMessages(messages);
      return messages[messageIndex];
    }
    
    return null;
  }

  // Add reaction to message
  addReaction(messageId, userId, emoji) {
    const messages = this.loadMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      const message = messages[messageIndex];
      if (!message.reactions) {
        message.reactions = [];
      }
      // Check if user already reacted with this emoji
      const existingIndex = message.reactions.findIndex(
        reaction => reaction.userId === userId && reaction.emoji === emoji
      );
      if (existingIndex !== -1) {
        // Remove reaction (deselect)
        message.reactions.splice(existingIndex, 1);
      } else {
        // Add new reaction
        message.reactions.push({
          userId,
          emoji,
          timestamp: new Date().toISOString()
        });
      }
      this.saveMessages(messages);
      return message;
    }
    return null;
  }

  // Get messages with pagination
  getMessages(limit = 50, offset = 0) {
    const messages = this.loadMessages();
    return messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(offset, offset + limit);
  }

  // Search messages
  searchMessages(query) {
    const messages = this.loadMessages();
    return messages.filter(message => 
      message.message.toLowerCase().includes(query.toLowerCase()) ||
      message.username.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Clear all messages
  clearMessages() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Get message count
  getMessageCount() {
    return this.loadMessages().length;
  }

  // Room-specific message management
  getMessagesForRoom(roomId) {
    if (typeof window === 'undefined') return [];
    
    try {
      const storageKey = `chatapp_messages_${roomId}`;
      const messages = localStorage.getItem(storageKey);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error loading room messages:', error);
      return [];
    }
  }

  saveMessagesForRoom(roomId, messages) {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = `chatapp_messages_${roomId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving room messages:', error);
    }
  }

  addMessageToRoom(roomId, messageData) {
    const messages = this.getMessagesForRoom(roomId);
    
    const newMessage = {
      id: Date.now() + Math.random(),
      ...messageData,
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      roomId: roomId
    };

    messages.push(newMessage);
    
    // Keep only last 100 messages per room
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }
    
    this.saveMessagesForRoom(roomId, messages);
    return newMessage;
  }

  // Clear messages for a specific room
  clearRoomMessages(roomId) {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = `chatapp_messages_${roomId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing room messages:', error);
    }
  }

  // Get all rooms with message counts
  getRoomMessageCounts() {
    if (typeof window === 'undefined') return {};
    
    const rooms = ['general', 'tech', 'random', 'gaming', 'music'];
    const counts = {};
    
    rooms.forEach(roomId => {
      const messages = this.getMessagesForRoom(roomId);
      counts[roomId] = messages.length;
    });
    
    return counts;
  }
}

export default new MessageService();
