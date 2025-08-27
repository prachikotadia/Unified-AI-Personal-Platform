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
  TrendingUp
} from 'lucide-react';

const ExerciseLibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');

  // Mock exercise database
  const exercises = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'strength',
      muscle_groups: ['chest', 'triceps', 'shoulders'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Start in a plank position, lower your body until your chest nearly touches the floor, then push back up.',
      video_url: 'https://example.com/pushups',
      image_url: '/exercises/pushups.jpg',
      rating: 4.8,
      favorites: 1250,
      calories_per_minute: 8
    },
    {
      id: '2',
      name: 'Squats',
      category: 'strength',
      muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing.',
      video_url: 'https://example.com/squats',
      image_url: '/exercises/squats.jpg',
      rating: 4.9,
      favorites: 2100,
      calories_per_minute: 10
    },
    {
      id: '3',
      name: 'Deadlift',
      category: 'strength',
      muscle_groups: ['back', 'glutes', 'hamstrings'],
      equipment: ['barbell', 'dumbbells'],
      difficulty: 'intermediate',
      instructions: 'Stand with feet hip-width apart, bend at hips and knees to lower hands to bar, then stand up while keeping bar close to body.',
      video_url: 'https://example.com/deadlift',
      image_url: '/exercises/deadlift.jpg',
      rating: 4.7,
      favorites: 890,
      calories_per_minute: 12
    },
    {
      id: '4',
      name: 'Bench Press',
      category: 'strength',
      muscle_groups: ['chest', 'triceps', 'shoulders'],
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      instructions: 'Lie on bench, lower bar to chest, then press back up to starting position.',
      video_url: 'https://example.com/benchpress',
      image_url: '/exercises/benchpress.jpg',
      rating: 4.6,
      favorites: 750,
      calories_per_minute: 11
    },
    {
      id: '5',
      name: 'Pull-ups',
      category: 'strength',
      muscle_groups: ['back', 'biceps'],
      equipment: ['pull-up bar'],
      difficulty: 'advanced',
      instructions: 'Hang from pull-up bar, pull your body up until chin is over bar, then lower back down.',
      video_url: 'https://example.com/pullups',
      image_url: '/exercises/pullups.jpg',
      rating: 4.5,
      favorites: 680,
      calories_per_minute: 9
    },
    {
      id: '6',
      name: 'Plank',
      category: 'core',
      muscle_groups: ['core', 'shoulders'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Hold a plank position with body in a straight line from head to heels.',
      video_url: 'https://example.com/plank',
      image_url: '/exercises/plank.jpg',
      rating: 4.8,
      favorites: 1500,
      calories_per_minute: 4
    },
    {
      id: '7',
      name: 'Burpees',
      category: 'cardio',
      muscle_groups: ['full body'],
      equipment: ['bodyweight'],
      difficulty: 'intermediate',
      instructions: 'Combine a squat, push-up, and jump in one fluid movement.',
      video_url: 'https://example.com/burpees',
      image_url: '/exercises/burpees.jpg',
      rating: 4.4,
      favorites: 920,
      calories_per_minute: 15
    },
    {
      id: '8',
      name: 'Lunges',
      category: 'strength',
      muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      instructions: 'Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.',
      video_url: 'https://example.com/lunges',
      image_url: '/exercises/lunges.jpg',
      rating: 4.7,
      favorites: 1100,
      calories_per_minute: 8
    }
  ];

  const categories = ['all', 'strength', 'cardio', 'core', 'flexibility', 'balance'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const equipment = ['all', 'bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'kettlebell'];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesEquipment = selectedEquipment === 'all' || exercise.equipment.includes(selectedEquipment);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesEquipment;
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
      case 'strength': return 'from-blue-gradient-from to-blue-gradient-to';
      case 'cardio': return 'from-red-gradient-from to-red-gradient-to';
      case 'core': return 'from-green-gradient-from to-green-gradient-to';
      case 'flexibility': return 'from-purple-gradient-from to-purple-gradient-to';
      default: return 'from-gray-gradient-from to-gray-gradient-to';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse our comprehensive database of exercises
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-400">{exercises.length} exercises</span>
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
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="glass-card p-6 hover:scale-105 transition-transform duration-300"
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
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Exercise Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-gray-400" />
                <span>{exercise.muscle_groups.join(', ')}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span>{exercise.calories_per_minute} cal/min</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{exercise.rating} ({exercise.favorites} favorites)</span>
              </div>

              <div className="text-xs text-gray-500">
                Equipment: {exercise.equipment.join(', ')}
              </div>
            </div>

            {/* Exercise Instructions */}
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">
              {exercise.instructions}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-1">
                <Play className="w-4 h-4" />
                <span>Watch</span>
              </button>
              <button className="px-3 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Exercises Found</h3>
            <p className="text-sm">Try adjusting your search criteria or filters.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseLibraryPage;
