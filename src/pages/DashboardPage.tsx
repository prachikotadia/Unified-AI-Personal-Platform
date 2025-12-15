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
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../services/dashboardAPI'
import { useFinanceStore } from '../store/finance'
import { useFitnessStore } from '../store/fitness'
import { useTravelStore } from '../store/travel'
import { useChatStore } from '../store/chat'
import { useSocialStore } from '../store/social'
import { useMarketplaceStore } from '../store/marketplace'

const DashboardPage = () => {
  const { user } = useAuthStore()
  
  // Get actual data from stores
  const { transactions, budgets, bankAccounts } = useFinanceStore()
  const { getTodaySteps, getTodayCaloriesBurned, getWeeklyWorkouts, getCurrentStreak, dailySummary, dashboard } = useFitnessStore()
  const { trips } = useTravelStore()
  const { rooms } = useChatStore()
  const { connections } = useSocialStore()
  const { cart, recentlyViewed } = useMarketplaceStore()

  // Fetch dashboard data from API (optional fallback)
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardAPI.getSummary(user?.id),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Calculate actual finance data from store
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Calculate monthly expenses (transactions with type 'expense' this month)
  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.type === 'expense'
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  // Calculate monthly income (transactions with type 'income' this month)
  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.type === 'income'
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  // Calculate last month expenses for comparison
  const lastMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === lastMonth && 
             date.getFullYear() === lastMonthYear &&
             t.type === 'expense'
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  // Calculate monthly budget (sum of active budgets)
  const monthlyBudget = budgets
    .filter(b => (b as any).status === 'active' || !(b as any).status)
    .reduce((sum, b) => sum + ((b as any).limit || (b as any).amount || 0), 0)

  // Calculate percentage change
  const change = lastMonthExpenses > 0 
    ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0

  const financeData = {
    monthlySpend: monthlyExpenses || 0,
    monthlyIncome: monthlyIncome || 0,
    monthlyBudget: monthlyBudget || 0,
    change: parseFloat(change.toFixed(1)),
    forecast: [3200, 3100, 3300, 3400, 3500, 3600]
  }

  // Calculate actual marketplace data
  const cartItems = cart.length
  const cartTotalValue = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const marketplaceData = {
    cartItems,
    totalValue: cartTotalValue,
    recommendations: recentlyViewed.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    }))
  }

  // Calculate actual fitness data
  const stepsToday = getTodaySteps() || 0
  const caloriesBurned = getTodayCaloriesBurned() || 0
  const workoutsThisWeek = getWeeklyWorkouts() || 0
  const streak = getCurrentStreak() || 0
  const goalSteps = 10000

  const fitnessData = {
    stepsToday,
    goalSteps,
    caloriesBurned,
    workoutsThisWeek,
    streak
  }

  // Calculate actual travel data
  const nowDate = new Date()
  nowDate.setHours(0, 0, 0, 0)
  const upcomingTripsList = trips.filter(trip => {
    const startDate = new Date(trip.start_date)
    startDate.setHours(0, 0, 0, 0)
    return startDate >= nowDate
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  const travelData = {
    upcomingTrips: upcomingTripsList.length,
    nextTrip: upcomingTripsList.length > 0 ? {
      destination: upcomingTripsList[0].destination,
      date: upcomingTripsList[0].start_date,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop'
    } : null
  }

  // Calculate actual social data
  const socialData = {
    connections: connections.size || 0,
    sharedItems: 0, // Can be enhanced with actual shared items count
    recentActivity: [
      { type: 'budget', user: 'Sarah', action: 'shared a budget' },
      { type: 'trip', user: 'Mike', action: 'shared a trip' },
      { type: 'workout', user: 'Emma', action: 'completed a workout' },
    ]
  }

  // Calculate actual chat data
  const unreadMessages = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0)
  const chatData = {
    activeConversations: rooms.length || 0,
    unreadMessages
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Finance Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-green-200 dark:ring-green-800">
                <DollarSign className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finance</h3>
            </div>
            <Link to="/finance" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(financeData.monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Expenses</p>
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
            
            {financeData.monthlyBudget > 0 && (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((financeData.monthlySpend / financeData.monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {formatCurrency(financeData.monthlySpend)} of {formatCurrency(financeData.monthlyBudget)} budget
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Marketplace Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-orange-200 dark:ring-orange-800">
                <ShoppingCart className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketplace</h3>
            </div>
            <Link to="/marketplace" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Cart Items</p>
              <p className="text-2xl font-bold">{marketplaceData.cartItems} items</p>
              <p className="text-sm text-gray-600">{formatCurrency(marketplaceData.totalValue)}</p>
            </div>
            
            {marketplaceData.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recently Viewed</p>
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
            )}
          </div>
        </motion.div>

        {/* Fitness Card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200 dark:ring-purple-800">
                <Activity className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fitness</h3>
            </div>
            <Link to="/fitness" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Today's Steps</p>
              <p className="text-2xl font-bold">{fitnessData.stepsToday.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{fitnessData.caloriesBurned} calories burned</p>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((fitnessData.stepsToday / fitnessData.goalSteps) * 100, 100)}%` }}
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
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
                <Plane className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Travel</h3>
            </div>
            <Link to="/travel" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-pink-200 dark:ring-pink-800">
                <Users className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social</h3>
            </div>
            <Link to="/social" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-teal-200 dark:ring-teal-800">
                <MessageCircle className="w-7 h-7 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h3>
            </div>
            <Link to="/chat" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Active Conversations</p>
              <p className="text-2xl font-bold">{chatData.activeConversations}</p>
              <p className="text-sm text-gray-600">{chatData.unreadMessages} unread messages</p>
            </div>
            
            {rooms.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Chats</p>
                <div className="space-y-1">
                  {rooms.slice(0, 2).map((room) => (
                    <div key={room.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{room.name}</span>
                      <div className={`w-2 h-2 rounded-full ${room.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/finance/transactions"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-800"
          >
            <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-green-200 dark:ring-green-800">
              <Plus className="w-5 h-5 text-white font-bold" strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Add Expense</span>
          </Link>
          
          <Link
            to="/fitness/workouts"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
          >
            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-blue-200 dark:ring-blue-800">
              <Activity className="w-5 h-5 text-white font-bold" strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Log Workout</span>
          </Link>
          
          <Link
            to="/travel/search"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
          >
            <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-purple-200 dark:ring-purple-800">
              <Plane className="w-5 h-5 text-white font-bold" strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Plan Trip</span>
          </Link>
          
          <Link
            to="/chat"
            className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-teal-200 dark:hover:border-teal-800"
          >
            <div className="w-10 h-10 bg-teal-500 dark:bg-teal-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-teal-200 dark:ring-teal-800">
              <MessageCircle className="w-5 h-5 text-white font-bold" strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">New Chat</span>
          </Link>
        </div>
      </motion.div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
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
