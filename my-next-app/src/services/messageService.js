class MessageService {
  constructor() {
    this.storageKey = 'chatapp_messages';
  }

  // Load messages from localStorage
  loadMessages() {
    try {
      const messages = localStorage.getItem(this.storageKey);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Save messages to localStorage
  saveMessages(messages) {
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
      
      // Remove existing reaction from this user for this emoji
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId === userId && reaction.emoji === emoji)
      );
      
      // Add new reaction
      message.reactions.push({
        userId,
        emoji,
        timestamp: new Date().toISOString()
      });
      
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
    localStorage.removeItem(this.storageKey);
  }

  // Get message count
  getMessageCount() {
    return this.loadMessages().length;
  }
}

export default new MessageService();
