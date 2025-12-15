import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Message } from '../../store/chat';

interface SearchInChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSelectMessage?: (messageId: string) => void;
}

const SearchInChatModal: React.FC<SearchInChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSelectMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(term) && msg.type === 'text'
    );
  }, [messages, searchTerm]);

  const handleSelectMessage = (messageId: string) => {
    if (onSelectMessage) {
      onSelectMessage(messageId);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && selectedIndex < filteredMessages.length - 1) {
      e.preventDefault();
      setSelectedIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      e.preventDefault();
      setSelectedIndex(prev => prev - 1);
    } else if (e.key === 'Enter' && filteredMessages[selectedIndex]) {
      e.preventDefault();
      handleSelectMessage(filteredMessages[selectedIndex].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Search in Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        </div>

        {searchTerm && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No messages found' : 'Start typing to search...'}
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{msg.senderName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>

        {filteredMessages.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>{selectedIndex + 1} of {filteredMessages.length}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchInChatModal;

