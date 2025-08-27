import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useFitnessStore } from '../../store/fitness';

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nutrition?: any; // For editing existing nutrition entry
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

const NutritionModal: React.FC<NutritionModalProps> = ({ isOpen, onClose, nutrition }) => {
  const { createNutritionEntry, updateNutritionEntry, isLoading } = useFitnessStore();
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    foods: [] as FoodItem[],
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0
  });

  useEffect(() => {
    if (nutrition) {
      setFormData({
        meal_type: nutrition.meal_type || 'breakfast',
        foods: nutrition.foods || [],
        total_calories: nutrition.total_calories || 0,
        total_protein: nutrition.total_protein || 0,
        total_carbs: nutrition.total_carbs || 0,
        total_fat: nutrition.total_fat || 0
      });
    } else {
      setFormData({
        meal_type: 'breakfast',
        foods: [],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0
      });
    }
  }, [nutrition]);

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foods: [...formData.foods, {
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        quantity: 1,
        unit: 'serving'
      }]
    });
  };

  const removeFoodItem = (index: number) => {
    const newFoods = formData.foods.filter((_, i) => i !== index);
    const totals = calculateTotals(newFoods);
    setFormData({
      ...formData,
      foods: newFoods,
      ...totals
    });
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: any) => {
    const newFoods = [...formData.foods];
    newFoods[index] = { ...newFoods[index], [field]: value };
    const totals = calculateTotals(newFoods);
    setFormData({
      ...formData,
      foods: newFoods,
      ...totals
    });
  };

  const calculateTotals = (foods: FoodItem[]) => {
    return {
      total_calories: foods.reduce((sum, food) => sum + food.calories, 0),
      total_protein: foods.reduce((sum, food) => sum + food.protein, 0),
      total_carbs: foods.reduce((sum, food) => sum + food.carbs, 0),
      total_fat: foods.reduce((sum, food) => sum + food.fat, 0)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (nutrition) {
        await updateNutritionEntry(nutrition.id, formData);
      } else {
        await createNutritionEntry(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
    }
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const units = [
    { value: 'serving', label: 'Serving' },
    { value: 'cup', label: 'Cup' },
    { value: 'piece', label: 'Piece' },
    { value: 'gram', label: 'Gram' },
    { value: 'ounce', label: 'Ounce' }
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
                {nutrition ? 'Edit Meal' : 'Log Meal'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <select
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mealTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Food Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium">Food Items</label>
                  <button
                    type="button"
                    onClick={addFoodItem}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Food</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.foods.map((food, index) => (
                    <div key={index} className="p-4 border border-white/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Food Item {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Food Name</label>
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Chicken Breast"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Quantity</label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={food.quantity}
                              onChange={(e) => updateFoodItem(index, 'quantity', parseFloat(e.target.value))}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0.1"
                              step="0.1"
                              required
                            />
                            <select
                              value={food.unit}
                              onChange={(e) => updateFoodItem(index, 'unit', e.target.value)}
                              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Calories</label>
                          <input
                            type="number"
                            value={food.calories}
                            onChange={(e) => updateFoodItem(index, 'calories', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Protein (g)</label>
                          <input
                            type="number"
                            value={food.protein}
                            onChange={(e) => updateFoodItem(index, 'protein', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Carbs (g)</label>
                          <input
                            type="number"
                            value={food.carbs}
                            onChange={(e) => updateFoodItem(index, 'carbs', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Fat (g)</label>
                          <input
                            type="number"
                            value={food.fat}
                            onChange={(e) => updateFoodItem(index, 'fat', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.foods.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No food items added yet.</p>
                      <p className="text-sm">Click "Add Food" to start logging your meal.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              {formData.foods.length > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium mb-3">Meal Totals</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500">Calories</label>
                      <p className="text-lg font-semibold">{formData.total_calories}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">Protein</label>
                      <p className="text-lg font-semibold">{formData.total_protein}g</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">Carbs</label>
                      <p className="text-lg font-semibold">{formData.total_carbs}g</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">Fat</label>
                      <p className="text-lg font-semibold">{formData.total_fat}g</p>
                    </div>
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
                  disabled={isLoading || formData.foods.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-gradient-from to-green-gradient-to text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (nutrition ? 'Update Meal' : 'Log Meal')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NutritionModal;
