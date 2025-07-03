'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
  'People': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎'],
  'Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬'],
  'Activity': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳'],
  'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛺'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥'],
  'Symbols': ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮']
};

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Smileys');

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 bottom-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl p-4 w-80 max-w-[95vw] z-50 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">Emoji</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close emoji picker"
        >
          <span className="text-lg">✕</span>
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex space-x-1 mb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-2 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors border border-transparent ${
              selectedCategory === category
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-700 shadow'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            style={{ minWidth: 60 }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            tabIndex={0}
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
