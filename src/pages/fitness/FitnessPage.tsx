import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Award, 
  Flame,
  Heart,
  Clock,
  Calendar,
  Plus,
  ArrowRight,
  Trophy,
  Zap,
  Sparkles,
  Ruler,
  Dumbbell,
  Smartphone,
  Share2,
  Bluetooth,
  Wifi
} from 'lucide-react'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import { useFitness } from '../../hooks/useFitness'
import { useLiveSync } from '../../hooks/useLiveSync'
import { useState } from 'react'
import WorkoutModal from '../../components/fitness/WorkoutModal'
import NutritionModal from '../../components/fitness/NutritionModal'
import GoalModal from '../../components/fitness/GoalModal'
import MeasurementModal from '../../components/fitness/MeasurementModal'
import ExerciseModal from '../../components/fitness/ExerciseModal'
import MobileConnectModal from '../../components/fitness/MobileConnectModal'
import FitnessShareModal from '../../components/fitness/FitnessShareModal'

const FitnessPage = () => {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [showMobileConnectModal, setShowMobileConnectModal] = useState(false)
  const [showFitnessShareModal, setShowFitnessShareModal] = useState(false)

  const {
    dashboard,
    dailySummary,
    streaks,
    healthGoals,
    achievements,
    insights,
    recommendations,
    isLoading,
    errors,
    getTodaySteps,
    getTodayCaloriesBurned,
    getWeeklyWorkouts,
    getCurrentStreak,
    getNutritionTotals,
  } = useFitness()

  // Live sync for mobile devices
  const {
    connectedDevices,
    connectionStatus,
    lastSyncTime,
    hasConnectedDevices,
    hasActiveSync,
    getConnectedDevicesCount,
    getDevicesWithLowBattery,
    getDevicesNeedingSync,
  } = useLiveSync()

  // Get real data or fallback to defaults
  const stepsToday = getTodaySteps()
  const goalSteps = 10000
  const caloriesBurned = getTodayCaloriesBurned()
  const workoutsThisWeek = getWeeklyWorkouts()
  const streak = getCurrentStreak()
  const nutritionTotals = getNutritionTotals()

  // Weekly stats (mock for now, can be enhanced with real data)
  const weeklyStats = [
    { day: 'Mon', steps: 8500, calories: 400 },
    { day: 'Tue', steps: 9200, calories: 450 },
    { day: 'Wed', steps: 7800, calories: 380 },
    { day: 'Thu', steps: 9500, calories: 470 },
    { day: 'Fri', steps: 8800, calories: 430 },
    { day: 'Sat', steps: 7600, calories: 370 },
    { day: 'Sun', steps: stepsToday, calories: caloriesBurned },
  ]

  // Show loading state
  if (isLoading.dashboard || isLoading.dailySummary) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  if (errors.dashboard || errors.dailySummary) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Fitness Data</div>
            <p className="text-gray-600 dark:text-gray-400">
              {errors.dashboard || errors.dailySummary}
            </p>
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
            <h1 className="text-3xl font-bold mb-2">Fitness Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your health and fitness progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{streak} day streak</span>
            </span>
          </div>
        </div>

                     {/* Quick Actions */}
             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               <button
                 onClick={() => setShowWorkoutModal(true)}
                 className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
               >
                 <Plus className="w-5 h-5" />
                 <span>Log Workout</span>
               </button>
               
               <button
                 onClick={() => setShowNutritionModal(true)}
                 className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-gradient-from to-green-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
               >
                 <Plus className="w-5 h-5" />
                 <span>Log Meal</span>
               </button>
               
               <button
                 onClick={() => setShowGoalModal(true)}
                 className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
               >
                 <Target className="w-5 h-5" />
                 <span>Set Goal</span>
               </button>

               <button
                 onClick={() => setShowMeasurementModal(true)}
                 className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-orange-gradient-from to-orange-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
               >
                 <Ruler className="w-5 h-5" />
                 <span>Log Measurements</span>
               </button>

               <button
                 onClick={() => setShowExerciseModal(true)}
                 className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-gradient-from to-red-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
               >
                 <Dumbbell className="w-5 h-5" />
                 <span>Exercise Library</span>
               </button>
             </div>

             {/* Mobile Connectivity Section */}
             <div className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                   <Smartphone className="w-6 h-6 text-blue-500" />
                   <div>
                     <h3 className="font-semibold">Mobile Device Connection</h3>
                     <p className="text-sm text-gray-500">
                       {hasConnectedDevices 
                         ? `${getConnectedDevicesCount()} device${getConnectedDevicesCount() !== 1 ? 's' : ''} connected`
                         : 'No devices connected'
                       }
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${
                     connectionStatus === 'connected' ? 'bg-green-500' : 
                     connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                   }`} />
                   <span className="text-sm text-gray-500 capitalize">{connectionStatus}</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <button
                   onClick={() => setShowMobileConnectModal(true)}
                   className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
                 >
                   <Bluetooth className="w-4 h-4" />
                   <span>Connect Device</span>
                 </button>
                 
                 <button
                   onClick={() => setShowFitnessShareModal(true)}
                   className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity"
                 >
                   <Share2 className="w-4 h-4" />
                   <span>Share Data</span>
                 </button>

                 <button
                   className="flex items-center justify-center space-x-2 p-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                 >
                   <Wifi className="w-4 h-4" />
                   <span>Live Sync</span>
                   {hasActiveSync && (
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   )}
                 </button>
               </div>

               {/* Connected Devices Status */}
               {hasConnectedDevices && (
                 <div className="mt-4 pt-4 border-t border-white/10">
                   <h4 className="text-sm font-medium mb-2">Connected Devices</h4>
                   <div className="space-y-2">
                     {connectedDevices.map((device) => (
                       <div key={device.id} className="flex items-center justify-between text-sm">
                         <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${
                             device.connected ? 'bg-green-500' : 'bg-gray-500'
                           }`} />
                           <span>{device.name}</span>
                           <span className="text-gray-500">({device.batteryLevel}%)</span>
                         </div>
                         <span className="text-xs text-gray-500">
                           {new Date(device.lastSync).toLocaleTimeString()}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Today's Steps</h3>
          <p className="text-2xl font-bold">{stepsToday.toLocaleString()}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full"
              style={{ width: `${(stepsToday / goalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stepsToday.toLocaleString()} of {goalSteps.toLocaleString()} goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Calories Burned</h3>
          <p className="text-2xl font-bold">{caloriesBurned}</p>
          <p className="text-sm text-gray-600 mt-1">Today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Workouts This Week</h3>
          <p className="text-2xl font-bold">{workoutsThisWeek}</p>
          <p className="text-sm text-gray-600 mt-1">Goal: 5</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-gradient-from to-orange-gradient-to rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Current Streak</h3>
          <p className="text-2xl font-bold">{streak} days</p>
          <p className="text-sm text-green-500 mt-1 flex items-center space-x-1">
            <Flame className="w-3 h-3" />
            <span>Keep it up!</span>
          </p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Weekly Progress</h2>
        
        <div className="grid grid-cols-7 gap-4">
          {weeklyStats.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium mb-2">{day.day}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-20 relative">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-gradient-from to-blue-gradient-to rounded-full"
                  style={{ height: `${(day.steps / 10000) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{day.steps.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/fitness/workouts"
            className="glass-card p-4 hover:scale-105 transition-transform duration-300 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Log Workout</h3>
              <p className="text-sm text-gray-500">Record your exercise</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/fitness/nutrition"
            className="glass-card p-4 hover:scale-105 transition-transform duration-300 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Track Nutrition</h3>
              <p className="text-sm text-gray-500">Log your meals</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/fitness/achievements"
            className="glass-card p-4 hover:scale-105 transition-transform duration-300 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-gradient-from to-yellow-gradient-to rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">View Achievements</h3>
              <p className="text-sm text-gray-500">See your progress</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
          </Link>
        </div>
      </motion.div>

      {/* AI Fitness Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Fitness Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized workout and nutrition recommendations
            </p>
          </div>
        </div>
        
        <AIInsights type="fitness" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="fitness" />

                   {/* Modals */}
             <WorkoutModal 
               isOpen={showWorkoutModal} 
               onClose={() => setShowWorkoutModal(false)} 
             />
             
             <NutritionModal 
               isOpen={showNutritionModal} 
               onClose={() => setShowNutritionModal(false)} 
             />
             
             <GoalModal 
               isOpen={showGoalModal} 
               onClose={() => setShowGoalModal(false)} 
             />

             <MeasurementModal 
               isOpen={showMeasurementModal} 
               onClose={() => setShowMeasurementModal(false)} 
             />

             <ExerciseModal 
               isOpen={showExerciseModal} 
               onClose={() => setShowExerciseModal(false)}
               onSelect={(exercise) => {
                 console.log('Selected exercise:', exercise)
                 setShowExerciseModal(false)
               }}
             />

             {/* Mobile Connectivity Modals */}
             <MobileConnectModal 
               isOpen={showMobileConnectModal} 
               onClose={() => setShowMobileConnectModal(false)} 
             />

             <FitnessShareModal 
               isOpen={showFitnessShareModal} 
               onClose={() => setShowFitnessShareModal(false)}
               fitnessData={{
                 steps: stepsToday,
                 calories: caloriesBurned,
                 workouts: workoutsThisWeek,
                 streak: streak,
                 achievements: achievements.length,
                 heartRate: 72, // Mock data
                 sleepHours: 7.5, // Mock data
                 weight: 70.5, // Mock data
                 bodyFat: 18.5 // Mock data
               }}
             />
    </div>
  )
}

export default FitnessPage
