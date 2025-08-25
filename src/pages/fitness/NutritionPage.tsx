import { motion } from 'framer-motion'
import { Apple, Plus } from 'lucide-react'

const NutritionPage = () => {
  // Mock nutrition data
  const nutritionData = {
    calories: 1850,
    goal: 2000,
    protein: 120,
    carbs: 180,
    fat: 65,
    meals: [
      { id: 1, name: 'Breakfast', calories: 450, time: '08:00' },
      { id: 2, name: 'Lunch', calories: 650, time: '12:30' },
      { id: 3, name: 'Dinner', calories: 750, time: '19:00' },
    ]
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
          <button className="btn-primary flex items-center space-x-2">
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
          <p className="text-2xl font-bold">{nutritionData.calories}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-red-gradient-from to-red-gradient-to h-2 rounded-full"
              style={{ width: `${(nutritionData.calories / nutritionData.goal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {nutritionData.calories} of {nutritionData.goal} goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Protein</h3>
          <p className="text-2xl font-bold">{nutritionData.protein}g</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 150g</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Carbs</h3>
          <p className="text-2xl font-bold">{nutritionData.carbs}g</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 200g</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">Fat</h3>
          <p className="text-2xl font-bold">{nutritionData.fat}g</p>
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
          {nutritionData.meals.map((meal, index) => (
            <div key={meal.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{meal.name}</h3>
                  <p className="text-sm text-gray-500">{meal.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{meal.calories} cal</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default NutritionPage
