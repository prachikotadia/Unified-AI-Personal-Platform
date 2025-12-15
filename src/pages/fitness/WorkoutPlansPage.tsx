import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  CheckCircle,
  TrendingUp,
  Share2,
  Download,
  Brain,
  Sparkles
} from 'lucide-react';
import { useFitness } from '../../hooks/useFitness';
import { useToastHelpers } from '../../components/ui/Toast';
import ExerciseModal from '../../components/fitness/ExerciseModal';
import WorkoutPlanModal from '../../components/fitness/WorkoutPlanModal';

const WorkoutPlansPage = () => {
  const { success, error: showError } = useToastHelpers();
  const { workoutPlans, isLoading, error } = useFitness();
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWorkoutPlanModal, setShowWorkoutPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [activePlans, setActivePlans] = useState<Set<string>>(new Set(['1', '2']));

  // Mock workout plans data
  const mockPlans = [
    {
      id: '1',
      name: 'Beginner Strength Program',
      description: 'A 4-week program for building foundational strength',
      type: 'strength',
      duration: 45,
      intensity: 'moderate',
      is_active: true,
      schedule: {
        monday: ['Push-ups', 'Squats', 'Plank'],
        wednesday: ['Pull-ups', 'Lunges', 'Burpees'],
        friday: ['Deadlift', 'Bench Press', 'Core Work']
      },
      progress: 75,
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Cardio Blast',
      description: 'High-intensity cardio workouts for fat burning',
      type: 'cardio',
      duration: 30,
      intensity: 'high',
      is_active: true,
      schedule: {
        tuesday: ['Running', 'Burpees', 'Jump Rope'],
        thursday: ['Cycling', 'Mountain Climbers', 'High Knees'],
        saturday: ['Swimming', 'Sprint Intervals', 'Box Jumps']
      },
      progress: 60,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-10T08:00:00Z'
    },
    {
      id: '3',
      name: 'Flexibility & Recovery',
      description: 'Gentle stretching and mobility work',
      type: 'flexibility',
      duration: 20,
      intensity: 'low',
      is_active: false,
      schedule: {
        sunday: ['Yoga', 'Stretching', 'Meditation']
      },
      progress: 90,
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-05T08:00:00Z'
    }
  ];

  const plans = workoutPlans.length > 0 ? workoutPlans : mockPlans;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'from-blue-gradient-from to-blue-gradient-to';
      case 'cardio': return 'from-red-gradient-from to-red-gradient-to';
      case 'flexibility': return 'from-green-gradient-from to-green-gradient-to';
      default: return 'from-purple-gradient-from to-purple-gradient-to';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowWorkoutPlanModal(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowWorkoutPlanModal(true);
  };

  const handleExerciseSelect = (exercise: any) => {
    // Handle exercise selection for workout plan
    console.log('Selected exercise:', exercise);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      success('Plan Deleted', 'Workout plan has been removed');
    }
  };

  const handleStartPlan = (planId: string) => {
    setActivePlans(prev => new Set([...prev, planId]));
    success('Plan Started', 'Workout plan is now active');
  };

  const handlePausePlan = (planId: string) => {
    setActivePlans(prev => {
      const newSet = new Set(prev);
      newSet.delete(planId);
      return newSet;
    });
    success('Plan Paused', 'Workout plan has been paused');
  };

  const handleSharePlan = (plan: any) => {
    success('Plan Shared', 'Workout plan link copied to clipboard');
  };

  const handleImportPlan = () => {
    success('Import Started', 'Select a file to import workout plan');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Workout Plans</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workout Plans</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your personalized workout routines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIPlanner(true)}
              className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Brain className="w-4 h-4" />
              <span>AI Generate Plan</span>
            </button>
            <button
              onClick={handleImportPlan}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4 rotate-180" />
              <span>Import Plan</span>
            </button>
            <button 
              onClick={handleCreatePlan}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(plan.type)} rounded-lg flex items-center justify-center`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(plan.intensity)}`}>
                    {plan.intensity}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSharePlan(plan)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{plan.duration} minutes</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{Object.keys(plan.schedule).length} days/week</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span>{plan.progress}% complete</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(plan.type)}`}
                style={{ width: `${plan.progress}%` }}
              />
            </div>

            {/* Schedule Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">This Week's Schedule:</h4>
              <div className="space-y-1">
                {Object.entries(plan.schedule).slice(0, 3).map(([day, exercises]) => (
                  <div key={day} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-gray-400">{day}</span>
                    <span className="text-gray-300">{(exercises as string[]).length} exercises</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              {activePlans.has(plan.id) ? (
                <button
                  onClick={() => handlePausePlan(plan.id)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-gradient-from to-yellow-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-1"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Plan</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStartPlan(plan.id)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-green-gradient-from to-green-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Plan</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Workout Plans Yet</h3>
            <p className="text-sm">Create your first workout plan to get started!</p>
          </div>
          <button 
            onClick={handleCreatePlan}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </button>
        </motion.div>
      )}

      {/* Workout Plan Modal */}
      <WorkoutPlanModal
        isOpen={showWorkoutPlanModal}
        onClose={() => {
          setShowWorkoutPlanModal(false);
          setSelectedPlan(null);
        }}
        onSubmit={(planData) => {
          console.log('Plan created/updated:', planData);
          setShowWorkoutPlanModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
      />

      {/* Exercise Modal */}
      <ExerciseModal 
        isOpen={showExerciseModal} 
        onClose={() => {
          setShowExerciseModal(false);
        }}
        onSelect={handleExerciseSelect}
        selectedExercises={selectedPlan?.exercises || []}
      />

      {/* AI Planner Modal Placeholder */}
      {showAIPlanner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">AI Workout Plan Generator</h2>
              </div>
              <button
                onClick={() => setShowAIPlanner(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is generating a personalized workout plan based on your goals and preferences...
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlansPage;
