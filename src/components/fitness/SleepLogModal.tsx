import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sunrise, Clock, Save } from 'lucide-react';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sleepData: {
    date: string;
    bedtime: string;
    wakeTime: string;
    sleepDuration: number;
    quality: number;
    deepSleep: number;
    remSleep: number;
    lightSleep: number;
    notes?: string;
  }) => void;
  sleep?: any; // For editing existing sleep entry
}

const SleepLogModal: React.FC<SleepLogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sleep
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '23:00',
    wakeTime: '07:00',
    sleepDuration: 8,
    quality: 80,
    deepSleep: 2,
    remSleep: 1.5,
    lightSleep: 4.5,
    notes: ''
  });

  useEffect(() => {
    if (sleep) {
      setFormData({
        date: sleep.date || new Date().toISOString().split('T')[0],
        bedtime: sleep.bedtime || '23:00',
        wakeTime: sleep.wakeTime || '07:00',
        sleepDuration: sleep.sleepDuration || 8,
        quality: sleep.quality || 80,
        deepSleep: sleep.deepSleep || 2,
        remSleep: sleep.remSleep || 1.5,
        lightSleep: sleep.lightSleep || 4.5,
        notes: sleep.notes || ''
      });
    }
  }, [sleep]);

  const calculateDuration = () => {
    const [bedHour, bedMin] = formData.bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = formData.wakeTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    // Handle overnight sleep
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    const duration = (wakeMinutes - bedMinutes) / 60;
    setFormData(prev => ({ ...prev, sleepDuration: Math.max(0, duration) }));
  };

  useEffect(() => {
    calculateDuration();
  }, [formData.bedtime, formData.wakeTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <div className="flex items-center gap-2">
            <Moon className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">{sleep ? 'Edit Sleep Entry' : 'Log Sleep'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Moon className="inline w-4 h-4 mr-1" />
                Bedtime *
              </label>
              <input
                type="time"
                value={formData.bedtime}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bedtime: e.target.value }));
                  calculateDuration();
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Sunrise className="inline w-4 h-4 mr-1" />
                Wake Time *
              </label>
              <input
                type="time"
                value={formData.wakeTime}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, wakeTime: e.target.value }));
                  calculateDuration();
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Sleep Duration</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {formData.sleepDuration.toFixed(1)} hours
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sleep Quality: {formData.quality}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.quality}
              onChange={(e) => setFormData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deep Sleep (h)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.deepSleep}
                onChange={(e) => setFormData(prev => ({ ...prev, deepSleep: parseFloat(e.target.value) || 0 }))}
                min="0"
                max={formData.sleepDuration}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                REM Sleep (h)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.remSleep}
                onChange={(e) => setFormData(prev => ({ ...prev, remSleep: parseFloat(e.target.value) || 0 }))}
                min="0"
                max={formData.sleepDuration}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Light Sleep (h)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.lightSleep}
                onChange={(e) => setFormData(prev => ({ ...prev, lightSleep: parseFloat(e.target.value) || 0 }))}
                min="0"
                max={formData.sleepDuration}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Add any notes about your sleep..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {sleep ? 'Update Sleep' : 'Log Sleep'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SleepLogModal;

