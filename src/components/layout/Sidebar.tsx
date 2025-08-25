import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Home, 
  DollarSign, 
  ShoppingCart, 
  Activity, 
  Plane, 
  UserPlus, 
  Settings,
  Sparkles
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'Fitness', href: '/fitness', icon: Activity },
    { name: 'Travel', href: '/travel', icon: Plane },
    { name: 'Social', href: '/social', icon: UserPlus },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ]

  const quickActions = [
    { name: 'Add Expense', href: '/finance/transactions', icon: Plus, color: 'text-green-500' },
    { name: 'Log Workout', href: '/fitness/workouts', icon: TrendingUp, color: 'text-blue-500' },
    { name: 'Share Trip', href: '/travel', icon: Users, color: 'text-purple-500' },
    { name: 'New Chat', href: '/chat', icon: MessageCircle, color: 'text-orange-500' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 glass-card z-50 lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Main Navigation
                  </h3>
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                          location.pathname === item.href
                            ? "nav-link-active"
                            : "nav-link"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div className="pt-6 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Actions
                  </h3>
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.name}
                        to={action.href}
                        onClick={onClose}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium nav-link hover:bg-white/10 transition-all duration-300"
                      >
                        <Icon className={cn("h-4 w-4", action.color)} />
                        <span>{action.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <h4 className="text-sm font-medium">AI Assistant</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Get personalized recommendations and insights
                  </p>
                  <button className="w-full btn-primary text-sm py-2">
                    Ask AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
