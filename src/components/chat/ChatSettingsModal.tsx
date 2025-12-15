import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, BellOff, Volume2, VolumeX, Moon, Sun, Palette } from 'lucide-react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: {
    notifications: boolean;
    sound: boolean;
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
  };
  onSaveSettings: (settings: any) => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings
}) => {
  const [settings, setSettings] = useState({
    notifications: currentSettings?.notifications ?? true,
    sound: currentSettings?.sound ?? true,
    theme: currentSettings?.theme ?? 'dark',
    fontSize: currentSettings?.fontSize ?? 'medium'
  });

  const handleSave = () => {
    onSaveSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {settings.notifications ? (
                <Bell className="text-blue-600" size={20} />
              ) : (
                <BellOff className="text-gray-400" size={20} />
              )}
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications for new messages
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {settings.sound ? (
                <Volume2 className="text-blue-600" size={20} />
              ) : (
                <VolumeX className="text-gray-400" size={20} />
              )}
              <div>
                <div className="font-medium">Sound</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Play sound for new messages
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.sound ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.sound ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Font Size */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="text-blue-600" size={20} />
              <div className="font-medium">Font Size</div>
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings(prev => ({ ...prev, fontSize: size }))}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    settings.fontSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatSettingsModal;

