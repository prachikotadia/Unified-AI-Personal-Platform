import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
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
  CheckCircle,
  Bluetooth,
  Wifi,
  Eye,
  ToggleLeft,
  ToggleRight,
  Brain,
  X,
  MessageSquare
} from 'lucide-react'
import { useToastHelpers } from '../../components/ui/Toast'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import { useFitness } from '../../hooks/useFitness'
import { useLiveSync } from '../../hooks/useLiveSync'
import { useFitnessStore } from '../../store/fitness'
import { useState } from 'react'
import WorkoutModal from '../../components/fitness/WorkoutModal'
import NutritionModal from '../../components/fitness/NutritionModal'
import GoalModal from '../../components/fitness/GoalModal'
import MeasurementModal from '../../components/fitness/MeasurementModal'
import ExerciseModal from '../../components/fitness/ExerciseModal'
import MobileConnectModal from '../../components/fitness/MobileConnectModal'
import FitnessShareModal from '../../components/fitness/FitnessShareModal'
import AIWorkoutPlanModal from '../../components/fitness/AIWorkoutPlanModal'
import AINutritionPlanModal from '../../components/fitness/AINutritionPlanModal'
import AIRecoveryRecommendations from '../../components/fitness/AIRecoveryRecommendations'
import AIFitnessAssistantChat from '../../components/fitness/AIFitnessAssistantChat'

