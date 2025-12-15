import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, UtensilsCrossed, MapPin, DollarSign, Star, Clock, Plus } from 'lucide-react';

interface RestaurantRecommendation {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  description: string;
  bestFor: string;
  matchScore: number;
  reasoning: string;
  openingHours: string;
}

interface AIRestaurantRecommendationsProps {
  destination: string;
  preferences?: {
    cuisine?: string[];
    priceRange?: string;
    dietaryRestrictions?: string[];
  };
  onSelectRestaurant?: (restaurant: RestaurantRecommendation) => void;
}

const AIRestaurantRecommendations: React.FC<AIRestaurantRecommendationsProps> = ({
  destination,
  preferences,
  onSelectRestaurant
}) => {
  const [recommendations, setRecommendations] = useState<RestaurantRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [destination, preferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered restaurant recommendations
    const mockRecommendations: RestaurantRecommendation[] = [
      {
        id: '1',
        name: 'Sukiyabashi Jiro',
        cuisine: 'Sushi',
        location: 'Ginza, Tokyo',
        rating: 4.9,
        priceRange: '$$$$',
        description: 'World-famous sushi restaurant with Michelin stars. Traditional omakase experience.',
        bestFor: 'Special occasions, authentic sushi',
        matchScore: 0.95,
        reasoning: 'Perfect for authentic Japanese cuisine lovers. Requires advance reservation. Premium experience.',
        openingHours: '5:00 PM - 10:00 PM'
      },
      {
        id: '2',
        name: 'Ichiran Ramen',
        cuisine: 'Ramen',
        location: 'Shibuya, Tokyo',
        rating: 4.7,
        priceRange: '$',
        description: 'Famous tonkotsu ramen chain with individual booths for focused dining experience.',
        bestFor: 'Quick meal, authentic ramen',
        matchScore: 0.92,
        reasoning: 'Great value for money. Authentic ramen experience. Popular with locals and tourists.',
        openingHours: '24 hours'
      },
      {
        id: '3',
        name: 'Tsukiji Outer Market Food Stalls',
        cuisine: 'Street Food',
        location: 'Tsukiji, Tokyo',
        rating: 4.8,
        priceRange: '$',
        description: 'Fresh seafood, sushi, and traditional Japanese street food in the famous market.',
        bestFor: 'Breakfast, fresh seafood, budget-friendly',
        matchScore: 0.88,
        reasoning: 'Authentic local experience. Best visited early morning. Great for food exploration.',
        openingHours: '5:00 AM - 2:00 PM'
      },
      {
        id: '4',
        name: 'Robot Restaurant',
        cuisine: 'Entertainment Dining',
        location: 'Shinjuku, Tokyo',
        rating: 4.3,
        priceRange: '$$$',
        description: 'Unique dining experience with robot shows and entertainment.',
        bestFor: 'Entertainment, unique experience',
        matchScore: 0.75,
        reasoning: 'Fun and unique experience. More about entertainment than food. Great for families.',
        openingHours: '4:00 PM - 11:00 PM'
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case '$':
        return 'text-green-600';
      case '$$':
        return 'text-yellow-600';
      case '$$$':
        return 'text-orange-600';
      default:
        return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is finding perfect restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Restaurant Recommendations</h3>
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
        {recommendations.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className="text-orange-600" size={18} />
                  <h4 className="font-semibold">{restaurant.name}</h4>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${restaurant.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(restaurant.matchScore * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{restaurant.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MapPin size={14} />
                <span className="text-xs">{restaurant.location}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <DollarSign size={14} className={getPriceRangeColor(restaurant.priceRange)} />
                <span className="text-xs">{restaurant.priceRange}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-xs">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                <span className="text-xs">{restaurant.openingHours}</span>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-orange-800 dark:text-orange-200 mb-1">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {restaurant.reasoning}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>Best For:</strong> {restaurant.bestFor}
              </p>
            </div>

            {onSelectRestaurant && (
              <button
                onClick={() => onSelectRestaurant(restaurant)}
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

export default AIRestaurantRecommendations;

