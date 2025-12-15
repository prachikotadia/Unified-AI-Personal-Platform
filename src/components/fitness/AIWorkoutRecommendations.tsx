import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Clock, Flame, TrendingUp, Plus } from 'lucide-react';

interface WorkoutRecommendation {
  id: string;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories: number;
  matchScore: number;
  reasoning: string;
  exercises: string[];
}

interface AIWorkoutRecommendationsProps {
  userProfile?: {
    fitnessLevel?: string;
    goals?: string[];
    preferences?: string[];
    recentWorkouts?: any[];
  };
  onSelectWorkout?: (workout: WorkoutRecommendation) => void;
}

const AIWorkoutRecommendations: React.FC<AIWorkoutRecommendationsProps> = ({
  userProfile,
  onSelectWorkout
}) => {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered workout recommendations
    const mockRecommendations: WorkoutRecommendation[] = [
      {
        id: '1',
        name: 'Full Body Strength',
        type: 'strength',
        duration: 45,
        intensity: 'moderate',
        calories: 350,
        matchScore: 0.95,
        reasoning: 'Perfect for your fitness level. Targets all major muscle groups and aligns with your strength training goals.',
        exercises: ['Squats', 'Push-ups', 'Deadlifts', 'Pull-ups', 'Plank']
      },
      {
        id: '2',
        name: 'HIIT Cardio Blast',
        type: 'hiit',
        duration: 30,
        intensity: 'high',
        calories: 400,
        matchScore: 0.88,
        reasoning: 'Great for fat burning and improving cardiovascular fitness. Based on your recent workout patterns.',
        exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees', 'Plank Jacks']
      },
      {
        id: '3',
        name: 'Yoga Flow',
        type: 'yoga',
        duration: 60,
        intensity: 'low',
        calories: 200,
        matchScore: 0.82,
        reasoning: 'Excellent for recovery and flexibility. Complements your strength training routine.',
        exercises: ['Sun Salutation', 'Warrior Poses', 'Tree Pose', 'Child\'s Pose', 'Savasana']
      },
      {
        id: '4',
        name: 'Upper Body Focus',
        type: 'strength',
        duration: 40,
        intensity: 'moderate',
        calories: 300,
        matchScore: 0.90,
        reasoning: 'Targets upper body muscles. Recommended based on your workout history and goals.',
        exercises: ['Bench Press', 'Rows', 'Shoulder Press', 'Bicep Curls', 'Tricep Dips']
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
          <p className="text-gray-600 dark:text-gray-400">AI is generating personalized workout recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Workout Recommendations</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{workout.name}</h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                    {workout.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${workout.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(workout.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                <span>{workout.duration} min</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Flame size={14} className="text-orange-500" />
                <span>{workout.calories} cal</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Target size={14} />
                <span className="capitalize">{workout.intensity}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {workout.reasoning}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Exercises:</p>
              <div className="flex flex-wrap gap-1">
                {workout.exercises.map((exercise, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                  >
                    {exercise}
                  </span>
                ))}
              </div>
            </div>

            {onSelectWorkout && (
              <button
                onClick={() => onSelectWorkout(workout)}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add to Workouts
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIWorkoutRecommendations;

