import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Edit, Plus, MapPin, Clock, Star, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useToastHelpers } from '../ui/Toast';
import ActivityModal from './ActivityModal';

interface Activity {
  time: string;
  activity: string;
  location: string;
  type?: string;
  description?: string;
  duration?: string;
  rating?: number;
  price?: string;
}

interface AISuggestion {
  day: number;
  date: string;
  activities: Activity[];
  reason: string;
}

interface AIItinerarySuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    destination: string;
    start_date: string;
    end_date: string;
    trip_type?: string;
  };
  existingDays: Array<{
    day: number;
    date: string;
    activities: Activity[];
  }>;
  onAddSuggestions: (suggestions: AISuggestion[]) => void;
}

const AIItinerarySuggestionsModal: React.FC<AIItinerarySuggestionsModalProps> = ({
  isOpen,
  onClose,
  trip,
  existingDays,
  onAddSuggestions
}) => {
  const { generateResponse, isLoading } = useAI();
  const { success, error: showError } = useToastHelpers();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [editingActivity, setEditingActivity] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState(false);

  // Generate AI suggestions
  const generateSuggestions = async () => {
    try {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Create prompt for AI
      const prompt = `Generate a detailed travel itinerary for ${trip.destination} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. 
      Trip type: ${trip.trip_type || 'leisure'}
      Number of days: ${daysDiff + 1}
      
      For each day, suggest 3-5 activities with:
      - Time (in HH:MM format)
      - Activity name
      - Location
      - Brief description
      - Estimated duration
      - Price range (if applicable)
      
      Format as JSON array with this structure:
      [
        {
          "day": 1,
          "date": "Dec 14",
          "activities": [
            {
              "time": "09:00",
              "activity": "Activity name",
              "location": "Location name",
              "description": "Brief description",
              "duration": "2 hours",
              "price": "Free or $XX"
            }
          ],
          "reason": "Why these activities are recommended"
        }
      ]
      
      Make suggestions diverse, realistic, and suitable for the destination.`;

      const response = await generateResponse(prompt, {
        type: 'travel',
        destination: trip.destination,
        dates: `${trip.start_date} to ${trip.end_date}`,
        trip_type: trip.trip_type
      });

      // Try to parse JSON from response
      let parsedSuggestions: AISuggestion[] = [];
      
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      try {
        parsedSuggestions = JSON.parse(jsonString);
      } catch {
        // If parsing fails, generate mock suggestions
        parsedSuggestions = generateMockSuggestions(daysDiff, trip.destination);
      }

      // Ensure all days have suggestions
      if (parsedSuggestions.length === 0) {
        parsedSuggestions = generateMockSuggestions(daysDiff, trip.destination);
      }

      setSuggestions(parsedSuggestions);
      setGenerated(true);
      success('Suggestions Generated', 'AI has generated personalized itinerary suggestions!');
    } catch (error: any) {
      console.error('Failed to generate suggestions:', error);
      // Fallback to mock suggestions
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const mockSuggestions = generateMockSuggestions(daysDiff, trip.destination);
      setSuggestions(mockSuggestions);
      setGenerated(true);
      success('Suggestions Generated', 'AI suggestions have been generated (using demo mode)');
    }
  };

  // Generate mock suggestions as fallback
  const generateMockSuggestions = (daysDiff: number, destination: string): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];
    const startDate = new Date(trip.start_date);
    
    const activityTemplates: Activity[][] = [
      [
        { time: '09:00', activity: 'Morning city tour', location: 'City Center', description: 'Explore the main attractions', duration: '3 hours', price: 'Free' },
        { time: '13:00', activity: 'Local cuisine experience', location: 'Historic District', description: 'Try authentic local dishes', duration: '1.5 hours', price: '$20-40' },
        { time: '15:30', activity: 'Museum visit', location: 'Cultural Quarter', description: 'Learn about local history', duration: '2 hours', price: '$10-15' },
        { time: '18:00', activity: 'Evening walk', location: 'Waterfront', description: 'Relaxing stroll with scenic views', duration: '1 hour', price: 'Free' }
      ],
      [
        { time: '08:00', activity: 'Sunrise photography', location: 'Scenic Viewpoint', description: 'Capture beautiful morning views', duration: '1 hour', price: 'Free' },
        { time: '10:00', activity: 'Adventure activity', location: 'Adventure Park', description: 'Exciting outdoor experience', duration: '3 hours', price: '$50-80' },
        { time: '14:00', activity: 'Shopping district', location: 'Market Area', description: 'Browse local shops and markets', duration: '2 hours', price: 'Varies' },
        { time: '19:00', activity: 'Fine dining', location: 'Restaurant District', description: 'Enjoy local specialties', duration: '2 hours', price: '$40-60' }
      ],
      [
        { time: '09:30', activity: 'Nature exploration', location: 'Natural Reserve', description: 'Discover local flora and fauna', duration: '4 hours', price: '$15-25' },
        { time: '15:00', activity: 'Cultural performance', location: 'Cultural Center', description: 'Watch traditional shows', duration: '1.5 hours', price: '$20-30' },
        { time: '17:30', activity: 'Local market visit', location: 'Traditional Market', description: 'Experience local culture', duration: '1.5 hours', price: 'Free' }
      ]
    ];

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const template = activityTemplates[i % activityTemplates.length];
      
      suggestions.push({
        day: i + 1,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activities: template.map(act => ({
          ...act,
          location: `${act.location}, ${destination.split(',')[0]}`
        })),
        reason: `Day ${i + 1} suggestions focus on ${i === 0 ? 'getting oriented' : i === 1 ? 'adventure and exploration' : 'cultural immersion'} in ${destination}`
      });
    }

    return suggestions;
  };

  // Edit activity
  const handleEditActivity = (dayIndex: number, activityIndex: number) => {
    setEditingActivity({ dayIndex, activityIndex });
  };

  // Save edited activity
  const handleSaveEdit = (activityData: any) => {
    if (!editingActivity) return;
    
    const { dayIndex, activityIndex } = editingActivity;
    const newSuggestions = [...suggestions];
    const updatedActivity: Activity = {
      time: activityData.start_time || suggestions[dayIndex].activities[activityIndex].time,
      activity: activityData.name || suggestions[dayIndex].activities[activityIndex].activity,
      location: activityData.location || suggestions[dayIndex].activities[activityIndex].location,
      description: activityData.description || suggestions[dayIndex].activities[activityIndex].description,
      duration: activityData.duration || suggestions[dayIndex].activities[activityIndex].duration,
      price: activityData.price || suggestions[dayIndex].activities[activityIndex].price
    };
    
    newSuggestions[dayIndex].activities[activityIndex] = updatedActivity;
    setSuggestions(newSuggestions);
    setEditingActivity(null);
    success('Activity Updated', 'Activity has been updated');
  };

  // Toggle suggestion selection
  const toggleSuggestion = (dayIndex: number) => {
    const key = `day-${dayIndex}`;
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedSuggestions(newSelected);
  };

  // Add selected suggestions
  const handleAddSelected = () => {
    const selected = suggestions.filter((_, index) => selectedSuggestions.has(`day-${index}`));
    if (selected.length === 0) {
      showError('No Selection', 'Please select at least one day of suggestions to add');
      return;
    }
    onAddSuggestions(selected);
    success('Suggestions Added', `${selected.length} day(s) of suggestions have been added to your itinerary`);
    onClose();
  };

  // Add all suggestions
  const handleAddAll = () => {
    onAddSuggestions(suggestions);
    success('All Suggestions Added', 'All AI suggestions have been added to your itinerary');
    onClose();
  };

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && !generated) {
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      setEditingActivity(null);
      generateSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">AI Itinerary Suggestions</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{trip.destination}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoading && !generated ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">AI is generating personalized suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No suggestions available</p>
                <button
                  onClick={generateSuggestions}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Generate Suggestions
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      selectedSuggestions.has(`day-${dayIndex}`)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(`day-${dayIndex}`)}
                          onChange={() => toggleSuggestion(dayIndex)}
                          className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Day {suggestion.day} - {suggestion.date}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 ml-7">
                      {suggestion.activities.map((activity, activityIndex) => (
                        <div
                          key={activityIndex}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex-shrink-0 w-16 text-right">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{activity.time}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white">{activity.activity}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.location}</span>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {activity.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.duration}</span>
                                </div>
                              )}
                              {activity.price && (
                                <span>{activity.price}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditActivity(dayIndex, activityIndex)}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded opacity-0 group-hover:opacity-100"
                            title="Edit Activity"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddSelected}
                disabled={selectedSuggestions.size === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add Selected ({selectedSuggestions.size})
              </button>
              <button
                onClick={handleAddAll}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Add All Suggestions
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity !== null && suggestions[editingActivity.dayIndex] && (
        <ActivityModal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          activity={{
            id: '',
            name: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].activity,
            location: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].location,
            start_time: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].time,
            description: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].description || '',
            type: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].type || 'activity',
            date: suggestions[editingActivity.dayIndex].date,
            price: suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].price ? 
              parseFloat(suggestions[editingActivity.dayIndex].activities[editingActivity.activityIndex].price.replace(/[^0-9.]/g, '')) : undefined
          }}
          onSave={handleSaveEdit}
        />
      )}
    </AnimatePresence>
  );
};

export default AIItinerarySuggestionsModal;

