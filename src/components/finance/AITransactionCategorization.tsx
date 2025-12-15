import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Tag, CheckCircle, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Transaction } from '../../services/financeAPI';

interface CategorySuggestion {
  transactionId: string;
  currentCategory: string;
  suggestedCategory: string;
  confidence: number;
  reason: string;
}

interface AITransactionCategorizationProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onCategorize?: (transactionId: string, category: string) => void;
  onBulkCategorize?: (updates: Array<{ id: string; category: string }>) => void;
}

const AITransactionCategorization: React.FC<AITransactionCategorizationProps> = ({
  isOpen,
  onClose,
  transactions,
  onCategorize,
  onBulkCategorize
}) => {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);

  React.useEffect(() => {
    if (isOpen && transactions.length > 0) {
      generateSuggestions();
    }
  }, [isOpen, transactions]);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find uncategorized or potentially miscategorized transactions
    const uncategorized = transactions.filter(t => 
      t.category === 'other' || 
      t.category === 'uncategorized' ||
      !t.category
    );

    const newSuggestions: CategorySuggestion[] = uncategorized.slice(0, 10).map(transaction => {
      // AI logic to suggest category based on description
      const desc = transaction.description.toLowerCase();
      let suggestedCategory = 'other';
      let confidence = 0.7;
      let reason = '';

      if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) {
        suggestedCategory = 'food_dining';
        confidence = 0.95;
        reason = 'Description indicates food or dining expenses';
      } else if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('lyft') || desc.includes('transport')) {
        suggestedCategory = 'transportation';
        confidence = 0.9;
        reason = 'Description indicates transportation expenses';
      } else if (desc.includes('amazon') || desc.includes('walmart') || desc.includes('target') || desc.includes('shop')) {
        suggestedCategory = 'shopping';
        confidence = 0.85;
        reason = 'Description indicates shopping expenses';
      } else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('entertainment') || desc.includes('movie')) {
        suggestedCategory = 'entertainment';
        confidence = 0.9;
        reason = 'Description indicates entertainment expenses';
      } else if (desc.includes('electric') || desc.includes('water') || desc.includes('utility') || desc.includes('bill')) {
        suggestedCategory = 'bills';
        confidence = 0.95;
        reason = 'Description indicates utility or bill payments';
      } else if (desc.includes('hospital') || desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('medical')) {
        suggestedCategory = 'healthcare';
        confidence = 0.9;
        reason = 'Description indicates healthcare expenses';
      }

      return {
        transactionId: transaction.id,
        currentCategory: transaction.category || 'uncategorized',
        suggestedCategory,
        confidence,
        reason
      };
    }).filter(s => s.suggestedCategory !== s.currentCategory);

    setSuggestions(newSuggestions);
    setLoading(false);
  };

  const toggleSuggestion = (transactionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCategorize = async () => {
    setCategorizing(true);
    const updates = suggestions
      .filter(s => selectedSuggestions.has(s.transactionId))
      .map(s => ({ id: s.transactionId, category: s.suggestedCategory }));

    if (onBulkCategorize) {
      await onBulkCategorize(updates);
    } else if (onCategorize) {
      for (const update of updates) {
        await onCategorize(update.id, update.category);
      }
    }

    setCategorizing(false);
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">AI Transaction Categorization</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing transactions...</span>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>All transactions are properly categorized</p>
            <button
              onClick={generateSuggestions}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Re-analyze
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>AI Analysis:</strong> Found {suggestions.length} transaction{suggestions.length > 1 ? 's' : ''} that may need recategorization.
                Review and apply suggestions to improve your financial tracking.
              </p>
            </div>

            {suggestions.map((suggestion) => {
              const transaction = transactions.find(t => t.id === suggestion.transactionId);
              const isSelected = selectedSuggestions.has(suggestion.transactionId);

              return (
                <div
                  key={suggestion.transactionId}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleSuggestion(suggestion.transactionId)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSuggestion(suggestion.transactionId)}
                      className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{transaction?.description}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {(suggestion.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Current: </span>
                          <span className="font-medium">{getCategoryLabel(suggestion.currentCategory)}</span>
                        </div>
                        <span>→</span>
                        <div>
                          <span className="text-gray-600">Suggested: </span>
                          <span className="font-medium text-purple-600">{getCategoryLabel(suggestion.suggestedCategory)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.reason}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCategorize}
                disabled={selectedSuggestions.size === 0 || categorizing}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {categorizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Categorizing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Apply to {selectedSuggestions.size} Transaction{selectedSuggestions.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AITransactionCategorization;

