import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const ForecastPage = () => {
  // Mock forecast data
  const forecastData = [
    { month: 'Jan', actual: 2847, predicted: 2900 },
    { month: 'Feb', actual: 3100, predicted: 3050 },
    { month: 'Mar', actual: 2950, predicted: 3200 },
    { month: 'Apr', actual: null, predicted: 3150 },
    { month: 'May', actual: null, predicted: 3300 },
    { month: 'Jun', actual: null, predicted: 3250 },
  ]

  const insights = [
    { type: 'positive', text: 'You\'re 15% under budget this month' },
    { type: 'neutral', text: 'Food spending is trending upward' },
    { type: 'positive', text: 'Transportation costs decreased by 20%' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Forecast</h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered spending predictions and insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">Updated daily</span>
          </div>
        </div>
      </motion.div>

      {/* Forecast Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">6-Month Spending Forecast</h2>
        
        <div className="space-y-4">
          {forecastData.map((data, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm font-medium">{data.month}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Predicted</span>
                  <span className="text-sm font-semibold">{formatCurrency(data.predicted)}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-3 rounded-full"
                    style={{ width: `${(data.predicted / 4000) * 100}%` }}
                  />
                </div>
                
                {data.actual && (
                  <>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Actual</span>
                      <span className="text-sm font-semibold">{formatCurrency(data.actual)}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-gradient-from to-green-gradient-to h-2 rounded-full"
                        style={{ width: `${(data.actual / 4000) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      {data.actual < data.predicted ? (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${
                        data.actual < data.predicted ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {data.actual < data.predicted ? 'Under' : 'Over'} by {formatCurrency(Math.abs(data.actual - data.predicted))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">AI Insights</h2>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start space-x-3 p-4 rounded-lg bg-white/5"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                insight.type === 'positive' ? 'bg-green-500' : 
                insight.type === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <p className="text-sm">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Good News!</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your spending patterns suggest you'll save $500 more than expected this quarter.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Suggestion</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Consider setting up automatic transfers to your savings account.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ForecastPage
