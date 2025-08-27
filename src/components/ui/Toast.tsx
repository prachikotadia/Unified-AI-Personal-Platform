import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  ShoppingCart,
  Heart,
  Star,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  persistent?: boolean;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (toast.persistent) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getToastStyles = () => {
    const baseStyles = 'flex items-start space-x-3 p-4 rounded-lg shadow-lg border max-w-sm w-full';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
      case 'loading':
        return `${baseStyles} bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200`;
      default:
        return `${baseStyles} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = () => {
    if (toast.icon) return toast.icon;

    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'loading':
        return (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        );
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={getToastStyles()}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast Context and Provider
interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({ type: 'success', title, message, ...options });
    },
    error: (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({ type: 'error', title, message, ...options });
    },
    warning: (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({ type: 'warning', title, message, ...options });
    },
    info: (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({ type: 'info', title, message, ...options });
    },
    loading: (title: string, message?: string, options?: Partial<Toast>) => {
      showToast({ type: 'loading', title, message, persistent: true, ...options });
    },
    // Marketplace specific toasts
    addedToCart: (productName: string) => {
      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${productName} has been added to your cart`,
        icon: <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />,
        action: {
          label: 'View Cart',
          onClick: () => window.location.href = '/marketplace/cart'
        }
      });
    },
    addedToWishlist: (productName: string) => {
      showToast({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${productName} has been added to your wishlist`,
        icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
      });
    },
    priceAlertCreated: (productName: string) => {
      showToast({
        type: 'success',
        title: 'Price Alert Created',
        message: `You'll be notified when the price of ${productName} changes`,
        icon: <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      });
    },
    reviewSubmitted: () => {
      showToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for your review!',
        icon: <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      });
    },
    itemRemoved: (itemName: string) => {
      showToast({
        type: 'info',
        title: 'Item Removed',
        message: `${itemName} has been removed`,
        icon: <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      });
    },
    downloadStarted: (fileName: string) => {
      showToast({
        type: 'success',
        title: 'Download Started',
        message: `${fileName} is being downloaded`,
        icon: <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
      });
    },
    uploadComplete: (fileName: string) => {
      showToast({
        type: 'success',
        title: 'Upload Complete',
        message: `${fileName} has been uploaded successfully`,
        icon: <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
      });
    }
  };
};

export default ToastItem;
