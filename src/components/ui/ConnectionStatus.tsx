import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { isBackendAvailable } from '../../config/api';
import { aiService } from '../../services/aiService';
import { useToastHelpers } from './Toast';

interface ConnectionStatusProps {
  showLabel?: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showLabel = true, 
  className = '' 
}) => {
  const { info } = useToastHelpers();
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [aiStatus, setAiStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const [backendAvailable, aiAvailable] = await Promise.all([
        isBackendAvailable(),
        aiService.isAIServiceAvailable(),
      ]);
      
      setBackendStatus(backendAvailable);
      setAiStatus(aiAvailable);
      setLastCheck(new Date());
      
      // Show info toast only when status changes from available to unavailable
      if (!backendAvailable && backendStatus === true) {
        info('Backend Offline', 'Backend is unavailable. Using local data and demo services.');
      }
      if (!aiAvailable && aiStatus === true) {
        info('AI Service Offline', 'AI service is unavailable. Using demo responses.');
      }
    } catch (error) {
      setBackendStatus(false);
      setAiStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();
    
    // Check periodically (every 30 seconds)
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Determine overall status
  const isOnline = backendStatus === true;
  const aiOnline = aiStatus === true;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Backend Status */}
      {backendStatus !== null && (
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}
          title={isOnline ? 'Backend connected' : 'Backend unavailable - using local data'}
        >
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
          {showLabel && (
            <span className={`text-xs font-medium ${
              isOnline 
                ? 'text-emerald-700 dark:text-emerald-400' 
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      )}

      {/* AI Status */}
      {aiStatus !== null && !aiOnline && (
        <div 
          className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          title="AI service unavailable - using demo responses"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          {showLabel && (
            <span className="text-xs font-medium text-red-700 dark:text-red-400">
              AI Offline
            </span>
          )}
        </div>
      )}

      {/* Loading/Refresh Indicator */}
      {isChecking && (
        <div className="flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
          <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
          {showLabel && (
            <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Checking...
            </span>
          )}
        </div>
      )}

      {/* Refresh Button */}
      {!isChecking && (
        <button
          onClick={checkStatus}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;

