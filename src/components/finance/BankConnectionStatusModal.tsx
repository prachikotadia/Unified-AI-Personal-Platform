import React from 'react';
import { motion } from 'framer-motion';
import { X, Building2, CheckCircle, AlertCircle, Clock, RefreshCw, Shield } from 'lucide-react';
import { BankConnection } from '../../services/bankIntegration';

interface BankConnectionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: BankConnection[];
  onReconnect?: (connectionId: string) => void;
}

const BankConnectionStatusModal: React.FC<BankConnectionStatusModalProps> = ({
  isOpen,
  onClose,
  connections,
  onReconnect
}) => {
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'disconnected':
        return <X className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'disconnected':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'pending':
        return 'Pending';
      case 'error':
        return 'Error';
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
            <Building2 className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Bank Connection Status</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {connections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No bank connections found</p>
            </div>
          ) : (
            connections.map((connection) => (
              <div
                key={connection.id}
                className={`border-2 rounded-lg p-4 ${getStatusColor(connection.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(connection.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{connection.bank_name}</p>
                        <span className="px-2 py-0.5 bg-white rounded text-xs font-medium capitalize">
                          {connection.account_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Account: {connection.account_number}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className={`px-2 py-1 rounded ${getStatusColor(connection.status)}`}>
                          {getStatusText(connection.status)}
                        </span>
                        {connection.last_sync && (
                          <span>
                            Last sync: {new Date(connection.last_sync).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {connection.status === 'connected' && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                          <Shield size={14} />
                          <span>Securely connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {onReconnect && connection.status !== 'connected' && (
                    <button
                      onClick={() => onReconnect(connection.id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <RefreshCw size={14} />
                      Reconnect
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

export default BankConnectionStatusModal;

