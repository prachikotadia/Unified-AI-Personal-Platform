import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Dumbbell, Target, Clock } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  video_url?: string;
  image_url?: string;
}

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose, onSelect, selectedExercises = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Mock exercise database
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'strength',
      muscle_groups: ['chest', 'triceps', 'shoulders'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Start in a plank position, lower your body until your chest nearly touches the floor, then push back up.'
    },
    {
      id: '2',
      name: 'Squats',
      category: 'strength',
      muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing.'
    },
    {
      id: '3',
      name: 'Deadlift',
      category: 'strength',
      muscle_groups: ['back', 'glutes', 'hamstrings'],
      equipment: ['barbell', 'dumbbells'],
      difficulty: 'intermediate',
      instructions: 'Stand with feet hip-width apart, bend at hips and knees to lower hands to bar, then stand up while keeping bar close to body.'
    },
    {
      id: '4',
      name: 'Bench Press',
      category: 'strength',
      muscle_groups: ['chest', 'triceps', 'shoulders'],
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      instructions: 'Lie on bench, lower bar to chest, then press back up to starting position.'
    },
    {
      id: '5',
      name: 'Pull-ups',
      category: 'strength',
      muscle_groups: ['back', 'biceps'],
      equipment: ['pull-up bar'],
      difficulty: 'advanced',
      instructions: 'Hang from pull-up bar, pull your body up until chin is over bar, then lower back down.'
    },
    {
      id: '6',
      name: 'Plank',
      category: 'core',
      muscle_groups: ['core', 'shoulders'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Hold a plank position with body in a straight line from head to heels.'
    },
    {
      id: '7',
      name: 'Burpees',
      category: 'cardio',
      muscle_groups: ['full body'],
      equipment: ['bodyweight'],
      difficulty: 'intermediate',
      instructions: 'Combine a squat, push-up, and jump in one fluid movement.'
    },
    {
      id: '8',
      name: 'Lunges',
      category: 'strength',
      muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.'
    }
  ];

  const categories = ['all', 'strength', 'cardio', 'core', 'flexibility'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onSelect(exercise);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Exercise Library</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all hover:scale-105 ${
                    isExerciseSelected(exercise) ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
                  }`}
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">{exercise.name}</h3>
                    </div>
                    {isExerciseSelected(exercise) && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>{exercise.muscle_groups.join(', ')}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded text-xs ${
                        exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Equipment: {exercise.equipment.join(', ')}
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2">
                      {exercise.instructions}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No exercises found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Selected Exercises Summary */}
            {selectedExercises.length > 0 && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h3 className="font-medium mb-2">Selected Exercises ({selectedExercises.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercises.map((exercise) => (
                    <span
                      key={exercise.id}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                    >
                      {exercise.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseModal;
