'use client';

import { useState } from 'react';
import useChatStore from '../store/chatStore';

export default function UsernameSetup({ onUsernameSet }) {
  const [inputUsername, setInputUsername] = useState('');
  const setUsername = useChatStore(state => state.setUsername);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      onUsernameSet(inputUsername.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ChatApp</h1>
          <p className="text-gray-600">Enter your username to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              maxLength={20}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputUsername.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Join Chat
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Phase 1: Basic Chat Foundation
          </p>
        </div>
      </div>
    </div>
  );
}
