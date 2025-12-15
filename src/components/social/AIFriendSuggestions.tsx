import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, UserPlus, Users, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface FriendSuggestion {
  id: string;
  name: string;
  avatar: string;
  mutualFriends: number;
  mutualInterests: string[];
  location?: string;
  occupation?: string;
  education?: string;
  matchScore: number;
  reasoning: string;
}

interface AIFriendSuggestionsProps {
  currentUserId: string;
  onSendRequest: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

const AIFriendSuggestions: React.FC<AIFriendSuggestionsProps> = ({
  currentUserId,
  onSendRequest,
  onViewProfile
}) => {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered friend suggestions
    const mockSuggestions: FriendSuggestion[] = [
      {
        id: 'user2',
        name: 'Sarah M.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 5,
        mutualInterests: ['Fitness', 'Travel', 'Finance'],
        location: 'New York, NY',
        occupation: 'Software Engineer',
        education: 'MIT',
        matchScore: 0.92,
        reasoning: 'High compatibility based on mutual friends, shared interests in fitness and travel, and similar professional background.'
      },
      {
        id: 'user3',
        name: 'Mike R.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 3,
        mutualInterests: ['Finance', 'Technology'],
        location: 'San Francisco, CA',
        occupation: 'Product Manager',
        matchScore: 0.85,
        reasoning: 'Strong professional network overlap and shared interest in financial planning and technology.'
      },
      {
        id: 'user4',
        name: 'Emma L.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        mutualFriends: 7,
        mutualInterests: ['Fitness', 'Wellness', 'Travel'],
        location: 'Los Angeles, CA',
        occupation: 'Fitness Trainer',
        matchScore: 0.88,
        reasoning: 'Excellent match with many mutual friends and strong alignment in fitness and wellness interests.'
      }
    ];

    setSuggestions(mockSuggestions);
    setLoading(false);
  };

  const handleSendRequest = (userId: string) => {
    setSentRequests(prev => new Set([...prev, userId]));
    onSendRequest(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">AI is finding friend suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={20} />
        <h3 className="font-semibold">AI Friend Suggestions</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start gap-4">
              <img
                src={suggestion.avatar}
                alt={suggestion.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{suggestion.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {suggestion.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{suggestion.location}</span>
                        </div>
                      )}
                      {suggestion.occupation && (
                        <div className="flex items-center gap-1">
                          <Briefcase size={12} />
                          <span>{suggestion.occupation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${suggestion.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(suggestion.matchScore * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Users size={14} />
                    <span>{suggestion.mutualFriends} mutual friend{suggestion.mutualFriends !== 1 ? 's' : ''}</span>
                  </div>
                  {suggestion.mutualInterests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestion.mutualInterests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <Sparkles className="inline w-3 h-3 mr-1" />
                    <strong>AI Insight:</strong> {suggestion.reasoning}
                  </p>
                </div>

                <div className="flex gap-2">
                  {sentRequests.has(suggestion.id) ? (
                    <div className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm text-center">
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(suggestion.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      Add Friend
                    </button>
                  )}
                  {onViewProfile && (
                    <button
                      onClick={() => onViewProfile(suggestion.id)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIFriendSuggestions;

