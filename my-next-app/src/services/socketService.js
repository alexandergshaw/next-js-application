import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.typingUsers = new Set();
  }

  connect(user, onMessage, onUserJoined, onUserLeft, onConnect, onDisconnect) {
    // For Phase 2, we'll use a more sophisticated WebSocket server
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: false
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('user_join', { user });
      onConnect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      onDisconnect?.();
    });

    // Message events
    this.socket.on('new_message', (data) => {
      onMessage?.(data);
    });

    this.socket.on('user_joined', (data) => {
      onUserJoined?.(data);
    });

    this.socket.on('user_left', (data) => {
      onUserLeft?.(data);
    });

    // Connect to server
    this.socket.connect();
    
    return this.socket;
  }

  sendMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', message);
    }
  }

  startTyping(username) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_start', { username });
    }
  }

  stopTyping(username) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_stop', { username });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Enhanced simulation for Phase 2 with typing indicators and user management
  simulateConnectionWithFeatures(user, onMessage, onConnect, onTypingStart, onTypingStop, onDisconnect) {
    console.log(`Simulating enhanced connection for ${user.username}`);
    
    // Simulate connection after 1 second
    setTimeout(() => {
      onConnect?.();
      
      // Send a welcome message
      setTimeout(() => {
        onMessage?.({
          id: Date.now() + Math.random(),
          username: 'System',
          message: `Welcome back, ${user.username}! Your messages are now persisted. 🎉`,
          timestamp: new Date().toISOString(),
          status: 'delivered'
        });

        // Simulate another user joining
        setTimeout(() => {
          onMessage?.({
            id: Date.now() + Math.random(),
            username: 'System',
            message: `Alice joined the chat`,
            timestamp: new Date().toISOString(),
            status: 'delivered'
          });
        }, 2000);
      }, 500);
    }, 1000);

    // Simulate typing indicators periodically
    let typingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUser = ['Alice', 'Bob'][Math.floor(Math.random() * 2)];
        onTypingStart?.({ username: randomUser });
        
        setTimeout(() => {
          onTypingStop?.({ username: randomUser });
          
          // Sometimes send a message after typing
          if (Math.random() > 0.5) {
            setTimeout(() => {
              onMessage?.({
                id: Date.now() + Math.random(),
                username: randomUser,
                userId: randomUser === 'Alice' ? 2 : 3,
                message: [
                  'Hey everyone! 👋',
                  'How is everyone doing?',
                  'This is so cool!',
                  'Love the new features!',
                  'Anyone else online?'
                ][Math.floor(Math.random() * 5)],
                timestamp: new Date().toISOString(),
                status: 'sent'
              });
            }, 500);
          }
        }, 2000 + Math.random() * 3000);
      }
    }, 10000 + Math.random() * 5000);

    // Return a mock socket object with enhanced features
    return {
      connected: true,
      emit: (event, data) => {
        console.log(`Emitting ${event}:`, data);
        
        // Handle different event types
        switch (event) {
          case 'send_message':
            // Echo the message back immediately
            setTimeout(() => {
              onMessage?.({
                id: Date.now() + Math.random(),
                username: data.username,
                userId: data.userId,
                message: data.message,
                timestamp: new Date().toISOString(),
                status: 'sent'
              });
            }, 100);
            break;

          case 'typing_start':
            console.log(`${data.username} started typing`);
            break;

          case 'typing_stop':
            console.log(`${data.username} stopped typing`);
            break;

          default:
            break;
        }
      },
      disconnect: () => {
        clearInterval(typingInterval);
        onDisconnect?.();
      }
    };
  }

  // Keep the original simulation for backward compatibility
  simulateConnection(username, onMessage, onConnect) {
    return this.simulateConnectionWithFeatures(
      { username },
      onMessage,
      onConnect,
      null,
      null,
      null
    );
  }
}

export default new SocketService();
