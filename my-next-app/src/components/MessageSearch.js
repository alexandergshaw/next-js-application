'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageSearch({ messages, onSelectMessage, isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    setIsSearching(true);
    
    // Debounce search
    const timer = setTimeout(() => {
      performSearch(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, messages]);

  const performSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    const results = messages
      .filter(message => 
        message.message.toLowerCase().includes(lowercaseQuery) ||
        message.username.toLowerCase().includes(lowercaseQuery)
      )
      .map(message => ({
        ...message,
        highlightedMessage: highlightSearchTerm(message.message, query)
      }))
      .reverse(); // Show newest results first

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const navigateResults = (direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex = currentResultIndex;
    
    if (direction === 'up') {
      newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0;
    }
    
    setCurrentResultIndex(newIndex);
    
    // Scroll to message in chat
    if (searchResults[newIndex]) {
      onSelectMessage(searchResults[newIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        navigateResults('up');
      } else {
        navigateResults('down');
      }
      e.preventDefault();
    }
  };

  const selectResult = (message, index) => {
    setCurrentResultIndex(index);
    onSelectMessage(message);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-2 z-50 overflow-hidden">
      {/* Search Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search messages..."
            className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
          
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentResultIndex + 1} of {searchResults.length}
              </span>
              <button
                onClick={() => navigateResults('up')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Previous result (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateResults('down')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Next result (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Close search (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-h-80 overflow-y-auto">
        {isSearching && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Searching...
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No messages found for "{searchQuery}"
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {searchResults.map((message, index) => (
              <button
                key={message.id}
                onClick={() => selectResult(message, index)}
                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  index === currentResultIndex ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {message.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {message.highlightedMessage}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Type to search messages</p>
            <p className="text-xs mt-1">Use Enter/Shift+Enter to navigate results</p>
          </div>
        )}
      </div>
    </div>
  );
}
