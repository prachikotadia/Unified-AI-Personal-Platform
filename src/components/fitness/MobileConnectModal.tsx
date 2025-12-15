import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Bluetooth, 
  Wifi, 
  Share2, 
  Download, 
  Upload,
  Activity,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  Phone,
  Watch,
  QrCode,
  Copy,
  ExternalLink
} from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Device {
  id: string;
  name: string;
  type: 'android' | 'iphone' | 'smartwatch';
  connected: boolean;
  lastSync: string;
  batteryLevel: number;
  dataTypes: string[];
}

const MobileConnectModal: React.FC<MobileConnectModalProps> = ({ isOpen, onClose }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);

  // Mock devices
  const availableDevices: Device[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      type: 'iphone',
      connected: false,
      lastSync: '2024-01-15T10:30:00Z',
      batteryLevel: 85,
      dataTypes: ['steps', 'heart_rate', 'sleep', 'workouts', 'calories']
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      type: 'android',
      connected: false,
      lastSync: '2024-01-15T09:15:00Z',
      batteryLevel: 72,
      dataTypes: ['steps', 'heart_rate', 'sleep', 'workouts', 'calories', 'gps']
    },
    {
      id: '3',
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      connected: false,
      lastSync: '2024-01-15T10:25:00Z',
      batteryLevel: 45,
      dataTypes: ['steps', 'heart_rate', 'sleep', 'workouts', 'calories', 'ecg']
    },
    {
      id: '4',
      name: 'Google Pixel 8',
      type: 'android',
      connected: false,
      lastSync: '2024-01-14T18:45:00Z',
      batteryLevel: 90,
      dataTypes: ['steps', 'heart_rate', 'sleep', 'workouts', 'calories', 'gps']
    }
  ];

  const dataTypeOptions = [
    { key: 'steps', label: 'Step Count', icon: Activity },
    { key: 'heart_rate', label: 'Heart Rate', icon: Heart },
    { key: 'sleep', label: 'Sleep Data', icon: Zap },
    { key: 'workouts', label: 'Workouts', icon: Activity },
    { key: 'calories', label: 'Calories Burned', icon: Zap },
    { key: 'gps', label: 'GPS Location', icon: ExternalLink },
    { key: 'ecg', label: 'ECG Data', icon: Heart }
  ];

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setSelectedDataTypes(device.dataTypes);
  };

  const handleConnect = async () => {
    if (!selectedDevice) return;
    
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    // Simulate connection process
    for (let i = 0; i <= 100; i += 10) {
      setSyncProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setConnectionStatus('connected');
    setIsConnecting(false);
    
    // Update device status
    const updatedDevice = { ...selectedDevice, connected: true };
    setSelectedDevice(updatedDevice);
  };

  const handleDisconnect = () => {
    if (!selectedDevice) return;
    
    setConnectionStatus('disconnected');
    setSyncProgress(0);
    
    const updatedDevice = { ...selectedDevice, connected: false };
    setSelectedDevice(updatedDevice);
  };

  const handleSync = async () => {
    if (!selectedDevice || !selectedDevice.connected) return;
    
    setIsConnecting(true);
    setSyncProgress(0);
    
    // Simulate sync process
    for (let i = 0; i <= 100; i += 5) {
      setSyncProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsConnecting(false);
  };

  const handleShareData = () => {
    if (!selectedDevice) return;
    
    // Generate shareable data
    const shareData = {
      device: selectedDevice.name,
      dataTypes: selectedDataTypes,
      timestamp: new Date().toISOString(),
      url: `${window.location.origin}/fitness/share/${selectedDevice.id}`
    };
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    
    // Show success message
    alert('Fitness data copied to clipboard!');
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'iphone': return Phone;
      case 'android': return Smartphone;
      case 'smartwatch': return Watch;
      default: return Smartphone;
    }
  };

  const getConnectionMethod = (type: string) => {
    switch (type) {
      case 'iphone': return 'HealthKit';
      case 'android': return 'Google Fit';
      case 'smartwatch': return 'Bluetooth';
      default: return 'API';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mobile Device Connection</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Devices */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Devices</h3>
                <div className="space-y-3">
                  {availableDevices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    const isSelected = selectedDevice?.id === device.id;
                    
                    return (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handleDeviceSelect(device)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <DeviceIcon className="w-6 h-6 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-gray-500">
                                {getConnectionMethod(device.type)} • {device.batteryLevel}% battery
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {device.connected && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              device.connected 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {device.connected ? 'Connected' : 'Available'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">
                            Last sync: {new Date(device.lastSync).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Device Details & Controls */}
              <div>
                {selectedDevice ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Device Details</h3>
                      <div className="p-4 border border-white/10 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          {(() => {
                            const DeviceIcon = getDeviceIcon(selectedDevice.type);
                            return <DeviceIcon className="w-8 h-8 text-blue-500" />;
                          })()}
                          <div>
                            <h4 className="font-semibold">{selectedDevice.name}</h4>
                            <p className="text-sm text-gray-500">
                              {getConnectionMethod(selectedDevice.type)} Connection
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Battery:</span>
                            <span className="ml-2">{selectedDevice.batteryLevel}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 ${
                              selectedDevice.connected ? 'text-green-500' : 'text-gray-400'
                            }`}>
                              {selectedDevice.connected ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Types Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Data Types to Sync</h3>
                      <div className="space-y-2">
                        {dataTypeOptions.map((option) => {
                          const IconComponent = option.icon;
                          const isSelected = selectedDataTypes.includes(option.key);
                          
                          return (
                            <label
                              key={option.key}
                              className="flex items-center space-x-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDataTypes([...selectedDataTypes, option.key]);
                                  } else {
                                    setSelectedDataTypes(selectedDataTypes.filter(type => type !== option.key));
                                  }
                                }}
                                className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                              />
                              <IconComponent className="w-5 h-5 text-gray-400" />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connection Controls */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Connection Controls</h3>
                      <div className="space-y-3">
                        {!selectedDevice.connected ? (
                          <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {isConnecting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <Bluetooth className="w-5 h-5" />
                                <span>Connect Device</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <button
                              onClick={handleSync}
                              disabled={isConnecting}
                              className="w-full px-4 py-3 bg-gradient-to-r from-green-gradient-from to-green-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                              {isConnecting ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Syncing... {syncProgress}%</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  <span>Sync Data</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={handleShareData}
                              className="w-full px-4 py-3 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                            >
                              <Share2 className="w-5 h-5" />
                              <span>Share Fitness Data</span>
                            </button>
                            
                            <button
                              onClick={handleDisconnect}
                              className="w-full px-4 py-3 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-2"
                            >
                              <X className="w-5 h-5" />
                              <span>Disconnect</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sync Progress */}
                    {isConnecting && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Sync Progress</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Syncing data...</span>
                            <span>{syncProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to h-2 rounded-full transition-all duration-300"
                              style={{ width: `${syncProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Select a device to connect</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="flex items-center justify-center space-x-2 p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <QrCode className="w-5 h-5" />
                  <span>Scan QR Code</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <Copy className="w-5 h-5" />
                  <span>Copy Connection Code</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span>Open App Store</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileConnectModal;
