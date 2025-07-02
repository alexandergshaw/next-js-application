'use client';

import { useState, useRef, useCallback } from 'react';
import { Smile, Send } from 'lucide-react';
import useChatStore from '../store/chatStore';
import EmojiPicker from './EmojiPicker';
import FileUpload from './FileUpload';

export default function MessageInput({ onSendMessage, onFileSelect, disabled }) {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  
  const { user, socket, addTypingUser, removeTypingUser } = useChatStore();

  // Debounced typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !user) return;

    // If not already typing, emit typing start
    if (!isTypingRef.current) {
      socket.emit('typing_start', { username: user.username });
      addTypingUser(user.username);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && user) {
        socket.emit('typing_stop', { username: user.username });
        removeTypingUser(user.username);
      }
      isTypingRef.current = false;
    }, 1000);
  }, [socket, user, addTypingUser, removeTypingUser]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      handleTyping();
    }
  };

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket && user && isTypingRef.current) {
      socket.emit('typing_stop', { username: user.username });
      removeTypingUser(user.username);
    }
    isTypingRef.current = false;
  }, [socket, user, removeTypingUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      stopTyping();
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleBlur = () => {
    stopTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleFileSelect = (fileData) => {
    onFileSelect(fileData);
  };

  return (
    <div className="border-t bg-white dark:bg-gray-800 dark:border-gray-600 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
        {/* File Upload */}
        <div className="relative">
          <FileUpload onFileSelect={handleFileSelect} disabled={disabled} />
        </div>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-end space-x-2">
            <textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder={disabled ? "Connecting..." : "Type your message..."}
              disabled={disabled}
              rows={1}
              className="flex-1 px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none min-h-[40px] max-h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              maxLength={500}
              style={{
                height: 'auto',
                minHeight: '40px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            
            {/* Emoji Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                disabled={disabled}
                className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <EmojiPicker
                isOpen={isEmojiPickerOpen}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setIsEmojiPickerOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[40px] h-[40px]"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>{message.length}/500</span>
      </div>
    </div>
  );
}
