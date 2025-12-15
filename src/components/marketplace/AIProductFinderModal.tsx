import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, X, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '../../services/api';

interface AIProductFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onSelectProduct?: (product: Product) => void;
}

const AIProductFinderModal: React.FC<AIProductFinderModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate AI search
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate AI suggestions based on query
    const aiSuggestions = [
      `Best ${searchQuery} for 2024`,
      `Top rated ${searchQuery}`,
      `${searchQuery} under $100`,
      `Premium ${searchQuery}`,
      `${searchQuery} with free shipping`
    ];
    
    setSuggestions(aiSuggestions);
    setLoading(false);
    onSearch(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">AI Product Finder</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
              placeholder="Describe what you're looking for..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-purple-600" size={24} />
            </div>
          )}

          {suggestions.length > 0 && !loading && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">AI Suggestions:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIProductFinderModal;

