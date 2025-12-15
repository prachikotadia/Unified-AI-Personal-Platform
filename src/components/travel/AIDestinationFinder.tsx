import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MapPin, Star, DollarSign, Calendar, Search, Filter } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  priceRange: string;
  bestTimeToVisit: string;
  description: string;
  matchScore: number;
  reasoning: string;
}

interface AIDestinationFinderProps {
  preferences?: {
    budget?: string;
    travelStyle?: string;
    interests?: string[];
    duration?: string;
    season?: string;
  };
  onSelectDestination?: (destination: Destination) => void;
}

const AIDestinationFinder: React.FC<AIDestinationFinderProps> = ({
  preferences,
  onSelectDestination
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    findDestinations();
  }, [preferences]);

  const findDestinations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered destination matching
    const mockDestinations: Destination[] = [
      {
        id: '1',
        name: 'Bali, Indonesia',
        country: 'Indonesia',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop',
        rating: 4.8,
        priceRange: '$800 - $1500',
        bestTimeToVisit: 'April to October',
        description: 'Tropical paradise with stunning beaches, rich culture, and affordable luxury.',
        matchScore: 0.95,
        reasoning: 'Perfect match for beach lovers with mid-range budget. Great weather year-round with cultural experiences.'
      },
      {
        id: '2',
        name: 'Kyoto, Japan',
        country: 'Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        rating: 4.9,
        priceRange: '$2000 - $3500',
        bestTimeToVisit: 'March to May, September to November',
        description: 'Traditional temples, cherry blossoms, and authentic Japanese culture.',
        matchScore: 0.88,
        reasoning: 'Excellent for culture enthusiasts. Best visited during cherry blossom or autumn seasons.'
      },
      {
        id: '3',
        name: 'Santorini, Greece',
        country: 'Greece',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
        rating: 4.7,
        priceRange: '$1500 - $2500',
        bestTimeToVisit: 'May to September',
        description: 'Stunning sunsets, white-washed buildings, and Mediterranean cuisine.',
        matchScore: 0.82,
        reasoning: 'Ideal for romantic getaways. Peak season offers best weather but higher prices.'
      }
    ];

    setDestinations(mockDestinations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is finding perfect destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Destination Finder</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Destinations */}
      <div className="space-y-4">
        {destinations
          .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{destination.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{destination.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${destination.matchScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {Math.round(destination.matchScore * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-current" size={14} />
                        <span className="text-sm">{destination.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{destination.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      <span>{destination.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{destination.bestTimeToVisit}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <Sparkles className="inline w-3 h-3 mr-1" />
                      <strong>AI Insight:</strong> {destination.reasoning}
                    </p>
                  </div>

                  {onSelectDestination && (
                    <button
                      onClick={() => onSelectDestination(destination)}
                      className="w-full btn-primary text-sm"
                    >
                      Select Destination
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default AIDestinationFinder;

