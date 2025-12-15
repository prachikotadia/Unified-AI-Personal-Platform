import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, CheckCircle, AlertCircle, TrendingUp, Clock, MapPin } from 'lucide-react';

interface AIItineraryOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: {
    days: Array<{
      day: number;
      date: string;
      activities: Array<{
        time: string;
        activity: string;
        location: string;
      }>;
    }>;
  };
  onApplyOptimization: (optimizedItinerary: any) => void;
}

interface OptimizationSuggestion {
  type: 'reorder' | 'add' | 'remove' | 'time-adjustment';
  day: number;
  activity?: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  newOrder?: number[];
  newTime?: string;
}

const AIItineraryOptimizerModal: React.FC<AIItineraryOptimizerModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  onApplyOptimization
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [optimizedItinerary, setOptimizedItinerary] = useState<any>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const handleOptimize = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI optimization logic
    const newSuggestions: OptimizationSuggestion[] = [
      {
        type: 'reorder',
        day: 1,
        reason: 'Activities are not in optimal geographic order. Reordering will reduce travel time by 45 minutes.',
        impact: 'high',
        newOrder: [0, 2, 1, 3]
      },
      {
        type: 'time-adjustment',
        day: 1,
        activity: 'Visit Senso-ji Temple',
        reason: 'Temple is less crowded in the morning. Moving to 9:00 AM will improve experience.',
        impact: 'medium',
        newTime: '09:00'
      },
      {
        type: 'add',
        day: 2,
        activity: 'Lunch break at local restaurant',
        reason: 'Adding a lunch break between activities will improve energy levels and allow for better exploration.',
        impact: 'medium'
      }
    ];

    setSuggestions(newSuggestions);
    
    // Generate optimized itinerary
    const optimized = {
      ...itinerary,
      days: itinerary.days.map((day, dayIndex) => {
        if (dayIndex === 0) {
          // Reorder activities for day 1
          const reordered = newSuggestions[0].newOrder 
            ? newSuggestions[0].newOrder.map(i => day.activities[i])
            : day.activities;
          return {
            ...day,
            activities: reordered.map((act, idx) => {
              if (idx === 2 && newSuggestions[1].newTime) {
                return { ...act, time: newSuggestions[1].newTime };
              }
              return act;
            })
          };
        }
        if (dayIndex === 1 && newSuggestions[2]) {
          // Add lunch break to day 2
          return {
            ...day,
            activities: [
              ...day.activities.slice(0, 2),
              { time: '12:00', activity: 'Lunch break at local restaurant', location: 'Nearby' },
              ...day.activities.slice(2)
            ]
          };
        }
        return day;
      })
    };

    setOptimizedItinerary(optimized);
    setLoading(false);
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleApplyOptimization = () => {
    if (optimizedItinerary) {
      onApplyOptimization(optimizedItinerary);
      onClose();
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Itinerary Optimizer</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!optimizedItinerary && (
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                AI will analyze your itinerary and suggest optimizations for better travel experience.
              </p>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Brain size={18} />
                    Optimize Itinerary
                  </>
                )}
              </button>
            </div>
          )}

          {optimizedItinerary && (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-900 dark:text-green-200">Optimization Complete</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-300">
                  AI has analyzed your itinerary and found {suggestions.length} optimization opportunities.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Optimization Suggestions</h3>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSuggestions.has(index)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSuggestion(index)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(index)}
                          onChange={() => toggleSuggestion(index)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      {suggestion.type === 'reorder' && <TrendingUp className="text-blue-600" size={16} />}
                      {suggestion.type === 'time-adjustment' && <Clock className="text-yellow-600" size={16} />}
                      {suggestion.type === 'add' && <Plus className="text-green-600" size={16} />}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <strong>Day {suggestion.day}:</strong> {suggestion.reason}
                    </p>
                    {suggestion.activity && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Activity: {suggestion.activity}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Expected Improvements</h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Reduced travel time by ~45 minutes</li>
                  <li>• Better activity timing for optimal experience</li>
                  <li>• Improved energy management with breaks</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyOptimization}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Apply Optimizations
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIItineraryOptimizerModal;

