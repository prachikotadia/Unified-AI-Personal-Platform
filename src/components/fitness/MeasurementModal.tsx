import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Scale, TrendingUp } from 'lucide-react';
import { useFitnessStore } from '../../store/fitness';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurement?: any; // For editing existing measurement
}

const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, measurement }) => {
  const { createHealthMetric, updateHealthMetric, isLoading } = useFitnessStore();
  const [formData, setFormData] = useState({
    weight: '',
    body_fat: '',
    muscle_mass: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    neck: '',
    shoulders: '',
    notes: ''
  });

  useEffect(() => {
    if (measurement) {
      setFormData({
        weight: measurement.weight || '',
        body_fat: measurement.body_fat || '',
        muscle_mass: measurement.muscle_mass || '',
        chest: measurement.chest || '',
        waist: measurement.waist || '',
        hips: measurement.hips || '',
        biceps: measurement.biceps || '',
        thighs: measurement.thighs || '',
        neck: measurement.neck || '',
        shoulders: measurement.shoulders || '',
        notes: measurement.notes || ''
      });
    } else {
      setFormData({
        weight: '',
        body_fat: '',
        muscle_mass: '',
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        thighs: '',
        neck: '',
        shoulders: '',
        notes: ''
      });
    }
  }, [measurement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const measurements = [];
      
      // Add each measurement as a separate health metric
      if (formData.weight) {
        measurements.push({
          metric_type: 'weight',
          value: parseFloat(formData.weight),
          unit: 'kg',
          notes: formData.notes
        });
      }
      
      if (formData.body_fat) {
        measurements.push({
          metric_type: 'body_fat',
          value: parseFloat(formData.body_fat),
          unit: '%',
          notes: formData.notes
        });
      }
      
      if (formData.muscle_mass) {
        measurements.push({
          metric_type: 'muscle_mass',
          value: parseFloat(formData.muscle_mass),
          unit: 'kg',
          notes: formData.notes
        });
      }

      // Create all measurements
      for (const metric of measurements) {
        await createHealthMetric(metric);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  const measurementFields = [
    { key: 'weight', label: 'Weight', unit: 'kg', icon: Scale },
    { key: 'body_fat', label: 'Body Fat', unit: '%', icon: TrendingUp },
    { key: 'muscle_mass', label: 'Muscle Mass', unit: 'kg', icon: TrendingUp },
    { key: 'chest', label: 'Chest', unit: 'cm', icon: Ruler },
    { key: 'waist', label: 'Waist', unit: 'cm', icon: Ruler },
    { key: 'hips', label: 'Hips', unit: 'cm', icon: Ruler },
    { key: 'biceps', label: 'Biceps', unit: 'cm', icon: Ruler },
    { key: 'thighs', label: 'Thighs', unit: 'cm', icon: Ruler },
    { key: 'neck', label: 'Neck', unit: 'cm', icon: Ruler },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', icon: Ruler }
  ];

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
            className="glass-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {measurement ? 'Edit Measurements' : 'Log Body Measurements'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Measurement Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {measurementFields.map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-medium flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{field.label}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            [field.key]: e.target.value 
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                          placeholder={`0.0`}
                          min="0"
                          step="0.1"
                        />
                        <span className="absolute right-3 top-2 text-sm text-gray-400">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional notes about your measurements..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-gradient-from to-purple-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (measurement ? 'Update Measurements' : 'Log Measurements')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeasurementModal;
