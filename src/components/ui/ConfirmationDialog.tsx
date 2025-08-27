import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Trash2, 
  LogOut, 
  X, 
  Check, 
  AlertCircle,
  Shield,
  Lock,
  UserX,
  Settings,
  Heart
} from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText,
  cancelText = 'Cancel',
  icon,
  destructive = true,
  loading = false,
  children
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200 dark:border-yellow-800',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      case 'info':
        return {
          icon: <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'success':
        return {
          icon: <Check className="w-6 h-6 text-green-600 dark:text-green-400" />,
          button: 'bg-green-600 hover:bg-green-700 text-white',
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-green-50 dark:bg-green-900/20'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50 dark:bg-red-900/20'
        };
    }
  };

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'danger':
        return 'Delete';
      case 'warning':
        return 'Continue';
      case 'info':
        return 'Confirm';
      case 'success':
        return 'Proceed';
      default:
        return 'Confirm';
    }
  };

  const styles = getTypeStyles();
  const finalConfirmText = confirmText || getDefaultConfirmText();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50 transition-opacity"
              onClick={onClose}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${styles.bg} ${styles.border} border-l-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-700 sm:mx-0 sm:h-10 sm:w-10">
                    {icon || styles.icon}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                      </p>
                      {children && (
                        <div className="mt-3">
                          {children}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={loading || isConfirming}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.button}`}
                  onClick={handleConfirm}
                >
                  {loading || isConfirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isConfirming ? 'Processing...' : 'Loading...'}
                    </>
                  ) : (
                    finalConfirmText
                  )}
                </button>
                <button
                  type="button"
                  disabled={loading || isConfirming}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:mt-0 sm:w-auto"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Hook for using confirmation dialogs
export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmationDialogProps>>({});
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const confirm = (config: Partial<ConfirmationDialogProps>): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig(config);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  return {
    confirm,
    ConfirmationDialog: (
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={config.title || 'Confirm Action'}
        message={config.message || 'Are you sure you want to proceed?'}
        type={config.type}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        icon={config.icon}
        destructive={config.destructive}
        loading={config.loading}
      >
        {config.children}
      </ConfirmationDialog>
    )
  };
};

// Predefined confirmation dialogs
export const usePredefinedConfirmations = () => {
  const { confirm } = useConfirmationDialog();

  return {
    // Delete confirmation
    confirmDelete: (itemName: string, onDelete: () => void) => {
      confirm({
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        destructive: true
      }).then((confirmed) => {
        if (confirmed) {
          onDelete();
        }
      });
    },

    // Logout confirmation
    confirmLogout: (onLogout: () => void) => {
      confirm({
        title: 'Logout Confirmation',
        message: 'Are you sure you want to logout? Any unsaved changes will be lost.',
        type: 'warning',
        confirmText: 'Logout',
        icon: <LogOut className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      }).then((confirmed) => {
        if (confirmed) {
          onLogout();
        }
      });
    },

    // Clear data confirmation
    confirmClearData: (dataType: string, onClear: () => void) => {
      confirm({
        title: 'Clear Data Confirmation',
        message: `Are you sure you want to clear all ${dataType}? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Clear All',
        icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        destructive: true
      }).then((confirmed) => {
        if (confirmed) {
          onClear();
        }
      });
    },

    // Unsaved changes confirmation
    confirmUnsavedChanges: (onDiscard: () => void) => {
      confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to leave?',
        type: 'warning',
        confirmText: 'Leave',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      }).then((confirmed) => {
        if (confirmed) {
          onDiscard();
        }
      });
    },

    // Marketplace specific confirmations
    confirmRemoveFromCart: (productName: string, onRemove: () => void) => {
      confirm({
        title: 'Remove from Cart',
        message: `Are you sure you want to remove "${productName}" from your cart?`,
        type: 'warning',
        confirmText: 'Remove',
        icon: <Trash2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      }).then((confirmed) => {
        if (confirmed) {
          onRemove();
        }
      });
    },

    confirmClearCart: (onClear: () => void) => {
      confirm({
        title: 'Clear Cart',
        message: 'Are you sure you want to clear your entire cart?',
        type: 'danger',
        confirmText: 'Clear Cart',
        icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
        destructive: true
      }).then((confirmed) => {
        if (confirmed) {
          onClear();
        }
      });
    },

    confirmRemoveFromWishlist: (productName: string, onRemove: () => void) => {
      confirm({
        title: 'Remove from Wishlist',
        message: `Are you sure you want to remove "${productName}" from your wishlist?`,
        type: 'warning',
        confirmText: 'Remove',
        icon: <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
      }).then((confirmed) => {
        if (confirmed) {
          onRemove();
        }
      });
    },

    confirmCancelOrder: (orderNumber: string, onCancel: () => void) => {
      confirm({
        title: 'Cancel Order',
        message: `Are you sure you want to cancel order #${orderNumber}?`,
        type: 'danger',
        confirmText: 'Cancel Order',
        icon: <X className="w-6 h-6 text-red-600 dark:text-red-400" />,
        destructive: true
      }).then((confirmed) => {
        if (confirmed) {
          onCancel();
        }
      });
    }
  };
};

export default ConfirmationDialog;
