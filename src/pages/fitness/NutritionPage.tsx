import { motion } from 'framer-motion'
import { Apple, Plus } from 'lucide-react'
import { useNutrition } from '../../hooks/useFitness'
import { useState } from 'react'
import NutritionModal from '../../components/fitness/NutritionModal'

const NutritionPage = () => {
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const { nutritionEntries, nutritionTotals, isLoading, error } = useNutrition()

  // Get nutrition data
  const calories = nutritionTotals.calories
  const goal = 2000
  const protein = nutritionTotals.protein
  const carbs = nutritionTotals.carbs
  const fat = nutritionTotals.fat

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
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
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Nutrition Data</div>
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
            <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your daily nutrition and meal planning
            </p>
          </div>
          <button 
            onClick={() => setShowNutritionModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Meal</span>
          </button>
        </div>
      </motion.div>

      {/* Nutrition Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-gradient-from to-red-gradient-to rounded-lg flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Calories</h3>
          <p className="text-2xl font-bold">{calories}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-red-gradient-from to-red-gradient-to h-2 rounded-full"
              style={{ width: `${(calories / goal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {calories} of {goal} goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Protein</h3>
          <p className="text-2xl font-bold">{protein}g</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 150g</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Carbs</h3>
          <p className="text-2xl font-bold">{carbs}g</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 200g</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Fat</h3>
          <p className="text-2xl font-bold">{fat}g</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 70g</p>
        </motion.div>
      </div>

      {/* Meals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Today's Meals</h2>
        
        <div className="space-y-4">
          {nutritionEntries.length === 0 ? (
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <Apple className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No Meals Logged Yet</h3>
                <p className="text-sm">Start tracking your nutrition by logging your first meal!</p>
              </div>
              <button 
                onClick={() => setShowNutritionModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </button>
            </div>
          ) : (
            nutritionEntries.map((meal, index) => (
              <div key={meal.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{meal.meal_type}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{meal.total_calories} cal</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Nutrition Modal */}
      <NutritionModal 
        isOpen={showNutritionModal} 
        onClose={() => setShowNutritionModal(false)} 
      />
    </div>
  )
}

export default NutritionPage
