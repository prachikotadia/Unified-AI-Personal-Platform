import { fitnessAPIService } from './fitnessAPI';
import { getWebSocketURL, isBackendAvailable } from '../config/api';

// Live Sync Service for real-time mobile device connectivity
export class LiveSyncService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Device connection status
  private connectedDevices: Map<string, DeviceInfo> = new Map();
  private lastSyncTime: Date = new Date();

  constructor() {
    // Only initialize WebSocket if backend supports it
    // For now, skip WebSocket initialization to avoid errors
    // Uncomment when backend WebSocket endpoint is implemented
    // this.initializeWebSocket();
    this.startPeriodicSync();
  }

  // Initialize WebSocket connection for real-time updates
  private async initializeWebSocket() {
    try {
      // Check if backend is available before attempting WebSocket connection
      const isAvailable = await isBackendAvailable();
      if (!isAvailable) {
        // Silently skip WebSocket connection when backend is not available
        this.emit('connection', { status: 'disconnected', reason: 'backend_unavailable' });
        return;
      }

      const wsUrl = getWebSocketURL('fitness');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Silently handle connection - don't log
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          // Silently handle parse errors
          this.emit('error', error);
        }
      };

      this.ws.onclose = () => {
        // Silently handle disconnection
        this.emit('connection', { status: 'disconnected' });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        // Completely suppress WebSocket errors - expected when endpoint doesn't exist
        this.emit('error', error);
      };
    } catch (error) {
      // Silently handle initialization errors
      this.emit('error', error);
    }
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'device_connected':
        this.handleDeviceConnected(data.device);
        break;
      case 'device_disconnected':
        this.handleDeviceDisconnected(data.deviceId);
        break;
      case 'fitness_data_update':
        this.handleFitnessDataUpdate(data.data);
        break;
      case 'sync_progress':
        this.handleSyncProgress(data.progress);
        break;
      case 'error':
        this.emit('error', data.error);
        break;
      default:
        // Silently handle unknown message types
        this.emit('unknown_message', data);
    }
  }

  // Handle device connection
  private handleDeviceConnected(device: DeviceInfo) {
    this.connectedDevices.set(device.id, device);
    this.emit('device_connected', device);
    // Silently handle - don't log
  }

  // Handle device disconnection
  private handleDeviceDisconnected(deviceId: string) {
    const device = this.connectedDevices.get(deviceId);
    this.connectedDevices.delete(deviceId);
    this.emit('device_disconnected', device);
    // Silently handle - don't log
  }

  // Handle fitness data updates
  private handleFitnessDataUpdate(data: FitnessDataUpdate) {
    this.lastSyncTime = new Date();
    this.emit('data_update', data);
    // Silently handle - don't log
  }

  // Handle sync progress updates
  private handleSyncProgress(progress: SyncProgress) {
    this.emit('sync_progress', progress);
  }

  // Handle WebSocket reconnection
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // Silently attempt reconnection - don't log
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      // Silently handle max attempts - don't log errors
      this.emit('connection_failed', { attempts: this.reconnectAttempts });
    }
  }

  // Start periodic sync with mobile devices
  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      this.syncWithDevices();
    }, 30000); // Sync every 30 seconds
  }

  // Sync data with connected devices
  private async syncWithDevices() {
    if (this.connectedDevices.size === 0) return;

    try {
      const devices = Array.from(this.connectedDevices.values());
      
      for (const device of devices) {
        await this.syncDeviceData(device);
      }
    } catch (error) {
      // Silently handle sync errors
      this.emit('error', error);
    }
  }

  // Sync data with a specific device
  private async syncDeviceData(device: DeviceInfo) {
    try {
      // Send sync request to device
      this.sendWebSocketMessage({
        type: 'sync_request',
        deviceId: device.id,
        dataTypes: device.supportedDataTypes
      });

      // Update device last sync time
      device.lastSync = new Date();
      this.connectedDevices.set(device.id, device);
    } catch (error) {
      // Silently handle device sync errors
      this.emit('error', error);
    }
  }

  // Send message through WebSocket
  private sendWebSocketMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Silently handle - WebSocket not connected (expected when endpoint doesn't exist)
    }
  }

  // Connect to a mobile device
  async connectDevice(deviceInfo: DeviceConnectionInfo): Promise<ConnectionResult> {
    try {
      // Send connection request
      this.sendWebSocketMessage({
        type: 'connect_device',
        device: deviceInfo
      });

      // Wait for connection response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        const handleConnection = (data: any) => {
          if (data.type === 'device_connected' && data.device.id === deviceInfo.id) {
            clearTimeout(timeout);
            this.removeListener('device_connected', handleConnection);
            resolve({ success: true, device: data.device });
          }
        };

        this.addListener('device_connected', handleConnection);
      });
    } catch (error) {
      // Silently handle connection errors
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  // Disconnect from a device
  async disconnectDevice(deviceId: string): Promise<boolean> {
    try {
      this.sendWebSocketMessage({
        type: 'disconnect_device',
        deviceId
      });

      this.connectedDevices.delete(deviceId);
      this.emit('device_disconnected', { id: deviceId });
      return true;
    } catch (error) {
      // Silently handle disconnection errors
      return false;
    }
  }

  // Request data sync from device
  async requestDataSync(deviceId: string, dataTypes: string[]): Promise<boolean> {
    try {
      this.sendWebSocketMessage({
        type: 'sync_request',
        deviceId,
        dataTypes
      });
      return true;
    } catch (error) {
      // Silently handle sync request errors
      return false;
    }
  }

  // Get connected devices
  getConnectedDevices(): DeviceInfo[] {
    return Array.from(this.connectedDevices.values());
  }

  // Get device connection status
  getDeviceStatus(deviceId: string): DeviceInfo | null {
    return this.connectedDevices.get(deviceId) || null;
  }

  // Get last sync time
  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  // Add event listener
  addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Remove event listener
  removeListener(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Silently handle event listener errors
        }
      });
    }
  }

  // Cleanup resources
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
    this.listeners.clear();
    this.connectedDevices.clear();
  }
}

// Types
export interface DeviceInfo {
  id: string;
  name: string;
  type: 'android' | 'iphone' | 'smartwatch';
  connected: boolean;
  lastSync: Date;
  batteryLevel: number;
  supportedDataTypes: string[];
  connectionMethod: 'bluetooth' | 'wifi' | 'healthkit' | 'googlefit';
}

export interface DeviceConnectionInfo {
  id: string;
  name: string;
  type: 'android' | 'iphone' | 'smartwatch';
  connectionMethod: 'bluetooth' | 'wifi' | 'healthkit' | 'googlefit';
  supportedDataTypes: string[];
}

export interface ConnectionResult {
  success: boolean;
  device?: DeviceInfo;
  error?: string;
}

export interface FitnessDataUpdate {
  deviceId: string;
  dataType: string;
  value: any;
  timestamp: Date;
  unit?: string;
}

export interface SyncProgress {
  deviceId: string;
  progress: number;
  status: 'syncing' | 'completed' | 'failed';
  message?: string;
}

// Create singleton instance
export const liveSyncService = new LiveSyncService();

// Export for use in components
export default liveSyncService;
