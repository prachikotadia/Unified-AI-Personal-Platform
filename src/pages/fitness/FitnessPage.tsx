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
  Sparkles
} from 'lucide-react'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'

const FitnessPage = () => {
  // Mock fitness data
  const fitnessData = {
    stepsToday: 8420,
    goalSteps: 10000,
    caloriesBurned: 420,
    workoutsThisWeek: 4,
    streak: 7,
    weeklyStats: [
      { day: 'Mon', steps: 8500, calories: 400 },
      { day: 'Tue', steps: 9200, calories: 450 },
      { day: 'Wed', steps: 7800, calories: 380 },
      { day: 'Thu', steps: 9500, calories: 470 },
      { day: 'Fri', steps: 8800, calories: 430 },
      { day: 'Sat', steps: 7600, calories: 370 },
      { day: 'Sun', steps: 8420, calories: 420 },
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
            <h1 className="text-3xl font-bold mb-2">Fitness Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your health and fitness progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{fitnessData.streak} day streak</span>
            </span>
          </div>
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
          <p className="text-2xl font-bold">{fitnessData.stepsToday.toLocaleString()}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full"
              style={{ width: `${(fitnessData.stepsToday / fitnessData.goalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {fitnessData.stepsToday.toLocaleString()} of {fitnessData.goalSteps.toLocaleString()} goal
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
          <p className="text-2xl font-bold">{fitnessData.caloriesBurned}</p>
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
          <p className="text-2xl font-bold">{fitnessData.workoutsThisWeek}</p>
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
          <p className="text-2xl font-bold">{fitnessData.streak} days</p>
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
          {fitnessData.weeklyStats.map((day, index) => (
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
    </div>
  )
}

export default FitnessPage
