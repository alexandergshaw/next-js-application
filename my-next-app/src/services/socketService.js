import { v4 as uuidv4 } from 'uuid';

class SocketService {
  constructor() {
    this.socket = null;
    this.typingUsers = new Set();
    this.currentRoom = 'general';
    this.user = null;
    this.callbacks = null;
    this.activityIntervals = [];
    this.mockUsers = []; // Store mock users as instance property
  }

  connect(user, callbacks = {}) {
    // Return early if no user is provided
    if (!user || !user.username) {
      console.warn('No user data provided to socket service');
      return null;
    }

    this.user = user;
    this.callbacks = callbacks;
    
    console.log('Connecting to serverless chat...');
    
    // Only initialize if we're in the browser (client-side)
    if (typeof window !== 'undefined') {
      this.initializeLocalChat();
    }
    
    // Simulate connection
    setTimeout(() => {
      callbacks.onConnect?.({
        user: this.user,
        room: {
          id: this.currentRoom,
          name: this.getRoomName(this.currentRoom),
          users: [this.user],
          messages: this.getStoredMessages()
        }
      });
    }, 1000);

    return {
      connected: true,
      emit: this.handleEmit.bind(this),
      disconnect: this.disconnect.bind(this)
    };
  }

  initializeLocalChat() {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for existing room in localStorage
    const existingRoom = localStorage.getItem('chat_room_data');
    if (existingRoom) {
      try {
        const roomData = JSON.parse(existingRoom);
        this.currentRoom = roomData.currentRoom || 'general';
      } catch (e) {
        console.warn('Failed to parse room data:', e);
      }
    }

    // Add welcome message if this is the first time
    const welcomeKey = `welcome_shown_${this.user.username}`;
    if (!localStorage.getItem(welcomeKey)) {
      setTimeout(() => {
        const welcomeMessage = {
          id: uuidv4(),
          username: 'System',
          message: `Welcome to the serverless chat, ${this.user.username}! 🎉`,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          roomId: this.currentRoom,
          type: 'system'
        };
        
        this.addMessageToStorage(welcomeMessage);
        if (this.callbacks?.onMessage) {
          this.callbacks.onMessage(welcomeMessage);
        }
      }, 2000);
      
      localStorage.setItem(welcomeKey, 'true');
    }

    // Simulate other users and activity
    this.simulateActivity();
  }

