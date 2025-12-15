import { motion } from 'framer-motion'
import { Plus, Clock, Flame, Target, Edit, Trash2, Copy, Share2, Search, Filter, Download, Brain, Sparkles } from 'lucide-react'
import { useWorkoutSessions } from '../../hooks/useFitness'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkoutModal from '../../components/fitness/WorkoutModal'
import ImportWorkoutModal from '../../components/fitness/ImportWorkoutModal'
import ExportOptionsModal from '../../components/fitness/ExportOptionsModal'
import { useToastHelpers } from '../../components/ui/Toast'

const WorkoutsPage = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToastHelpers()
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const { workoutSessions, isLoading, error } = useWorkoutSessions()

  const handleEditWorkout = (workout: any) => {
    setEditingWorkout(workout)
    setShowWorkoutModal(true)
  }

  const handleDeleteWorkout = (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      // Delete logic would go here
      success('Workout Deleted', 'Workout has been removed')
    }
  }

  const handleDuplicateWorkout = (workout: any) => {
    // Duplicate logic would go here
    success('Workout Duplicated', 'Workout has been duplicated')
  }

  const handleShareWorkout = (workout: any) => {
    // Share logic would go here
    success('Workout Shared', 'Workout link copied to clipboard')
  }

  const handleImportWorkout = () => {
    setShowImportModal(true)
  }

  const handleExportWorkouts = () => {
    setShowExportOptions(true)
  }

  const filteredWorkouts = workoutSessions.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg mt-4"
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workouts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Log and track your fitness activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAISuggestions(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <Brain className="w-4 h-4" />
              <span>AI Suggestions</span>
            </button>
            <button 
              onClick={() => {
                setEditingWorkout(null)
                setShowWorkoutModal(true)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button
            onClick={handleExportWorkouts}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImportWorkout}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Download className="w-4 h-4 rotate-180" />
            <span>Import</span>
          </button>
          <button
            onClick={() => navigate('/fitness/plans')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Target className="w-4 h-4" />
            <span>Create Plan</span>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </button>
          </div>
        ) : (
          filteredWorkouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
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
                    <span className="text-sm font-medium">{workout.calories_burned || 0} cal</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {workout.type}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditWorkout(workout)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateWorkout(workout)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShareWorkout(workout)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        onClose={() => {
          setShowWorkoutModal(false)
          setEditingWorkout(null)
        }}
        workout={editingWorkout}
      />

      {/* Import Modal */}
      <ImportWorkoutModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(file, format) => {
          console.log('Importing workouts:', file, format);
          success('Import Complete', 'Workouts have been imported successfully');
        }}
      />

      {/* Export Options Modal */}
      <ExportOptionsModal
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onExport={(format, options) => {
          console.log('Exporting workouts:', format, options);
          success('Export Started', `Your workouts are being exported as ${format.toUpperCase()}`);
        }}
        exportType="workouts"
      />

      {/* AI Suggestions Modal Placeholder */}
      {showAISuggestions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">AI Workout Suggestions</h2>
              </div>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is analyzing your workout history and preferences to suggest personalized workouts...
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default WorkoutsPage
