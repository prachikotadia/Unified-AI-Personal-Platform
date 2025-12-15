import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Sparkles, 
  Brain,
  Clock,
  Star,
  MessageCircle,
  Search,
  Bell,
  Play
} from 'lucide-react'
import { useAIStore } from '../../store/ai'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatDateTime } from '../../lib/utils'

interface AIInsightsProps {
  type?: 'finance' | 'marketplace' | 'fitness' | 'travel' | 'social' | 'chat'
  limit?: number
  className?: string
}

const AIInsights = ({ type, limit = 3, className = '' }: AIInsightsProps) => {
  const { 
    insights, 
    recommendations, 
    predictions,
    searchProducts,
    createBudget,
    createWorkoutPlan,
    planTrip,
    sendMessage,
    createSocialPost,
    setReminder,
    executeAction
  } = useAIStore()
  const { addNotification } = useNotifications()
  const [error, setError] = useState<string | null>(null);
  
  // Error handling wrapper
  useEffect(() => {
    try {
      // Component will render with available data
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI insights');
      console.error('AI Insights error:', err);
    }
  }, [insights, recommendations, predictions]);

  const filteredInsights = type 
    ? insights.filter(insight => insight.type === type)
    : insights

  const filteredRecommendations = type
    ? recommendations.filter(rec => rec.type === type)
    : recommendations

  const filteredPredictions = type
    ? predictions.filter(pred => pred.type === type)
    : predictions

  const handleActionClick = async (item: any) => {
    try {
      if (!item.actionType) return

      switch (item.actionType) {
        case 'product_search':
          const products = searchProducts(item.actionData?.query || '')
          addNotification({
            type: 'success',
            title: 'Products Found',
            message: `Found ${products.length} products`,
            duration: 5000
          })
          break
        case 'budget_create':
          const budget = createBudget(item.actionData)
          addNotification({
            type: 'success',
            title: 'Budget Created',
            message: `Created ${item.actionData.category} budget for $${item.actionData.amount}`,
            duration: 5000
          })
          break
        case 'workout_plan':
          const workout = createWorkoutPlan(item.actionData)
          addNotification({
            type: 'success',
            title: 'Workout Plan Created',
            message: `Created ${item.actionData.type} workout plan`,
            duration: 5000
          })
          break
        case 'trip_plan':
          const trip = planTrip(item.actionData)
          addNotification({
            type: 'success',
            title: 'Trip Planned',
            message: `Planned trip to ${item.actionData.destination}`,
            duration: 5000
          })
          break
        case 'social_post':
          const post = createSocialPost(item.actionData)
          addNotification({
            type: 'success',
            title: 'Post Created',
            message: 'Social post created successfully',
            duration: 5000
          })
          break
        case 'reminder':
          const reminder = setReminder(item.actionData)
          addNotification({
            type: 'success',
            title: 'Reminder Set',
            message: `Reminder set for ${item.actionData.title}`,
            duration: 5000
          })
          break
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to execute action. Please try again.',
        duration: 5000
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'finance': return <TrendingUp className="w-4 h-4" />
      case 'fitness': return <Target className="w-4 h-4" />
      case 'marketplace': return <Zap className="w-4 h-4" />
      case 'travel': return <Sparkles className="w-4 h-4" />
      case 'social': return <Brain className="w-4 h-4" />
      case 'chat': return <Brain className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'finance': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case 'fitness': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
      case 'marketplace': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
      case 'travel': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
      case 'social': return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20'
      case 'chat': return 'text-teal-500 bg-teal-100 dark:bg-teal-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'product_search': return <Search className="w-4 h-4" />
      case 'budget_create': return <TrendingUp className="w-4 h-4" />
      case 'workout_plan': return <Target className="w-4 h-4" />
      case 'trip_plan': return <Sparkles className="w-4 h-4" />
      case 'social_post': return <Brain className="w-4 h-4" />
      case 'reminder': return <Bell className="w-4 h-4" />
      default: return <Play className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Insights */}
      {filteredInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          
          <div className="space-y-4">
            {filteredInsights.slice(0, limit).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(insight.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(insight.type)}`}>
                      {insight.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDateTime(insight.timestamp)}
                  </span>
                  {insight.action && insight.actionType && (
                    <motion.button
                      onClick={() => handleActionClick(insight)}
                      className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getActionIcon(insight.actionType)}
                      <span>{insight.action}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {filteredRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {filteredRecommendations.slice(0, limit).map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(rec.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {rec.category}
                  </span>
                </div>
                
                <h4 className="font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rec.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDateTime(rec.timestamp)}
                  </span>
                  {rec.action && rec.actionType && (
                    <motion.button
                      onClick={() => handleActionClick(rec)}
                      className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getActionIcon(rec.actionType)}
                      <span>{rec.action}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Predictions */}
      {filteredPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">AI Predictions</h3>
          </div>
          
          <div className="space-y-4">
            {filteredPredictions.slice(0, limit).map((pred, index) => (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(pred.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pred.type)}`}>
                      {pred.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {pred.timeframe}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-1">{pred.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {pred.prediction}
                </p>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Key factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {pred.factors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDateTime(pred.timestamp)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getConfidenceColor(pred.confidence)}`}>
                      {Math.round(pred.confidence * 100)}% confidence
                    </span>
                    {pred.action && pred.actionType && (
                      <motion.button
                        onClick={() => handleActionClick(pred)}
                        className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {getActionIcon(pred.actionType)}
                        <span>{pred.action}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AIInsights
