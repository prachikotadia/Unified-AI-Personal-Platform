import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Plus, DollarSign, Activity, Plane, ShoppingCart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const quickActions = [
    {
      name: 'Add Expense',
      icon: DollarSign,
      href: '/finance/transactions',
      color: 'from-green-gradient-from to-green-gradient-to'
    },
    {
      name: 'Log Workout',
      icon: Activity,
      href: '/fitness/workouts',
      color: 'from-blue-gradient-from to-blue-gradient-to'
    },
    {
      name: 'Plan Trip',
      icon: Plane,
      href: '/travel/search',
      color: 'from-purple-gradient-from to-purple-gradient-to'
    },
    {
      name: 'Add to Cart',
      icon: ShoppingCart,
      href: '/marketplace',
      color: 'from-orange-gradient-from to-orange-gradient-to'
    },
    {
      name: 'New Chat',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-pink-gradient-from to-pink-gradient-to'
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 glass-card p-3 rounded-full hover:scale-105 transition-transform duration-200"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{action.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>
    </div>
  )
}

export default FloatingActionButton
