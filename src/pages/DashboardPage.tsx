import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Activity, 
  Plane, 
  Users, 
  MessageCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { formatCurrency } from '../lib/utils'
import AIInsights from '../components/ai/AIInsights'
import AIAssistant from '../components/ai/AIAssistant'

const DashboardPage = () => {
  const { user } = useAuthStore()

  // Mock data - replace with actual API calls
  const financeData = {
    monthlySpend: 2847.50,
    monthlyBudget: 3500,
    change: 12.5,
    forecast: [3200, 3100, 3300, 3400, 3500, 3600]
  }

  const marketplaceData = {
    cartItems: 3,
    totalValue: 156.78,
    recommendations: [
      { id: 1, name: 'Wireless Headphones', price: 89.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' },
      { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' },
      { id: 3, name: 'Laptop Stand', price: 45.99, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=150&h=150&fit=crop' },
    ]
  }

  const fitnessData = {
    stepsToday: 8420,
    goalSteps: 10000,
    caloriesBurned: 420,
    workoutsThisWeek: 4,
    streak: 7
  }

  const travelData = {
    upcomingTrips: 2,
    nextTrip: {
      destination: 'Tokyo, Japan',
      date: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop'
    }
  }

  const socialData = {
    connections: 24,
    sharedItems: 8,
    recentActivity: [
      { type: 'budget', user: 'Sarah', action: 'shared a budget' },
      { type: 'trip', user: 'Mike', action: 'shared a trip' },
      { type: 'workout', user: 'Emma', action: 'completed a workout' },
    ]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your AI-powered lifestyle today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Finance Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-gradient-from to-green-gradient-to rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Finance</h3>
            </div>
            <Link to="/finance" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Monthly Spend</p>
              <p className="text-2xl font-bold">{formatCurrency(financeData.monthlySpend)}</p>
              <div className="flex items-center space-x-2 mt-1">
                {financeData.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${financeData.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {financeData.change > 0 ? '+' : ''}{financeData.change}% from last month
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-gradient-from to-green-gradient-to h-2 rounded-full"
                style={{ width: `${(financeData.monthlySpend / financeData.monthlyBudget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(financeData.monthlySpend)} of {formatCurrency(financeData.monthlyBudget)} budget
            </p>
          </div>
        </motion.div>

        {/* Marketplace Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-gradient-from to-orange-gradient-to rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Marketplace</h3>
            </div>
            <Link to="/marketplace" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Cart Items</p>
              <p className="text-2xl font-bold">{marketplaceData.cartItems} items</p>
              <p className="text-sm text-gray-600">{formatCurrency(marketplaceData.totalValue)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">AI Recommendations</p>
              <div className="flex space-x-2">
                {marketplaceData.recommendations.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fitness Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Fitness</h3>
            </div>
            <Link to="/fitness" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Today's Steps</p>
              <p className="text-2xl font-bold">{fitnessData.stepsToday.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{fitnessData.caloriesBurned} calories burned</p>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full"
                style={{ width: `${(fitnessData.stepsToday / fitnessData.goalSteps) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {fitnessData.stepsToday.toLocaleString()} of {fitnessData.goalSteps.toLocaleString()} goal
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span>{fitnessData.workoutsThisWeek} workouts this week</span>
                              <span className="text-green-500 flex items-center gap-1"><Flame size={16} /> {fitnessData.streak} day streak</span>
            </div>
          </div>
        </motion.div>

        {/* Travel Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Travel</h3>
            </div>
            <Link to="/travel" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Upcoming Trips</p>
              <p className="text-2xl font-bold">{travelData.upcomingTrips}</p>
            </div>
            
            {travelData.nextTrip && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Next Trip</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={travelData.nextTrip.image} 
                    alt={travelData.nextTrip.destination}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{travelData.nextTrip.destination}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(travelData.nextTrip.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Social Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-gradient-from to-pink-gradient-to rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Social</h3>
            </div>
            <Link to="/social" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Connections</p>
              <p className="text-2xl font-bold">{socialData.connections}</p>
              <p className="text-sm text-gray-600">{socialData.sharedItems} shared items</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Activity</p>
              <div className="space-y-1">
                {socialData.recentActivity.slice(0, 2).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-500">{activity.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Card */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-gradient-from to-indigo-gradient-to rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Chat</h3>
            </div>
            <Link to="/chat" className="text-blue-gradient-from hover:text-blue-gradient-to">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Active Conversations</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-600">2 unread messages</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Chats</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Sarah M.</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Mike R.</span>
                  <span className="text-gray-400">●</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/finance/transactions"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Add Expense</span>
          </Link>
          
          <Link
            to="/fitness/workouts"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium">Log Workout</span>
          </Link>
          
          <Link
            to="/travel/search"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium">Plan Trip</span>
          </Link>
          
          <Link
            to="/chat"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="font-medium">New Chat</span>
          </Link>
        </div>
      </motion.div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold mb-1">AI Insights</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Personalized recommendations and predictions
              </p>
            </div>
          </div>
        </div>
        
        <AIInsights limit={2} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="finance" />
    </div>
  )
}

export default DashboardPage
