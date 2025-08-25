import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const BudgetsPage = () => {
  // Mock data
  const budgets = [
    { id: 1, name: 'Monthly Budget', amount: 3500, spent: 2847.50, category: 'General' },
    { id: 2, name: 'Food & Dining', amount: 500, spent: 450, category: 'Food' },
    { id: 3, name: 'Transportation', amount: 400, spent: 320, category: 'Transport' },
    { id: 4, name: 'Entertainment', amount: 300, spent: 200, category: 'Entertainment' },
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
            <h1 className="text-3xl font-bold mb-2">Budgets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set and track your spending limits
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.amount) * 100
          const isOverBudget = percentage > 100
          
          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{budget.name}</h3>
                <span className="text-sm text-gray-500">{budget.category}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Spent</span>
                  <span className="font-semibold">{formatCurrency(budget.spent)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Budget</span>
                  <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      isOverBudget 
                        ? 'bg-red-500' 
                        : 'bg-gradient-to-r from-green-gradient-from to-green-gradient-to'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={isOverBudget ? 'text-red-500' : 'text-gray-500'}>
                    {percentage.toFixed(1)}% used
                  </span>
                  <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>
                    {isOverBudget 
                      ? formatCurrency(budget.spent - budget.amount) + ' over'
                      : formatCurrency(budget.amount - budget.spent) + ' left'
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetsPage
