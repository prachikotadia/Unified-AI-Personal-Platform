import { motion } from 'framer-motion'
import { Plus, Clock, Flame, Target } from 'lucide-react'
import { useWorkoutSessions } from '../../hooks/useFitness'
import { useState } from 'react'
import WorkoutModal from '../../components/fitness/WorkoutModal'

const WorkoutsPage = () => {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const { workoutSessions, isLoading, error } = useWorkoutSessions()

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex space-x-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Workouts</div>
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
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workouts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Log and track your fitness activities
            </p>
          </div>
          <button 
            onClick={() => setShowWorkoutModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {workoutSessions.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
              <p className="text-sm">Start your fitness journey by logging your first workout!</p>
            </div>
            <button 
              onClick={() => setShowWorkoutModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </button>
          </div>
        ) : (
          workoutSessions.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{workout.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(workout.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{workout.duration} min</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{workout.calories} cal</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {workout.type}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))
        )}
      </div>

      {/* Workout Modal */}
      <WorkoutModal 
        isOpen={showWorkoutModal} 
        onClose={() => setShowWorkoutModal(false)} 
      />
    </div>
  )
}

export default WorkoutsPage
