'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Image as ImageIcon, FileText, Heart, ChevronDown, ArrowDown, X, Maximize2 } from 'lucide-react';
import useChatStore from '../store/chatStore';
import TypingIndicator from './TypingIndicator';
import { toast } from 'react-hot-toast';

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
  const [previewFile, setPreviewFile] = useState(null);

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

  const isMyMessage = (message) => {
    return message.userId === currentUser?.id || message.username === currentUser?.username;
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
    setShowReactions(null);
  };

  const handleDownload = (fileData) => {
    try {
      const link = document.createElement('a');
      link.href = fileData.url;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file. Please try again.');
    }
  };

  const handlePreview = (fileData) => {
    setPreviewFile(fileData);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const renderFilePreview = (fileData) => {
    if (!fileData || !fileData.url) {
      console.error('Invalid file data:', fileData);
      return null;
    }

    const isImage = fileData.type.startsWith('image/');
    const isPDF = fileData.type === 'application/pdf';
    const isText = fileData.type === 'text/plain';
    
    return (
      <div className="mt-2">
        {isImage ? (
          <div 
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handlePreview(fileData)}
          >
            <img
              src={fileData.url}
              alt={fileData.name}
              className="max-h-64 w-auto object-contain rounded-lg transition-transform duration-200 transform hover:scale-105"
              onError={(e) => {
                console.error('Error loading image:', e);
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                e.target.className = 'rounded-lg max-h-64 w-auto p-8 bg-gray-100 dark:bg-gray-700';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
            <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {fileData.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(fileData.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {(isPDF || isText) && (
                <button
                  onClick={() => handlePreview(fileData)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  title="Preview file"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => handleDownload(fileData)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
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
      {/* File Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {previewFile.name}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {previewFile.type.startsWith('image/') ? (
                <div className="relative flex items-center justify-center">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Error loading image in preview:', e);
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                      e.target.className = 'max-w-full h-auto mx-auto p-16 bg-gray-100 dark:bg-gray-700 rounded-lg';
                    }}
                  />
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-[80vh] rounded-lg shadow-lg"
                  onError={() => {
                    toast.error('Error loading PDF preview. Try downloading the file instead.');
                  }}
                />
              ) : previewFile.type === 'text/plain' ? (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
                  <object
                    data={previewFile.url}
                    type="text/plain"
                    className="w-full h-full"
                  >
                    Unable to display text content. Try downloading the file instead.
                  </object>
                </pre>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Preview not available for this file type.</p>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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
                {message.fileData && (
                  <div className={`mt-2 ${isMine ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    <div className="max-w-[300px]">
                      {message.fileData.type.startsWith('image/') ? (
                        <div 
                          className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                          onClick={() => handlePreview(message.fileData)}
                        >
                          <img
                            src={message.fileData.url}
                            alt={message.fileData.name}
                            className="w-full h-auto object-cover rounded-lg transition-transform duration-200 transform hover:scale-105"
                            onError={(e) => {
                              console.error('Error loading image:', e);
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              e.target.className = 'w-full h-48 p-8 object-contain';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" />
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                          isMine 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } transition-colors duration-200`}>
                          <FileText className={`w-8 h-8 flex-shrink-0 ${
                            isMine ? 'text-white' : 'text-blue-500 dark:text-blue-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isMine ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {message.fileData.name}
                            </p>
                            <p className={`text-xs ${
                              isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {(message.fileData.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {(message.fileData.type === 'application/pdf' || message.fileData.type === 'text/plain') && (
                              <button
                                onClick={() => handlePreview(message.fileData)}
                                className={`p-1 rounded-full transition-colors ${
                                  isMine 
                                    ? 'text-white hover:bg-blue-400' 
                                    : 'text-blue-500 hover:bg-gray-300 dark:text-blue-400 dark:hover:bg-gray-500'
                                }`}
                                title="Preview file"
                              >
                                <Maximize2 className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(message.fileData)}
                              className={`p-1 rounded-full transition-colors ${
                                isMine 
                                  ? 'text-white hover:bg-blue-400' 
                                  : 'text-blue-500 hover:bg-gray-300 dark:text-blue-400 dark:hover:bg-gray-500'
                              }`}
                              title="Download file"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
