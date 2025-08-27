import { useState, useEffect, useCallback } from 'react';
import { liveSyncService, DeviceInfo, DeviceConnectionInfo, ConnectionResult, FitnessDataUpdate, SyncProgress } from '../services/liveSyncService';

export const useLiveSync = () => {
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncProgress, setSyncProgress] = useState<Map<string, SyncProgress>>(new Map());
  const [recentUpdates, setRecentUpdates] = useState<FitnessDataUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize live sync service
  useEffect(() => {
    const handleConnection = (data: any) => {
      setConnectionStatus(data.status);
      if (data.status === 'disconnected') {
        setError('Connection lost. Attempting to reconnect...');
      } else {
        setError(null);
      }
    };

    const handleDeviceConnected = (device: DeviceInfo) => {
      setConnectedDevices(prev => {
        const existing = prev.find(d => d.id === device.id);
        if (existing) {
          return prev.map(d => d.id === device.id ? device : d);
        }
        return [...prev, device];
      });
    };

    const handleDeviceDisconnected = (device: DeviceInfo | null) => {
      if (device) {
        setConnectedDevices(prev => prev.filter(d => d.id !== device.id));
      }
    };

    const handleDataUpdate = (update: FitnessDataUpdate) => {
      setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
      setLastSyncTime(new Date());
    };

    const handleSyncProgress = (progress: SyncProgress) => {
      setSyncProgress(prev => new Map(prev.set(progress.deviceId, progress)));
    };

    const handleError = (error: any) => {
      setError(error.message || 'An error occurred');
    };

    const handleConnectionFailed = (data: any) => {
      setError(`Failed to connect after ${data.attempts} attempts`);
    };

    // Add event listeners
    liveSyncService.addListener('connection', handleConnection);
    liveSyncService.addListener('device_connected', handleDeviceConnected);
    liveSyncService.addListener('device_disconnected', handleDeviceDisconnected);
    liveSyncService.addListener('data_update', handleDataUpdate);
    liveSyncService.addListener('sync_progress', handleSyncProgress);
    liveSyncService.addListener('error', handleError);
    liveSyncService.addListener('connection_failed', handleConnectionFailed);

    // Initialize connected devices
    setConnectedDevices(liveSyncService.getConnectedDevices());
    setLastSyncTime(liveSyncService.getLastSyncTime());

    // Cleanup
    return () => {
      liveSyncService.removeListener('connection', handleConnection);
      liveSyncService.removeListener('device_connected', handleDeviceConnected);
      liveSyncService.removeListener('device_disconnected', handleDeviceDisconnected);
      liveSyncService.removeListener('data_update', handleDataUpdate);
      liveSyncService.removeListener('sync_progress', handleSyncProgress);
      liveSyncService.removeListener('error', handleError);
      liveSyncService.removeListener('connection_failed', handleConnectionFailed);
    };
  }, []);

  // Connect to a device
  const connectDevice = useCallback(async (deviceInfo: DeviceConnectionInfo): Promise<ConnectionResult> => {
    try {
      setError(null);
      const result = await liveSyncService.connectDevice(deviceInfo);
      
      if (!result.success) {
        setError(result.error || 'Failed to connect device');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect device';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Disconnect from a device
  const disconnectDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const success = await liveSyncService.disconnectDevice(deviceId);
      if (!success) {
        setError('Failed to disconnect device');
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect device';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Request data sync from device
  const requestDataSync = useCallback(async (deviceId: string, dataTypes: string[]): Promise<boolean> => {
    try {
      const success = await liveSyncService.requestDataSync(deviceId, dataTypes);
      if (!success) {
        setError('Failed to request data sync');
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request data sync';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Get device status
  const getDeviceStatus = useCallback((deviceId: string): DeviceInfo | null => {
    return liveSyncService.getDeviceStatus(deviceId);
  }, []);

  // Get sync progress for a device
  const getDeviceSyncProgress = useCallback((deviceId: string): SyncProgress | null => {
    return syncProgress.get(deviceId) || null;
  }, [syncProgress]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get recent updates for a specific data type
  const getRecentUpdatesByType = useCallback((dataType: string): FitnessDataUpdate[] => {
    return recentUpdates.filter(update => update.dataType === dataType);
  }, [recentUpdates]);

  // Get latest update for a specific data type
  const getLatestUpdateByType = useCallback((dataType: string): FitnessDataUpdate | null => {
    const updates = getRecentUpdatesByType(dataType);
    return updates.length > 0 ? updates[0] : null;
  }, [getRecentUpdatesByType]);

  // Check if device is connected
  const isDeviceConnected = useCallback((deviceId: string): boolean => {
    return connectedDevices.some(device => device.id === deviceId && device.connected);
  }, [connectedDevices]);

  // Get connected devices count
  const getConnectedDevicesCount = useCallback((): number => {
    return connectedDevices.filter(device => device.connected).length;
  }, [connectedDevices]);

  // Get devices by type
  const getDevicesByType = useCallback((type: 'android' | 'iphone' | 'smartwatch'): DeviceInfo[] => {
    return connectedDevices.filter(device => device.type === type);
  }, [connectedDevices]);

  // Get devices by connection method
  const getDevicesByConnectionMethod = useCallback((method: 'bluetooth' | 'wifi' | 'healthkit' | 'googlefit'): DeviceInfo[] => {
    return connectedDevices.filter(device => device.connectionMethod === method);
  }, [connectedDevices]);

  // Get devices with low battery
  const getDevicesWithLowBattery = useCallback((threshold: number = 20): DeviceInfo[] => {
    return connectedDevices.filter(device => device.batteryLevel <= threshold);
  }, [connectedDevices]);

  // Get devices that need sync (not synced in last hour)
  const getDevicesNeedingSync = useCallback((): DeviceInfo[] => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return connectedDevices.filter(device => device.lastSync < oneHourAgo);
  }, [connectedDevices]);

  return {
    // State
    connectedDevices,
    connectionStatus,
    lastSyncTime,
    syncProgress,
    recentUpdates,
    error,

    // Actions
    connectDevice,
    disconnectDevice,
    requestDataSync,
    clearError,

    // Getters
    getDeviceStatus,
    getDeviceSyncProgress,
    getRecentUpdatesByType,
    getLatestUpdateByType,
    isDeviceConnected,
    getConnectedDevicesCount,
    getDevicesByType,
    getDevicesByConnectionMethod,
    getDevicesWithLowBattery,
    getDevicesNeedingSync,

    // Computed values
    hasConnectedDevices: connectedDevices.length > 0,
    hasActiveSync: Array.from(syncProgress.values()).some(progress => progress.status === 'syncing'),
    lastUpdateTime: recentUpdates.length > 0 ? recentUpdates[0].timestamp : null,
  };
};

export default useLiveSync;
