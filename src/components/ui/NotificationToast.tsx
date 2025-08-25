import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

const NotificationToast = ({ notification, onClose }: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(notification.id), 300)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    error: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }

  const Icon = icons[notification.type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          className="glass-card p-4 max-w-sm w-full"
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${colors[notification.type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onClose(notification.id), 300)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationToast
