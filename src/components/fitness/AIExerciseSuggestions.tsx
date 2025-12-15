import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Dumbbell, Target, Clock, Plus, TrendingUp } from 'lucide-react';

interface ExerciseSuggestion {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sets: number;
  reps: string;
  restTime: number;
  matchScore: number;
  reasoning: string;
  benefits: string[];
  instructions: string[];
}

interface AIExerciseSuggestionsProps {
  currentWorkout?: {
    type?: string;
    goal?: string;
    duration?: number;
    exercises?: any[];
  };
  userProfile?: {
    fitnessLevel?: string;
    goals?: string[];
    preferences?: string[];
    recentWorkouts?: any[];
  };
  onAddExercise?: (exercise: ExerciseSuggestion) => void;
}

const AIExerciseSuggestions: React.FC<AIExerciseSuggestionsProps> = ({
  currentWorkout,
  userProfile,
  onAddExercise
}) => {
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    muscleGroup: 'all',
    equipment: 'all',
    difficulty: 'all'
  });

  useEffect(() => {
    generateSuggestions();
  }, [currentWorkout, userProfile, filters]);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered exercise suggestions
    const mockSuggestions: ExerciseSuggestion[] = [
      {
        id: '1',
        name: 'Barbell Squats',
        muscleGroup: 'legs',
        equipment: 'barbell',
        difficulty: 'intermediate',
        sets: 4,
        reps: '8-12',
        restTime: 90,
        matchScore: 0.95,
        reasoning: 'Perfect for building lower body strength. Aligns with your strength training goals and current fitness level.',
        benefits: ['Builds leg strength', 'Improves core stability', 'Burns calories', 'Functional movement'],
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold barbell on upper back',
          'Lower down by bending knees and hips',
          'Keep chest up and core engaged',
          'Push through heels to return to start'
        ]
      },
      {
        id: '2',
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        sets: 3,
        reps: '10-15',
        restTime: 60,
        matchScore: 0.92,
        reasoning: 'Excellent upper body exercise. No equipment needed and can be modified for any fitness level.',
        benefits: ['Builds chest and triceps', 'Improves core strength', 'No equipment needed', 'Can be done anywhere'],
        instructions: [
          'Start in plank position',
          'Hands slightly wider than shoulders',
          'Lower body until chest nearly touches floor',
          'Push back up to starting position',
          'Keep body in straight line'
        ]
      },
      {
        id: '3',
        name: 'Deadlifts',
        muscleGroup: 'back',
        equipment: 'barbell',
        difficulty: 'advanced',
        sets: 3,
        reps: '5-8',
        restTime: 120,
        matchScore: 0.88,
        reasoning: 'Great compound movement for overall strength. Consider your current form and experience level.',
        benefits: ['Full body exercise', 'Builds posterior chain', 'Improves posture', 'Functional strength'],
        instructions: [
          'Stand with feet hip-width apart',
          'Bend at hips and knees to grab bar',
          'Keep back straight and core tight',
          'Drive through heels to stand up',
          'Lower bar with control'
        ]
      },
      {
        id: '4',
        name: 'Pull-ups',
        muscleGroup: 'back',
        equipment: 'pull-up bar',
        difficulty: 'intermediate',
        sets: 3,
        reps: '6-10',
        restTime: 90,
        matchScore: 0.90,
        reasoning: 'Excellent for building upper body pulling strength. Complements your push exercises.',
        benefits: ['Builds back and biceps', 'Improves grip strength', 'Core engagement', 'Bodyweight exercise'],
        instructions: [
          'Hang from bar with overhand grip',
          'Pull body up until chin over bar',
          'Lower with control',
          'Keep core engaged throughout',
          'Full range of motion'
        ]
      },
      {
        id: '5',
        name: 'Plank',
        muscleGroup: 'core',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        sets: 3,
        reps: '30-60 seconds',
        restTime: 60,
        matchScore: 0.85,
        reasoning: 'Great core strengthening exercise. Perfect for improving stability and posture.',
        benefits: ['Strengthens core', 'Improves posture', 'No equipment needed', 'Low impact'],
        instructions: [
          'Start in push-up position',
          'Support weight on forearms and toes',
          'Keep body in straight line',
          'Engage core and glutes',
          'Hold position'
        ]
      }
    ];

    // Filter suggestions based on filters
    let filtered = mockSuggestions;
    if (filters.muscleGroup !== 'all') {
      filtered = filtered.filter(s => s.muscleGroup === filters.muscleGroup);
    }
    if (filters.equipment !== 'all') {
      filtered = filtered.filter(s => s.equipment === filters.equipment);
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(s => s.difficulty === filters.difficulty);
    }

    setSuggestions(filtered);
    setLoading(false);
  };

  const muscleGroups = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core'];
  const equipmentTypes = ['all', 'bodyweight', 'dumbbells', 'barbell', 'cable', 'machine', 'pull-up bar'];
  const difficultyLevels = ['all', 'beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is generating personalized exercise suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Exercise Suggestions</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Muscle Group
          </label>
          <select
            value={filters.muscleGroup}
            onChange={(e) => setFilters(prev => ({ ...prev, muscleGroup: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group.charAt(0).toUpperCase() + group.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Equipment
          </label>
          <select
            value={filters.equipment}
            onChange={(e) => setFilters(prev => ({ ...prev, equipment: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {difficultyLevels.map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="text-blue-600" size={18} />
                  <h4 className="font-semibold">{exercise.name}</h4>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize">
                    {exercise.muscleGroup}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize">
                    {exercise.difficulty}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${exercise.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(exercise.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Target size={14} />
                <span>{exercise.sets} sets × {exercise.reps}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                <span>{exercise.restTime}s rest</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 capitalize">
                {exercise.equipment}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {exercise.reasoning}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits:</p>
              <div className="flex flex-wrap gap-1">
                {exercise.benefits.map((benefit, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <details className="mb-3">
              <summary className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600">
                View Instructions
              </summary>
              <ol className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400 pl-4">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="list-decimal">{instruction}</li>
                ))}
              </ol>
            </details>

            {onAddExercise && (
              <button
                onClick={() => onAddExercise(exercise)}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add to Workout
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIExerciseSuggestions;

