/**
 * Global Connection Status Hook
 * Provides unified connection status checking across all modules
 */

import { useState, useEffect, useCallback } from 'react';
import { isBackendAvailable } from '../config/api';
import aiService from '../services/aiService';

export interface ConnectionStatus {
  backend: boolean | null;
  ai: boolean | null;
  isLoading: boolean;
  lastChecked: Date | null;
}

export interface UseConnectionStatusOptions {
  checkInterval?: number; // milliseconds
  autoCheck?: boolean;
}

export const useConnectionStatus = (options: UseConnectionStatusOptions = {}) => {
  const { checkInterval = 30000, autoCheck = true } = options;
  
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: null,
    ai: null,
    isLoading: false,
    lastChecked: null,
  });

  const checkStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [backendAvailable, aiAvailable] = await Promise.all([
        isBackendAvailable(),
        aiService.isAIServiceAvailable(),
      ]);
      
      setStatus({
        backend: backendAvailable,
        ai: aiAvailable,
        isLoading: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: false,
        ai: false,
        isLoading: false,
        lastChecked: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkStatus();
    
    // Set up interval if autoCheck is enabled
    if (autoCheck) {
      const interval = setInterval(checkStatus, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkStatus, checkInterval, autoCheck]);

  return {
    ...status,
    checkStatus,
    isOnline: status.backend === true,
    isAIAvailable: status.ai === true,
    isOffline: status.backend === false,
  };
};

