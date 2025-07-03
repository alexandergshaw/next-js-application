class AuthService {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
  }

  // Load users from localStorage (client-side only)
  loadUsers() {
    if (typeof window === 'undefined') return [];
    
    try {
      const users = localStorage.getItem('chatapp_users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users to localStorage (client-side only)
  saveUsers(users) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chatapp_users', JSON.stringify(users));
      this.users = users;
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Load current user from localStorage (client-side only)
  loadCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = localStorage.getItem('chatapp_current_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }

  // Save current user to localStorage (client-side only)
  saveCurrentUser(user) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chatapp_current_user', JSON.stringify(user));
      this.currentUser = user;
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  // Register a new user
  register(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = this.users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create new user
    const newUser = {
      id: Date.now() + Math.random(),
      username: username.trim(),
      password: password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      isOnline: false
    };

    this.users.push(newUser);
    this.saveUsers(this.users);

    return { id: newUser.id, username: newUser.username };
  }

  // Login user
  login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = this.users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    const loggedInUser = { id: user.id, username: user.username };
    this.saveCurrentUser(loggedInUser);
    
    // Mark user as online
    this.setUserOnlineStatus(user.id, true);

    return loggedInUser;
  }

  // Logout user
  logout() {
    if (this.currentUser) {
      this.setUserOnlineStatus(this.currentUser.id, false);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatapp_current_user');
    }
    this.currentUser = null;
  }

  // Set user online/offline status
  setUserOnlineStatus(userId, isOnline) {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].isOnline = isOnline;
      this.users[userIndex].lastSeen = new Date().toISOString();
      this.saveUsers(this.users);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get online users
  getOnlineUsers() {
    return this.users.filter(user => user.isOnline);
  }

  // Get all users
  getAllUsers() {
    return this.users.map(user => ({
      id: user.id,
      username: user.username,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    }));
  }
}

export default new AuthService();
