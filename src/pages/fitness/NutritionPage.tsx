import { motion } from 'framer-motion'
import { Apple, Plus, Edit, Trash2, Copy, Search, Filter, Download, Brain, Sparkles, ScanLine, UtensilsCrossed, Calendar } from 'lucide-react'
import { useNutrition } from '../../hooks/useFitness'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NutritionModal from '../../components/fitness/NutritionModal'
import MealPlanModal from '../../components/fitness/MealPlanModal'
import RecipeModal from '../../components/fitness/RecipeModal'
import BarcodeScannerModal from '../../components/fitness/BarcodeScannerModal'
import { useToastHelpers } from '../../components/ui/Toast'

const NutritionPage = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToastHelpers()
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [editingMeal, setEditingMeal] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [showMealPlanModal, setShowMealPlanModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const { nutritionEntries, getNutritionTotals, isLoading, error } = useNutrition()

  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal)
    setShowNutritionModal(true)
  }

  const handleDeleteMeal = (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      success('Meal Deleted', 'Meal has been removed')
    }
  }

  const handleDuplicateMeal = (meal: any) => {
    success('Meal Duplicated', 'Meal has been duplicated')
  }

  const handleExportNutrition = () => {
    success('Export Started', 'Your nutrition data is being exported')
  }

  const handleScanBarcode = () => {
    setShowBarcodeScanner(true)
    // Barcode scanner logic would go here
  }

  const filteredMeals = nutritionEntries.filter(meal =>
    meal.meal_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get nutrition data
  const nutritionTotals = getNutritionTotals()
  const calories = nutritionTotals?.calories || 0
  const goal = 2000
  const protein = nutritionTotals?.protein || 0
  const carbs = nutritionTotals?.carbs || 0
  const fat = nutritionTotals?.fat || 0

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
            <h1 className="text-3xl font-bold mb-2">Nutrition</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your daily nutrition and meal planning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAISuggestions(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <Brain className="w-4 h-4" />
              <span>AI Suggestions</span>
            </button>
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <Brain className="w-4 h-4" />
              <span>AI Analysis</span>
            </button>
            <button 
              onClick={() => {
                setEditingMeal(null)
                setShowNutritionModal(true)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleScanBarcode}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={() => {
              setEditingRecipe(null)
              setShowRecipeModal(true)
            }}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Add Recipe</span>
          </button>
          <button
            onClick={() => setShowMealPlanModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Meal Plan</span>
          </button>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
            onClick={handleExportNutrition}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </button>
            </div>
          ) : (
            filteredMeals.map((meal, index) => (
              <div key={meal.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
                    <Apple className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{meal.meal_type}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{meal.total_calories} cal</p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditMeal(meal)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateMeal(meal)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Nutrition Modal */}
      <NutritionModal 
        isOpen={showNutritionModal} 
        onClose={() => {
          setShowNutritionModal(false)
          setEditingMeal(null)
        }}
        nutrition={editingMeal}
      />

      {/* AI Modals Placeholders */}
      {showAISuggestions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold">AI Meal Suggestions</h2>
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
                AI is analyzing your nutrition goals and preferences to suggest personalized meals...
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {showAIAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold">AI Nutrition Analysis</h2>
              </div>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                AI is analyzing your nutrition data to provide insights and recommendations...
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScanComplete={(barcodeData) => {
          console.log('Barcode scanned:', barcodeData);
          success('Product Scanned', `${barcodeData.productName} added to nutrition log`);
          setShowBarcodeScanner(false);
        }}
      />

      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setEditingRecipe(null);
        }}
        onSubmit={(recipeData) => {
          console.log('Recipe saved:', recipeData);
          success('Recipe Saved', 'Recipe has been added to your collection');
          setShowRecipeModal(false);
        }}
        recipe={editingRecipe}
      />

      <MealPlanModal
        isOpen={showMealPlanModal}
        onClose={() => setShowMealPlanModal(false)}
        onSubmit={(planData) => {
          console.log('Meal plan created:', planData);
          success('Meal Plan Created', 'Your meal plan has been created');
          setShowMealPlanModal(false);
        }}
      />
    </div>
  )
}

export default NutritionPage
