import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Zap, Target } from 'lucide-react';
import { useFitnessStore } from '../../store/fitness';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout?: any; // For editing existing workout
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ isOpen, onClose, workout }) => {
  const { createWorkoutSession, updateWorkoutSession, isLoading } = useFitnessStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'strength',
    duration: 30,
    intensity: 'moderate',
    calories_burned: 0,
    notes: ''
  });

  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name || '',
        type: workout.type || 'strength',
        duration: workout.duration || 30,
        intensity: workout.intensity || 'moderate',
        calories_burned: workout.calories_burned || 0,
        notes: workout.notes || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'strength',
        duration: 30,
        intensity: 'moderate',
        calories_burned: 0,
        notes: ''
      });
    }
  }, [workout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (workout) {
        await updateWorkoutSession(workout.id, formData);
      } else {
        await createWorkoutSession(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const workoutTypes = [
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'running', label: 'Running' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'walking', label: 'Walking' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'other', label: 'Other' }
  ];

  const intensityLevels = [
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'intense', label: 'Intense' }
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
            className="glass-card w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {workout ? 'Edit Workout' : 'Log Workout'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workout Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Workout Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Cardio, Upper Body"
                  required
                />
              </div>

              {/* Workout Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workoutTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="300"
                  required
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium mb-2">Intensity</label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {intensityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calories Burned */}
              <div>
                <label className="block text-sm font-medium mb-2">Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories_burned}
                  onChange={(e) => setFormData({ ...formData, calories_burned: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="2000"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="How did you feel? Any achievements?"
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (workout ? 'Update' : 'Log Workout')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkoutModal;