  simulateActivity() {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Clear existing intervals
    this.activityIntervals.forEach(interval => clearInterval(interval));
    this.activityIntervals = [];

    // Initialize mock users as instance property
    this.mockUsers = [
      { 
        id: 'user_alice', 
        username: 'Alice', 
        isOnline: Math.random() > 0.2,
        personality: 'friendly',
        currentRoom: 'general',
        lastActive: Date.now(),
        typingSpeed: 1000 + Math.random() * 2000
      },
      { 
        id: 'user_bob', 
        username: 'Bob', 
        isOnline: Math.random() > 0.3,
        personality: 'tech-savvy',
        currentRoom: 'tech',
        lastActive: Date.now(),
        typingSpeed: 800 + Math.random() * 1500
      },
      { 
        id: 'user_charlie', 
        username: 'Charlie', 
        isOnline: Math.random() > 0.4,
        personality: 'casual',
        currentRoom: 'random',
        lastActive: Date.now(),
        typingSpeed: 1200 + Math.random() * 2500
      },
      { 
        id: 'user_diana', 
        username: 'Diana', 
        isOnline: Math.random() > 0.5,
        personality: 'gamer',
        currentRoom: 'gaming',
        lastActive: Date.now(),
        typingSpeed: 600 + Math.random() * 1000
      },
      { 
        id: 'user_ethan', 
        username: 'Ethan', 
        isOnline: Math.random() > 0.6,
        personality: 'music-lover',
        currentRoom: 'music',
        lastActive: Date.now(),
        typingSpeed: 1500 + Math.random() * 2000
      }
    ];

    // Define personality-based message pools
    const messagesByPersonality = {
      friendly: [
        'Hey everyone! 👋',
        'How\'s your day going?',
        'Hope you\'re all doing well! 😊',
        'Anyone up for a chat?',
        'Sending good vibes your way! ✨',
        'What\'s everyone working on today?',
        'This community is so welcoming! 💕',
        'Coffee break time! ☕ Anyone else?'
      ],
      'tech-savvy': [
        'Just finished coding something awesome 🚀',
        'Anyone tried the new React features?',
        'Working on a cool ML project right now',
        'This API design is pretty elegant',
        'Docker containers are life savers',
        'Anyone else loving TypeScript?',
        'Just deployed to production! 🎉',
        'Debugging this edge case... 🤔'
      ],
      casual: [
        'What\'s up folks?',
        'Chillin\' here, what about you?',
        'Random thought of the day...',
        'Anyone else procrastinating? 😅',
        'This weather is crazy!',
        'Weekend plans anyone?',
        'Just binged a whole series lol',
        'Life\'s pretty good right now'
      ],
      gamer: [
        'Just hit a new high score! 🎮',
        'Anyone playing the new game release?',
        'Epic raid last night!',
        'My team is on fire today 🔥',
        'Console vs PC, thoughts?',
        'Stream is going live soon!',
        'That boss fight was intense!',
        'Need more practice with this character'
      ],
      'music-lover': [
        'This track is absolutely amazing! 🎵',
        'Anyone heard the new album?',
        'Live concert was mind-blowing',
        'My playlist is growing daily',
        'The bass drop in this song! 🔊',
        'Vinyl collection keeps expanding',
        'Found this hidden gem artist',
        'Music production is so therapeutic'
      ]
    };

    const rooms = ['general', 'tech', 'random', 'gaming', 'music'];

    // Enhanced online status changes (more frequent and realistic)
    const statusInterval = setInterval(() => {
      this.mockUsers.forEach(user => {
        const timeSinceActive = Date.now() - user.lastActive;
        const inactiveThreshold = 300000; // 5 minutes
        
        // More likely to go offline if inactive for a while
        if (timeSinceActive > inactiveThreshold && Math.random() > 0.7) {
          user.isOnline = false;
        } else if (!user.isOnline && Math.random() > 0.8) {
          // Come back online
          user.isOnline = true;
          user.lastActive = Date.now();
          
          // Send a "back online" message occasionally
          if (Math.random() > 0.7) {
            setTimeout(() => {
              const backMessages = ['Back online!', 'Hey I\'m back!', 'What did I miss?', 'Sorry, was away for a bit'];
              const message = backMessages[Math.floor(Math.random() * backMessages.length)];
              this.simulateUserMessage(user, message);
            }, 1000 + Math.random() * 3000);
          }
        }
      });

      // Update online users callback
      if (this.callbacks?.onUserJoined) {
        this.callbacks.onUserJoined({
          users: [
            { ...this.user, isOnline: true, currentRoom: this.currentRoom },
            ...this.mockUsers.filter(u => u.isOnline && u.currentRoom === this.currentRoom)
          ]
        });
      }
    }, 5000 + Math.random() * 5000);
    this.activityIntervals.push(statusInterval);

    // Room switching behavior
    const roomSwitchInterval = setInterval(() => {
      this.mockUsers.forEach(user => {
        if (user.isOnline && Math.random() > 0.95) { // 5% chance per interval
          const newRoom = rooms[Math.floor(Math.random() * rooms.length)];
          if (newRoom !== user.currentRoom) {
            // Send leaving message occasionally
            if (Math.random() > 0.7) {
              const leaveMessages = [
                'Heading to another room, catch you later!',
                'Switching rooms, see ya!',
                'Off to explore other channels!',
                'BRB, checking other rooms'
              ];
              const message = leaveMessages[Math.floor(Math.random() * leaveMessages.length)];
              this.simulateUserMessage(user, message);
            }
            
            setTimeout(() => {
              user.currentRoom = newRoom;
              user.lastActive = Date.now();
              
              // Send joining message in new room
              if (Math.random() > 0.6) {
                const joinMessages = [
                  `Hey ${newRoom} room! 👋`,
                  `Just joined, what's happening here?`,
                  `Switching over from another room`,
                  `New room, new conversations!`
                ];
                const message = joinMessages[Math.floor(Math.random() * joinMessages.length)];
                setTimeout(() => {
                  this.simulateUserMessage(user, message);
                }, 2000 + Math.random() * 3000);
              }
            }, 1000 + Math.random() * 2000);
          }
        }
      });
    }, 20000 + Math.random() * 30000);
    this.activityIntervals.push(roomSwitchInterval);

    // Enhanced message simulation with AI-powered conversations
    const messageInterval = setInterval(async () => {
      const onlineUsersInRoom = this.mockUsers.filter(u => 
        u.isOnline && u.currentRoom === this.currentRoom
      );
      
      if (onlineUsersInRoom.length > 0 && Math.random() > 0.6) {
        const randomUser = onlineUsersInRoom[Math.floor(Math.random() * onlineUsersInRoom.length)];
        
        // Phase 2: Use AI to generate contextual responses
        const recentMessages = this.getStoredMessages().slice(-5);
        const shouldRespond = recentMessages.length > 0 && Math.random() > 0.7;
        
        if (shouldRespond && recentMessages.length > 0) {
          // AI-powered contextual response
          const lastMessage = recentMessages[recentMessages.length - 1];
          this.simulateTypingAndMessage(randomUser, null, lastMessage.message);
        } else {
          // AI-powered personality-based message
          this.simulateTypingAndMessage(randomUser, null);
        }
      }
    }, 8000 + Math.random() * 12000);
    this.activityIntervals.push(messageInterval);

    // Random typing indicators (without sending messages)
    const typingInterval = setInterval(() => {
      const onlineUsersInRoom = this.mockUsers.filter(u => 
        u.isOnline && u.currentRoom === this.currentRoom
      );
      
      if (onlineUsersInRoom.length > 0 && Math.random() > 0.85) {
        const randomUser = onlineUsersInRoom[Math.floor(Math.random() * onlineUsersInRoom.length)];
        
        if (this.callbacks?.onUserTyping) {
          this.callbacks.onUserTyping({ username: randomUser.username, isTyping: true });
        }
        
        // Stop typing after a realistic duration
        setTimeout(() => {
          if (this.callbacks?.onUserTyping) {
            this.callbacks.onUserTyping({ username: randomUser.username, isTyping: false });
          }
        }, randomUser.typingSpeed + Math.random() * 2000);
      }
    }, 6000 + Math.random() * 8000);
    this.activityIntervals.push(typingInterval);

    // Reaction simulation
    const reactionInterval = setInterval(() => {
      const recentMessages = this.getStoredMessages().slice(-10);
      const onlineUsersInRoom = this.mockUsers.filter(u => 
        u.isOnline && u.currentRoom === this.currentRoom
      );
      
      if (recentMessages.length > 0 && onlineUsersInRoom.length > 0 && Math.random() > 0.9) {
        const randomUser = onlineUsersInRoom[Math.floor(Math.random() * onlineUsersInRoom.length)];
        const randomMessage = recentMessages[Math.floor(Math.random() * recentMessages.length)];
        
        // Don't react to own messages
        if (randomMessage.username !== randomUser.username) {
          const reactions = ['👍', '❤️', '😄', '🎉', '🔥', '💯', '👏', '😍'];
          const reaction = reactions[Math.floor(Math.random() * reactions.length)];
          
          setTimeout(() => {
            this.handleAddReaction({ 
              messageId: randomMessage.id, 
              reaction: reaction,
              userId: randomUser.id,
              username: randomUser.username 
            });
          }, 1000 + Math.random() * 3000);
        }
      }
    }, 15000 + Math.random() * 20000);
    this.activityIntervals.push(reactionInterval);
  }

