import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Dumbbell, 
  Target, 
  Clock, 
  Heart,
  Play,
  BookOpen,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Brain,
  Sparkles
} from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';
import ExerciseModal from '../../components/fitness/ExerciseModal';
import AIExerciseSuggestions from '../../components/fitness/AIExerciseSuggestions';
import { useExerciseStore } from '../../store/exercises';

const ExerciseLibraryPage = () => {
  const { success } = useToastHelpers();
  const {
    exercises,
    favorites,
    toggleFavorite,
    addToRecent,
    getExercise,
  } = useExerciseStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');

  const categories = ['all', 'strength', 'cardio', 'core', 'flexibility', 'balance'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const equipment = ['all', 'bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'kettlebell'];

  const muscleGroups = ['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full body'];

  const handleAddToWorkout = (exercise: any) => {
    success('Exercise Added', `${exercise.name} has been added to your workout`);
  };

  const handleToggleFavorite = (exerciseId: string) => {
    toggleFavorite(exerciseId);
    const exercise = getExercise(exerciseId);
    if (exercise) {
      success(
        favorites.has(exerciseId) ? 'Removed from Favorites' : 'Added to Favorites',
        `${exercise.name} ${favorites.has(exerciseId) ? 'removed from' : 'added to'} favorites`
      );
    }
  };

  const handleViewDetails = (exercise: any) => {
    addToRecent(exercise.id);
    setShowExerciseModal(true);
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesEquipment = selectedEquipment === 'all' || exercise.equipment.includes(selectedEquipment);
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscle_groups.includes(selectedMuscleGroup);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesEquipment && matchesMuscleGroup;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'from-indigo-500 to-indigo-600';
      case 'cardio': return 'from-red-500 to-red-600';
      case 'core': return 'from-emerald-500 to-emerald-600';
      case 'flexibility': return 'from-violet-500 to-violet-600';
      case 'balance': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse our comprehensive database of exercises
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIRecommendations(true)}
              className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Brain className="w-4 h-4" />
              <span>AI Recommendations</span>
            </button>
            <button
              onClick={() => setShowExerciseModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises by name or muscle group..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              {muscleGroups.map(group => (
                <option key={group} value={group}>
                  {group === 'all' ? 'All Muscle Groups' : group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              {equipment.map(equip => (
                <option key={equip} value={equip}>
                  {equip.charAt(0).toUpperCase() + equip.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-300 hover:shadow-lg"
          >
            {/* Exercise Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(exercise.category)} rounded-lg flex items-center justify-center`}>
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleFavorite(exercise.id)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                  favorites.has(exercise.id) ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${favorites.has(exercise.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Exercise Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>{exercise.muscle_groups.join(', ')}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>{exercise.calories_per_minute} cal/min</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>{exercise.rating.toFixed(1)} ({exercise.favorites} favorites)</span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Equipment: {exercise.equipment.join(', ')}
              </div>
            </div>

            {/* Exercise Instructions */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {exercise.instructions}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(exercise)}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-1 font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => handleAddToWorkout(exercise)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Add to Workout"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Exercises Found</h3>
            <p className="text-sm">Try adjusting your search criteria or filters.</p>
          </div>
        </motion.div>
      )}

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelect={(exercise) => {
          console.log('Selected exercise:', exercise);
          setShowExerciseModal(false);
        }}
      />

      {/* AI Exercise Suggestions Modal */}
      {showAIRecommendations && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">AI Exercise Recommendations</h2>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <AIExerciseSuggestions
              userProfile={{
                fitnessLevel: 'intermediate',
                goals: ['strength', 'muscle_gain'],
                preferences: ['strength_training', 'cardio']
              }}
              onAddExercise={(exercise) => {
                console.log('Exercise added:', exercise);
                success('Exercise Added', `${exercise.name} has been added to your workout`);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibraryPage;
