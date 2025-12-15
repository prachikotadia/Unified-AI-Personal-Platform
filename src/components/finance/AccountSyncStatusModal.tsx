import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface SyncStatus {
  accountId: string;
  accountName: string;
  status: 'syncing' | 'success' | 'error' | 'pending';
  lastSync?: string;
  error?: string;
}

interface AccountSyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatuses: SyncStatus[];
  onSyncNow?: (accountId: string) => void;
}

const AccountSyncStatusModal: React.FC<AccountSyncStatusModalProps> = ({
  isOpen,
  onClose,
  syncStatuses,
  onSyncNow
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="text-blue-600 animate-spin" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <XCircle className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Account Sync Status</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {syncStatuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No accounts to sync</p>
            </div>
          ) : (
            syncStatuses.map((sync) => (
              <div
                key={sync.accountId}
                className={`border-2 rounded-lg p-4 ${getStatusColor(sync.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <div>
                      <p className="font-semibold">{sync.accountName}</p>
                      <p className="text-sm text-gray-600">
                        {getStatusText(sync.status)}
                        {sync.lastSync && ` • Last sync: ${new Date(sync.lastSync).toLocaleString()}`}
                      </p>
                      {sync.error && (
                        <p className="text-sm text-red-600 mt-1">{sync.error}</p>
                      )}
                    </div>
                  </div>
                  {onSyncNow && sync.status !== 'syncing' && (
                    <button
                      onClick={() => onSyncNow(sync.accountId)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSyncStatusModal;