  handleEmit(event, data) {
    console.log('Mock emit:', event, data);
    
    switch (event) {
      case 'send_message':
        this.handleSendMessage(data);
        break;
      case 'typing_start':
        this.handleTypingStart(data);
        break;
      case 'typing_stop':
        this.handleTypingStop(data);
        break;
      case 'join_room':
        this.handleJoinRoom(data);
        break;
      case 'switch_room':
        this.handleJoinRoom(data); // Same logic as join_room
        break;
      case 'add_reaction':
        this.handleAddReaction(data);
        break;
      default:
        console.log('Unhandled mock event:', event);
    }
  }

  handleSendMessage(data) {
    if (typeof window === 'undefined') return;

    const message = {
      id: uuidv4(),
      username: this.user.username,
      userId: this.user.id,
      message: data.message,
      timestamp: new Date().toISOString(),
      status: 'sent',
      roomId: this.currentRoom,
      reactions: [],
      fileData: data.fileData
    };

    this.addMessageToStorage(message);
    
    // Simulate message delivery
    setTimeout(() => {
      message.status = 'delivered';
      if (this.callbacks?.onMessage) {
        this.callbacks.onMessage(message);
      }
    }, 100);
  }

  handleTypingStart(data) {
    // In serverless mode, just acknowledge typing
    console.log('User started typing:', data);
  }