const FitnessPage = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToastHelpers()
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [showMobileConnectModal, setShowMobileConnectModal] = useState(false)
  const [showFitnessShareModal, setShowFitnessShareModal] = useState(false)
  const [showAIWorkoutPlanModal, setShowAIWorkoutPlanModal] = useState(false)
  const [showAINutritionPlanModal, setShowAINutritionPlanModal] = useState(false)
  const [showAIRecoveryModal, setShowAIRecoveryModal] = useState(false)
  const [showAIFitnessChat, setShowAIFitnessChat] = useState(false)

  const {
    dashboard,
    dailySummary,
    streaks,
    healthGoals,
    achievements,
    insights,
    recommendations,
    workoutSessions,
    isLoading,
    errors,
    getTodaySteps,
    getTodayCaloriesBurned,
    getWeeklyWorkouts,
    getCurrentStreak,
    getNutritionTotals,
  } = useFitness()

  // Live sync for mobile devices - must be called before using hasActiveSync
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

  // Initialize liveSyncEnabled with hasActiveSync (now available)
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(hasActiveSync)

  // Get real data or fallback to defaults
  const stepsToday = getTodaySteps()
  const goalSteps = 10000
  const caloriesBurned = getTodayCaloriesBurned()
  const workoutsThisWeek = getWeeklyWorkouts()
  const streak = getCurrentStreak()
  const { incrementStreak, isStreakMarkedToday, getStreakInfo } = useFitnessStore()
  const isTodayMarked = isStreakMarkedToday('workout')
  const streakInfo = getStreakInfo('workout')
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Fitness Data</div>
            <p className="text-gray-600 dark:text-gray-400">
              You are offline. Please check your connection.
            </p>
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
              <p className="text-sm text-gray-500">
                Note: This is a demo application. In production, you would need to deploy the backend services.
              </p>
            </div>
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
        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Fitness Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your health and fitness progress
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-3 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Current Streak</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                  <Flame className={`w-5 h-5 ${streakInfo.isActive ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
                  <span>{streak} days</span>
                </span>
                {streakInfo.longest > streak && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Best: {streakInfo.longest})
                  </span>
                )}
              </div>
              {streakInfo.daysUntilNextMilestone && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                  {streakInfo.daysUntilNextMilestone} days until {streakInfo.nextMilestone} milestone! 🎯
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (!isTodayMarked) {
                  incrementStreak('workout');
                  const newStreak = streak + 1;
                  success('Streak Updated! 🔥', `Your streak is now ${newStreak} days! Keep it up!`);
                  
                  // Show milestone celebration
                  if ([10, 30, 50, 100, 200, 365].includes(newStreak)) {
                    setTimeout(() => {
                      success('Milestone Achieved! 🎉', `Amazing! You've reached ${newStreak} days!`);
                    }, 500);
                  }
                } else {
                  showError('Already Marked', 'You\'ve already marked today! Come back tomorrow to continue your streak.');
                }
              }}
              disabled={isTodayMarked}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isTodayMarked
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
              }`}
              title={isTodayMarked ? 'Already marked today' : 'Mark today\'s streak'}
            >
              {isTodayMarked ? (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Done
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 inline mr-1" />
                  Mark Today
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Log Workout</span>
          </button>
          
          <button
            onClick={() => setShowNutritionModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Log Meal</span>
          </button>
          
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Target className="w-6 h-6" />
            <span className="text-sm font-medium">Set Goal</span>
          </button>

          <button
            onClick={() => setShowMeasurementModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Ruler className="w-6 h-6" />
            <span className="text-sm font-medium">Log Measurements</span>
          </button>

          <button
            onClick={() => navigate('/fitness/exercises')}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Dumbbell className="w-6 h-6" />
            <span className="text-sm font-medium">Exercise Library</span>
          </button>
        </div>

        {/* Mobile Connectivity Section */}
        <div className="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Mobile Device Connection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hasConnectedDevices 
                    ? `${getConnectedDevicesCount()} device${getConnectedDevicesCount() !== 1 ? 's' : ''} connected`
                    : 'No devices connected'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500' : 
                connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">{connectionStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setShowMobileConnectModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Bluetooth className="w-5 h-5" />
              <span className="font-medium">Connect Device</span>
            </button>
            
            <button
              onClick={() => setShowFitnessShareModal(true)}
              className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share Data</span>
            </button>

            <button
              onClick={() => {
                setLiveSyncEnabled(!liveSyncEnabled)
                success('Live Sync', liveSyncEnabled ? 'Live sync disabled' : 'Live sync enabled')
              }}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <Wifi className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Live Sync</span>
              {liveSyncEnabled ? (
                <ToggleRight className="w-5 h-5 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <button
              onClick={() => navigate('/fitness/progress')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Today's Steps</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{stepsToday.toLocaleString()}</p>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((stepsToday / goalSteps) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stepsToday.toLocaleString()} of {goalSteps.toLocaleString()} goal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <button
              onClick={() => navigate('/fitness/progress')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Calories Burned</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{caloriesBurned}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <button
              onClick={() => navigate('/fitness/workouts')}
              className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Workouts This Week</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{workoutsThisWeek}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Goal: 5</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <button
              onClick={() => navigate('/fitness/achievements')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Streak</h3>
          <div className="flex items-baseline space-x-2 mb-1">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{streak} days</p>
            {streakInfo.longest > streak && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (Best: {streakInfo.longest})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 mb-3">
            <Flame className={`w-4 h-4 ${streakInfo.isActive ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${streakInfo.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {streakInfo.isActive ? 'Keep it up!' : 'Mark today to continue!'}
            </p>
          </div>
          {streakInfo.daysUntilNextMilestone && (
            <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                🎯 {streakInfo.daysUntilNextMilestone} days until {streakInfo.nextMilestone} milestone!
              </p>
            </div>
          )}
          <button
            onClick={() => {
              if (!isTodayMarked) {
                incrementStreak('workout');
                const newStreak = streak + 1;
                success('Streak Updated! 🔥', `Your streak is now ${newStreak} days! Keep it up!`);
                
                // Show milestone celebration
                if ([10, 30, 50, 100, 200, 365].includes(newStreak)) {
                  setTimeout(() => {
                    success('Milestone Achieved! 🎉', `Amazing! You've reached ${newStreak} days!`);
                  }, 500);
                }
              } else {
                showError('Already Marked', 'You\'ve already marked today! Come back tomorrow to continue your streak.');
              }
            }}
            disabled={isTodayMarked}
            className={`w-full px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
              isTodayMarked
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg active:scale-95'
            }`}
            title={isTodayMarked ? 'Already marked today' : 'Mark today\'s streak'}
          >
            {isTodayMarked ? (
              <>
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Done Today
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 inline mr-1" />
                Mark Today
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Weekly Progress</h2>
        
        <div className="space-y-4">
          {weeklyStats.map((day, index) => {
            const maxSteps = Math.max(...weeklyStats.map(d => d.steps), 10000);
            const percentage = (day.steps / maxSteps) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white w-12">{day.day}</p>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                    {day.steps.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAIWorkoutPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Brain className="w-4 h-4" />
              AI Workout Plan
            </button>
            <button
              onClick={() => setShowAINutritionPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Brain className="w-4 h-4" />
              AI Nutrition Plan
            </button>
          </div>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/fitness/workouts')}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">View All Workouts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">See all your workouts</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/fitness/nutrition')}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">View All Nutrition</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your meals</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/fitness/progress')}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">View Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/fitness/achievements')}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">View Achievements</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">See your achievements</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* AI Fitness Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
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

      {/* AI Recovery Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Recovery & Wellness</h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered recovery recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAIRecoveryModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>View All Recommendations</span>
          </button>
        </div>
        <AIRecoveryRecommendations
          recentWorkouts={workoutSessions || []}
          sleepData={{
            averageHours: 7.5,
            quality: 80
          }}
          nutritionData={{
            proteinIntake: getNutritionTotals()?.protein || 120,
            hydration: 2.5
          }}
        />
      </motion.div>

      {/* AI Fitness Chat Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center"
      >
        <button
          onClick={() => setShowAIFitnessChat(true)}
          className="btn-primary flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat with AI Fitness Assistant</span>
        </button>
      </motion.div>

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

             {/* AI Modals */}
             <AIWorkoutPlanModal
               isOpen={showAIWorkoutPlanModal}
               onClose={() => setShowAIWorkoutPlanModal(false)}
              onGeneratePlan={async (planData: any) => {
                try {
                  const { createWorkoutPlan } = useFitnessStore.getState();
                  const planDescription = planData.aiPlan 
                    ? `${planData.aiPlan}\n\nGenerated for ${planData.duration} weeks, ${planData.frequency}x per week, ${planData.level} level.`
                    : `Personalized ${planData.goal} workout plan for ${planData.duration} weeks, ${planData.frequency}x per week, ${planData.level} level`;
                  
                  await createWorkoutPlan({
                    name: `AI Workout Plan - ${planData.goal}`,
                    description: planDescription,
                    type: 'strength' as any,
                    duration: planData.duration * 7, // Convert weeks to days
                    intensity: planData.level,
                    exercises: [],
                    schedule: {},
                  });
                  
                  const message = planData.isFallback 
                    ? 'Workout plan generated using fallback generator (AI unavailable)'
                    : 'AI has created your personalized workout plan';
                  success('Workout Plan Generated', message);
                  navigate('/fitness/plans');
                } catch (error) {
                  console.error('Error saving workout plan:', error);
                  success('Workout Plan Generated', 'Workout plan has been saved locally');
                  navigate('/fitness/plans');
                }
              }}
             />

             <AINutritionPlanModal
               isOpen={showAINutritionPlanModal}
               onClose={() => setShowAINutritionPlanModal(false)}
              onGeneratePlan={async (planData: any) => {
                try {
                  // Save nutrition plan as a goal
                  const { createHealthGoal } = useFitnessStore.getState();
                  const planDescription = planData.aiPlan 
                    ? `${planData.aiPlan}\n\nDaily calories: ${planData.calories}, Duration: ${planData.duration} days. Restrictions: ${planData.dietaryRestrictions.join(', ') || 'None'}. Preferences: ${planData.preferences.join(', ') || 'None'}`
                    : `Daily calories: ${planData.calories}, Duration: ${planData.duration} days. Restrictions: ${planData.dietaryRestrictions.join(', ') || 'None'}. Preferences: ${planData.preferences.join(', ') || 'None'}`;
                  
                  await createHealthGoal({
                    name: `AI Nutrition Plan - ${planData.goal}`,
                    description: planDescription,
                    type: 'nutrition',
                    target_value: planData.calories,
                    unit: 'calories',
                    deadline: new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000).toISOString(),
                  });
                  
                  const message = planData.isFallback 
                    ? 'Nutrition plan generated using fallback generator (AI unavailable)'
                    : 'AI has created your personalized meal plan';
                  success('Nutrition Plan Generated', message);
                  navigate('/fitness/nutrition');
                } catch (error) {
                  console.error('Error saving nutrition plan:', error);
                  success('Nutrition Plan Generated', 'Nutrition plan has been saved locally');
                  navigate('/fitness/nutrition');
                }
              }}
             />

             {/* AI Recovery Recommendations Modal */}
             {showAIRecoveryModal && (
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                 >
                   <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-semibold">AI Recovery Recommendations</h2>
                     <button
                       onClick={() => setShowAIRecoveryModal(false)}
                       className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                   <AIRecoveryRecommendations
                     recentWorkouts={workoutSessions || []}
                     sleepData={{
                       averageHours: 7.5,
                       quality: 80
                     }}
                     nutritionData={{
                       proteinIntake: getNutritionTotals()?.protein || 120,
                       hydration: 2.5
                     }}
                     onApplyRecommendation={(rec) => {
                       console.log('Applied recommendation:', rec)
                       success('Recommendation Applied', `${rec.title} has been added to your plan`)
                     }}
                   />
                 </motion.div>
               </div>
             )}

             {/* AI Fitness Assistant Chat */}
             <AIFitnessAssistantChat
               isOpen={showAIFitnessChat}
               onClose={() => setShowAIFitnessChat(false)}
               fitnessContext={{
                 recentWorkouts: workoutSessions || [],
                 goals: healthGoals,
                 nutritionData: getNutritionTotals(),
                 progressData: dashboard
               }}
             />
    </div>
  )
}

export default FitnessPage
