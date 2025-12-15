import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, Send, Lightbulb } from 'lucide-react';

interface AISearchAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: string;
  onRefine: (refinedQuery: string, suggestions: string[]) => void;
}

const AISearchAssistantModal: React.FC<AISearchAssistantModalProps> = ({
  isOpen,
  onClose,
  currentQuery,
  onRefine
}) => {
  const [refinedQuery, setRefinedQuery] = useState(currentQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefine = async () => {
    setLoading(true);
    // Simulate AI refinement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockSuggestions = [
      `${refinedQuery} with free shipping`,
      `${refinedQuery} under $100`,
      `Best rated ${refinedQuery}`,
      `${refinedQuery} on sale`
    ];
    
    setSuggestions(mockSuggestions);
    setLoading(false);
  };

  const handleApplyRefinement = (suggestion: string) => {
    onRefine(suggestion, suggestions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Search Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
              <strong>Current Search:</strong> {currentQuery}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refine Your Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={refinedQuery}
                onChange={(e) => setRefinedQuery(e.target.value)}
                placeholder="Describe what you're looking for..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleRefine}
                disabled={loading || !refinedQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Refine
                  </>
                )}
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={16} />
                AI Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyRefinement(suggestion)}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Our AI analyzes your search query and suggests improvements to help you find exactly what you're looking for.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AISearchAssistantModal;