  handleTypingStop(data) {
    // In serverless mode, just acknowledge stop typing
    console.log('User stopped typing:', data);
  }

  handleJoinRoom(data) {
    if (typeof window === 'undefined') return;

    const previousRoom = this.currentRoom;
    this.currentRoom = data.roomId || 'general';
    
    // Store room data
    localStorage.setItem('chat_room_data', JSON.stringify({
      currentRoom: this.currentRoom,
      lastJoined: new Date().toISOString()
    }));

    // Simulate room join confirmation
    setTimeout(() => {
      if (this.callbacks?.onConnect) {
        this.callbacks.onConnect({
          user: this.user,
          room: {
            id: this.currentRoom,
            name: this.getRoomName(this.currentRoom),
            users: [this.user],
            messages: this.getStoredMessages() // Load existing messages for this room
          }
        });
      }
    }, 500);
  }

  handleAddReaction(data) {
    if (typeof window === 'undefined') return;

    // Update message with reaction in localStorage
    const messages = this.getStoredMessages();
    const messageIndex = messages.findIndex(m => m.id === data.messageId);
    
    if (messageIndex !== -1) {
      if (!messages[messageIndex].reactions) {
        messages[messageIndex].reactions = [];
      }
      
      // Use the provided userId or fall back to current user
      const userId = data.userId || this.user?.id;
      const username = data.username || this.user?.username;
      
      // Check if user already reacted with this emoji
      const existingReaction = messages[messageIndex].reactions.find(
        r => r.userId === userId && r.emoji === data.reaction
      );
      
      if (existingReaction) {
        // Remove reaction
        messages[messageIndex].reactions = messages[messageIndex].reactions.filter(
          r => !(r.userId === userId && r.emoji === data.reaction)
        );
      } else {
        // Add reaction
        messages[messageIndex].reactions.push({
          emoji: data.reaction,
          userId: userId,
          username: username,
          timestamp: new Date().toISOString()
        });
      }
      
      localStorage.setItem(`chat_messages_${this.currentRoom}`, JSON.stringify(messages));
      
      // Notify callback
      if (this.callbacks?.onMessageReaction) {
        this.callbacks.onMessageReaction({
          messageId: data.messageId,
          emoji: data.reaction,
          userId: userId,
          username: username,
          reactions: messages[messageIndex].reactions
        });
      }
    }
  }

  addMessageToStorage(message) {
    if (typeof window === 'undefined') return;

    const messages = this.getStoredMessages();
    messages.push(message);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }
    
