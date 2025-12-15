import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MapPin, Clock, DollarSign, Star, Plus } from 'lucide-react';

interface ActivityRecommendation {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  price: number;
  duration: string;
  description: string;
  bestTime: string;
  matchScore: number;
  reasoning: string;
}

interface AIActivityRecommendationsProps {
  destination: string;
  tripDates?: {
    start: string;
    end: string;
  };
  interests?: string[];
  onSelectActivity?: (activity: ActivityRecommendation) => void;
}

const AIActivityRecommendations: React.FC<AIActivityRecommendationsProps> = ({
  destination,
  tripDates,
  interests,
  onSelectActivity
}) => {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [destination, interests]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered activity recommendations
    const mockRecommendations: ActivityRecommendation[] = [
      {
        id: '1',
        name: 'Senso-ji Temple Visit',
        type: 'Cultural',
        location: 'Asakusa, Tokyo',
        rating: 4.8,
        price: 0,
        duration: '2-3 hours',
        description: 'Tokyo\'s oldest temple with traditional architecture and vibrant Nakamise shopping street.',
        bestTime: 'Early morning (8-10 AM)',
        matchScore: 0.95,
        reasoning: 'Perfect for culture enthusiasts. Less crowded in the morning, better photo opportunities.'
      },
      {
        id: '2',
        name: 'Tokyo Skytree Observation Deck',
        type: 'Attraction',
        location: 'Sumida, Tokyo',
        rating: 4.6,
        price: 25,
        duration: '1-2 hours',
        description: 'Panoramic views of Tokyo from Japan\'s tallest tower.',
        bestTime: 'Sunset (5-7 PM)',
        matchScore: 0.88,
        reasoning: 'Best views during sunset. Book tickets in advance to avoid queues.'
      },
      {
        id: '3',
        name: 'Tsukiji Outer Market Food Tour',
        type: 'Food & Dining',
        location: 'Tsukiji, Tokyo',
        rating: 4.9,
        price: 80,
        duration: '3-4 hours',
        description: 'Guided tour of the famous fish market with fresh sushi and local delicacies.',
        bestTime: 'Early morning (6-9 AM)',
        matchScore: 0.92,
        reasoning: 'Authentic experience for food lovers. Early morning offers freshest seafood.'
      },
      {
        id: '4',
        name: 'Shibuya Crossing Experience',
        type: 'Sightseeing',
        location: 'Shibuya, Tokyo',
        rating: 4.5,
        price: 0,
        duration: '30-60 minutes',
        description: 'Experience the world\'s busiest pedestrian crossing.',
        bestTime: 'Evening (6-8 PM)',
        matchScore: 0.85,
        reasoning: 'Most impressive during rush hour. Free activity with great photo opportunities.'
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is finding perfect activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Activity Recommendations</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Destination:</strong> {destination}
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{activity.name}</h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                    {activity.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${activity.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(activity.matchScore * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MapPin size={14} />
                <span className="text-xs">{activity.location}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                <span className="text-xs">{activity.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <DollarSign size={14} />
                <span className="text-xs">
                  {activity.price === 0 ? 'Free' : `$${activity.price}`}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-xs">{activity.rating}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {activity.reasoning}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Best Time:</strong> {activity.bestTime}
              </p>
            </div>

            {onSelectActivity && (
              <button
                onClick={() => onSelectActivity(activity)}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add to Itinerary
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIActivityRecommendations;

