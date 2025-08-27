import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, TrendingUp } from 'lucide-react';
import { useFitnessStore } from '../../store/fitness';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: any; // For editing existing goal
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal }) => {
  const { createHealthGoal, updateHealthGoal, isLoading } = useFitnessStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'weight',
    target_value: 0,
    current_value: 0,
    unit: '',
    deadline: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        goal_type: goal.goal_type || 'weight',
        target_value: goal.target_value || 0,
        current_value: goal.current_value || 0,
        unit: goal.unit || '',
        deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
        priority: goal.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        goal_type: 'weight',
        target_value: 0,
        current_value: 0,
        unit: '',
        deadline: '',
        priority: 'medium'
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const goalData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      if (goal) {
        await updateHealthGoal(goal.id, goalData);
      } else {
        await createHealthGoal(goalData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const goalTypes = [
    { value: 'weight', label: 'Weight Goal', unit: 'kg' },
    { value: 'steps', label: 'Daily Steps', unit: 'steps' },
    { value: 'calories', label: 'Calories Burned', unit: 'calories' },
    { value: 'workouts', label: 'Workouts per Week', unit: 'workouts' },
    { value: 'strength', label: 'Strength Goal', unit: 'kg' },
    { value: 'endurance', label: 'Endurance Goal', unit: 'minutes' },
    { value: 'flexibility', label: 'Flexibility Goal', unit: 'minutes' },
    { value: 'custom', label: 'Custom Goal', unit: '' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const selectedGoalType = goalTypes.find(type => type.value === formData.goal_type);

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
                {goal ? 'Edit Goal' : 'Set New Goal'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Goal Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Goal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lose 10kg, Run 5km"
                  required
                />
              </div>

              {/* Goal Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your goal and motivation..."
                />
              </div>

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Goal Type</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => {
                    const selectedType = goalTypes.find(type => type.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      goal_type: e.target.value,
                      unit: selectedType?.unit || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {goalTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Value */}
              <div>
                <label className="block text-sm font-medium mb-2">Current Value</label>
                <input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Value</label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              {/* Unit (for custom goals) */}
              {formData.goal_type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., km, reps, minutes"
                    required
                  />
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Preview */}
              {formData.current_value > 0 && formData.target_value > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium mb-2">Progress Preview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {formData.current_value} {selectedGoalType?.unit}</span>
                      <span>Target: {formData.target_value} {selectedGoalType?.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-gradient-from to-green-gradient-to h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((formData.current_value / formData.target_value) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round((formData.current_value / formData.target_value) * 100)}% complete
                    </p>
                  </div>
                </div>
              )}

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
                  {isLoading ? 'Saving...' : (goal ? 'Update Goal' : 'Set Goal')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal;
