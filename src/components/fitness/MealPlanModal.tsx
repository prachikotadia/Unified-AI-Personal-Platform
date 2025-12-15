import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Apple, Plus, Trash2, Save, Clock } from 'lucide-react';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: {
    name: string;
    duration: number;
    meals: Record<string, Array<{ meal: string; time: string; calories: number }>>;
  }) => void;
}

const MealPlanModal: React.FC<MealPlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: 7,
    meals: {
      monday: [] as Array<{ meal: string; time: string; calories: number }>,
      tuesday: [] as Array<{ meal: string; time: string; calories: number }>,
      wednesday: [] as Array<{ meal: string; time: string; calories: number }>,
      thursday: [] as Array<{ meal: string; time: string; calories: number }>,
      friday: [] as Array<{ meal: string; time: string; calories: number }>,
      saturday: [] as Array<{ meal: string; time: string; calories: number }>,
      sunday: [] as Array<{ meal: string; time: string; calories: number }>
    }
  });

  const [newMeal, setNewMeal] = useState<Record<string, { meal: string; time: string; calories: string }>>({});

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleAddMeal = (day: string) => {
    const meal = newMeal[day];
    if (meal && meal.meal.trim() && meal.time) {
      setFormData(prev => ({
        ...prev,
        meals: {
          ...prev.meals,
          [day]: [...prev.meals[day as keyof typeof prev.meals], {
            meal: meal.meal,
            time: meal.time,
            calories: parseInt(meal.calories) || 0
          }]
        }
      }));
      setNewMeal(prev => ({ ...prev, [day]: { meal: '', time: '', calories: '' } }));
    }
  };

  const handleRemoveMeal = (day: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [day]: prev.meals[day as keyof typeof prev.meals].filter((_, i) => i !== index)
      }
    }));
  };

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
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Apple className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Create Meal Plan</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Duration (days) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 7 }))}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weekly Meal Schedule
            </label>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{day}</span>
                    <div className="flex gap-2 flex-1 ml-4">
                      <input
                        type="text"
                        value={newMeal[day]?.meal || ''}
                        onChange={(e) => setNewMeal(prev => ({
                          ...prev,
                          [day]: { ...prev[day], meal: e.target.value, time: prev[day]?.time || '', calories: prev[day]?.calories || '' }
                        }))}
                        placeholder="Meal name..."
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="time"
                        value={newMeal[day]?.time || ''}
                        onChange={(e) => setNewMeal(prev => ({
                          ...prev,
                          [day]: { ...prev[day], time: e.target.value, meal: prev[day]?.meal || '', calories: prev[day]?.calories || '' }
                        }))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="number"
                        value={newMeal[day]?.calories || ''}
                        onChange={(e) => setNewMeal(prev => ({
                          ...prev,
                          [day]: { ...prev[day], calories: e.target.value, meal: prev[day]?.meal || '', time: prev[day]?.time || '' }
                        }))}
                        placeholder="Cal"
                        className="w-20 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddMeal(day)}
                        className="p-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {formData.meals[day as keyof typeof formData.meals].map((meal, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm">{meal.time}</span>
                          <span className="text-sm font-medium">{meal.meal}</span>
                          <span className="text-xs text-gray-500">({meal.calories} cal)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMeal(day, index)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Create Meal Plan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MealPlanModal;

