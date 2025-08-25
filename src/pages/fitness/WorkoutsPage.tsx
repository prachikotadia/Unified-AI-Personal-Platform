import { motion } from 'framer-motion'
import { Plus, Clock, Flame, Target } from 'lucide-react'

const WorkoutsPage = () => {
  // Mock workout data
  const workouts = [
    { id: 1, type: 'Running', duration: 45, calories: 320, date: '2024-01-15', distance: '5.2km' },
    { id: 2, type: 'Strength Training', duration: 60, calories: 280, date: '2024-01-14', sets: 4 },
    { id: 3, type: 'Yoga', duration: 30, calories: 120, date: '2024-01-13', style: 'Vinyasa' },
    { id: 4, type: 'Cycling', duration: 90, calories: 450, date: '2024-01-12', distance: '25km' },
  ]

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
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {workouts.map((workout, index) => (
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
                  <h3 className="text-lg font-semibold">{workout.type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(workout.date).toLocaleDateString()}
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
                    {workout.distance || `${workout.sets} sets` || workout.style}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default WorkoutsPage
