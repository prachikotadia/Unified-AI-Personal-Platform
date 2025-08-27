import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  CreditCard, 
  Target,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Share2
} from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ limit: 50 });
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Note: This would require a delete endpoint in the API
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      transaction: <CreditCard size={20} />,
      budget_alert: <AlertCircle size={20} />,
      credit_score: <TrendingUp size={20} />,
      offer: <CheckCircle size={20} />,
      goal: <Target size={20} />,
      system: <Info size={20} />,
    };
    return iconMap[type] || <Info size={20} />;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      transaction: 'text-blue-600 bg-blue-100',
      budget_alert: 'text-orange-600 bg-orange-100',
      credit_score: 'text-green-600 bg-green-100',
      offer: 'text-purple-600 bg-purple-100',
      goal: 'text-indigo-600 bg-indigo-100',
      system: 'text-gray-600 bg-gray-100',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colorMap[priority] || 'text-gray-500';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-200 bg-gray-50"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="email" defaultChecked />
                        <label htmlFor="email">Email notifications</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="push" defaultChecked />
                        <label htmlFor="push">Push notifications</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="sms" />
                        <label htmlFor="sms">SMS notifications</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="in_app" defaultChecked />
                        <label htmlFor="in_app">In-app notifications</label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex gap-2">
                {(['all', 'unread', 'read'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark all as read
                </button>
                <button
                  onClick={loadNotifications}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-600">No notifications to display</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                                <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                                {notification.action_url && (
                                  <button className="text-blue-600 hover:text-blue-700">
                                    {notification.action_text || 'View Details'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors text-red-600"
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download size={16} />
                  Export
                </button>
                <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
