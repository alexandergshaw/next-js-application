'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Image as ImageIcon, FileText, Heart, ChevronDown, ArrowDown } from 'lucide-react';
import useChatStore from '../store/chatStore';
import TypingIndicator from './TypingIndicator';

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

export default function MessageList() {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  
  const messages = useChatStore(state => state.messages);
  const currentUser = useChatStore(state => state.user);
  const addReaction = useChatStore(state => state.addReaction);
  
  const [showReactions, setShowReactions] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (isAtBottom || force)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
      setUnreadCount(0);
      setShowScrollButton(false);
    }
  }, [isAtBottom]);

  // Instant scroll to bottom (for initial load)
  const scrollToBottomInstant = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end'
      });
      setUnreadCount(0);
      setShowScrollButton(false);
    }
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const threshold = 100;

    const atBottom = distanceFromBottom <= threshold;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && scrollHeight > clientHeight + 200);

    // Clear user scrolling flag after a delay
    setIsUserScrolling(true);
    clearTimeout(handleScroll.timeoutId);
    handleScroll.timeoutId = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, []);

  // Auto-scroll for new messages
  useEffect(() => {
    const newMessageCount = messages.length;
    const hasNewMessages = newMessageCount > lastMessageCountRef.current;
    lastMessageCountRef.current = newMessageCount;

    if (hasNewMessages) {
      if (isAtBottom || newMessageCount === 1) {
        // Auto-scroll if user is at bottom or it's the first message
        setTimeout(() => scrollToBottom(), 50);
      } else if (!isUserScrolling) {
        // Show unread indicator if user is scrolled up
        setUnreadCount(prev => prev + 1);
        setShowScrollButton(true);
      }
    }
  }, [messages.length, isAtBottom, isUserScrolling, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomInstant();
    }
  }, [messages.length > 0, scrollToBottomInstant]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'just now';
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const isMyMessage = (message) => {
    return message.userId === currentUser?.id || message.username === currentUser?.username;
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
    setShowReactions(null);
  };

  const handleDownload = (fileData) => {
    const link = document.createElement('a');
    link.href = fileData.url;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilePreview = (fileData) => {
    if (!fileData) return null;

    const isImage = fileData.type.startsWith('image/');
    
    return (
      <div className="mt-2 max-w-xs">
        {isImage ? (
          <div className="relative group">
            <img
              src={fileData.url}
              alt={fileData.name}
              className="rounded-lg max-h-64 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileData.url, '_blank')}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {fileData.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(fileData.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => handleDownload(fileData)}
              className="text-blue-500 hover:text-blue-700 p-1"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderReactions = (message) => {
    if (!message.reactions || message.reactions.length === 0) return null;

    // Group reactions by emoji
    const reactionGroups = message.reactions.reduce((groups, reaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = [];
      }
      groups[reaction.emoji].push(reaction);
      return groups;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(message.id, emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${
              reactions.some(r => r.userId === currentUser?.id)
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>{emoji}</span>
            <span>{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50 dark:bg-gray-900"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: rgba(156, 163, 175, 0.7);
          }
        `}</style>

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
        messages.map((message) => {
          const isMine = isMyMessage(message);
          const isSystem = message.username === 'System';
          
          return (
            <div key={message.id} className="flex flex-col">
              <div
                id={`message-${message.id}`}
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group transition-all duration-300 ${
                  isSystem
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 self-center text-center text-sm'
                    : isMine
                    ? 'bg-blue-600 text-white self-end'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 self-start shadow-sm border border-gray-200 dark:border-gray-700'
                }`}
              >
                {!isSystem && !isMine && (
                  <div className="text-xs opacity-75 mb-1 font-medium">
                    {message.username}
                  </div>
                )}
                
                <div className="break-words">{message.message}</div>
                
                {/* File attachment */}
                {message.fileData && renderFilePreview(message.fileData)}
                
                {/* Message status for own messages */}
                {isMine && !isSystem && message.status && (
                  <div className="text-xs opacity-75 mt-1 text-right">
                    <span className={`${message.status === 'read' ? 'text-blue-200' : 'text-white'}`}>
                      {getMessageStatusIcon(message.status)}
                    </span>
                  </div>
                )}

                {/* Reaction button */}
                {!isSystem && (
                  <button
                    onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                    className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full p-1 text-xs transition-all duration-200"
                    title="Add reaction"
                  >
                    <Heart className="w-3 h-3" />
                  </button>
                )}

                {/* Reaction picker */}
                {showReactions === message.id && (
                  <div className="absolute -bottom-12 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Reactions */}
              {!isSystem && (
                <div className={`${isMine ? 'self-end' : 'self-start'} max-w-xs lg:max-w-md`}>
                  {renderReactions(message)}
                </div>
              )}
              
              <div
                className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                  isSystem ? 'self-center' : isMine ? 'self-end' : 'self-start'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          );
        })
        )}
        
        {/* Typing indicator */}
        <TypingIndicator />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center space-x-2 group"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