    localStorage.setItem(`chat_messages_${this.currentRoom}`, JSON.stringify(messages));
  }

  getStoredMessages() {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(`chat_messages_${this.currentRoom}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to parse stored messages:', e);
      return [];
    }
  }

  getRoomName(roomId) {
    const roomNames = {
      'general': 'General',
      'random': 'Random',
      'tech': 'Tech Talk',
      'gaming': 'Gaming',
      'music': 'Music'
    };
    return roomNames[roomId] || roomId.charAt(0).toUpperCase() + roomId.slice(1);
  }

  // Room management methods
  async getRooms() {
    // Return mock rooms for serverless mode with real-time user counts
    const rooms = [
      {
        id: 'general',
        name: 'General',
        description: 'General discussion',
        userCount: this.getUserCountForRoom('general'),
        isPrivate: false,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'random',
        name: 'Random',
        description: 'Random conversations',
        userCount: this.getUserCountForRoom('random'),
        isPrivate: false,
        createdAt: '2024-01-01T01:00:00Z'
      },
      {
        id: 'tech',
        name: 'Tech Talk',
        description: 'Technology discussions',
        userCount: this.getUserCountForRoom('tech'),
        isPrivate: false,
        createdAt: '2024-01-01T02:00:00Z'
      },
      {
        id: 'gaming',
        name: 'Gaming',
        description: 'Gaming chat',
        userCount: this.getUserCountForRoom('gaming'),
        isPrivate: false,
        createdAt: '2024-01-01T03:00:00Z'
      },
      {
        id: 'music',
        name: 'Music',
        description: 'Music and audio discussions',
        userCount: this.getUserCountForRoom('music'),
        isPrivate: false,
        createdAt: '2024-01-01T04:00:00Z'
      }
    ];
    
    return rooms;
  }

  createRoom(roomData) {
    console.log('Creating room in serverless mode:', roomData);
    // In serverless mode, just simulate room creation
    return Promise.resolve({
      id: roomData.name.toLowerCase().replace(/\s+/g, '-'),
      name: roomData.name,
      description: roomData.description || '',
      userCount: 1,
      isPrivate: roomData.isPrivate || false,
      createdAt: new Date().toISOString()
    });
  }

  leaveRoom(roomId) {
    console.log('Leaving room in serverless mode:', roomId);
    // In serverless mode, just log the action
    return Promise.resolve();
  }

  // Compatibility methods for other components
  emit(event, data) {
    return this.handleEmit(event, data);
  }

  // Additional helper methods
  updateUserStatus(status) {
    console.log('Updating user status in serverless mode:', status);
  }

  sendPrivateMessage(recipientId, message) {
    console.log('Sending private message in serverless mode:', { recipientId, message });
    // In serverless mode, just simulate
    return Promise.resolve();
  }

  // Method compatibility with real socket service
  sendMessage(messageData) {
    this.handleSendMessage(messageData);
  }

  joinRoom(roomId) {
    this.handleJoinRoom({ roomId });
  }

  startTyping() {
    this.handleTypingStart({ user: this.user });
  }

  stopTyping() {
    this.handleTypingStop({ user: this.user });
  }

  reactToMessage(messageId, reaction) {
    this.handleAddReaction({ messageId, reaction });
  }

  disconnect() {
    console.log('Disconnecting from serverless chat...');
    
    // Clear intervals
    this.activityIntervals.forEach(interval => clearInterval(interval));
    this.activityIntervals = [];
    
    this.socket = null;
    this.callbacks = null;
  }

  isConnected() {
    return true; // Always connected in serverless mode
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  getUser() {
    return this.user;
  }

  // Helper methods for enhanced NPC interactions
  generateResponse(user, lastMessage) {
    const responses = {
      // Responses to greetings
      greeting: [
        'Hey there!', 'Hello!', 'Hi! 👋', 'What\'s up!', 'Good to see you!'
      ],
      // Responses to questions
      question: [
        'Good question!', 'Hmm, let me think...', 'Interesting point!', 
        'I\'ve been wondering the same thing', 'Not sure, but maybe...'
      ],
      // Responses to tech talk
      tech: [
        'That sounds awesome!', 'I love working with that too!', 
        'Tech is so exciting these days', 'Have you tried the latest version?',
        'The documentation is pretty good for that'
      ],
      // Generic positive responses
      positive: [
        'Totally agree!', 'That\'s so cool!', 'Nice one!', 'Awesome!', 
        'Love it!', 'Great point!', 'Exactly!', 'So true!'
      ],
      // Responses based on user personality
      personality: {
        friendly: ['That\'s wonderful! 😊', 'I\'m so happy to hear that!', 'You\'re amazing!'],
        'tech-savvy': ['The implementation sounds solid', 'Cool architecture choice', 'Interesting approach!'],
        casual: ['Nice!', 'Cool beans', 'That\'s pretty neat'],
        gamer: ['Epic!', 'GG!', 'That\'s legendary!', 'Clutch!'],
        'music-lover': ['That hits different!', 'Such good vibes!', 'I feel that!']
      }
    };

    const message = lastMessage.message.toLowerCase();
    const personalityResponses = responses.personality[user.personality] || responses.positive;

    // Check for specific triggers
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    
    if (message.includes('?')) {
      return responses.question[Math.floor(Math.random() * responses.question.length)];
    }
    
    if (message.includes('code') || message.includes('dev') || message.includes('program')) {
      return responses.tech[Math.floor(Math.random() * responses.tech.length)];
    }
    
    // Use personality-based response
    if (Math.random() > 0.5) {
      return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    }
    
    // Default to positive response
    return responses.positive[Math.floor(Math.random() * responses.positive.length)];
  }

  simulateTypingAndMessage(user, message = null, contextMessage = null) {
    if (this.callbacks?.onUserTyping) {
      this.callbacks.onUserTyping({ username: user.username, isTyping: true });
    }
    
    setTimeout(async () => {
      if (this.callbacks?.onUserTyping) {
        this.callbacks.onUserTyping({ username: user.username, isTyping: false });
      }
      
      // Use AI if no specific message provided
      if (message) {
        this.simulateUserMessage(user, message);
      }
    }, user.typingSpeed || 2000);
  }

  simulateUserMessage(user, message) {
    const simulatedMessage = {
      id: uuidv4(),
      username: user.username,
      userId: user.id,
      message: message,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      roomId: user.currentRoom,
      reactions: []
    };
    
    // Only add to storage and trigger callback if in the same room
    if (user.currentRoom === this.currentRoom) {
      this.addMessageToStorage(simulatedMessage);
      if (this.callbacks?.onMessage) {
        this.callbacks.onMessage(simulatedMessage);
      }
    }
  }

  // Helper method to get real-time user count for each room
  getUserCountForRoom(roomId) {
    if (typeof window === 'undefined' || !this.mockUsers) return 1;
    
    // Count online NPCs in this room
    const onlineNPCsInRoom = this.mockUsers.filter(u => 
      u.isOnline && u.currentRoom === roomId
    ).length;
    
    // Add 1 for the real user if they're in this room
    const realUserInRoom = this.currentRoom === roomId ? 1 : 0;
    
    return onlineNPCsInRoom + realUserInRoom;
  }

  // Get all users (real + NPCs) for a specific room
  getUsersInRoom(roomId) {
    if (typeof window === 'undefined' || !this.mockUsers) return [];
    
    const users = [];
    
    // Add real user if they're in this room
    if (this.currentRoom === roomId && this.user) {
      users.push({
        ...this.user,
        isOnline: true,
        currentRoom: roomId
      });
    }
    
    // Add online NPCs in this room
    const npcsInRoom = this.mockUsers.filter(u => 
      u.isOnline && u.currentRoom === roomId
    );
    
    users.push(...npcsInRoom);
    
    return users;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
