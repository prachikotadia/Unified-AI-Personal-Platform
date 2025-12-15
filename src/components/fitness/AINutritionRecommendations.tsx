import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Apple, Clock, UtensilsCrossed, Plus } from 'lucide-react';

interface MealRecommendation {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  matchScore: number;
  reasoning: string;
  ingredients: string[];
}

interface AINutritionRecommendationsProps {
  userProfile?: {
    goals?: string[];
    dietaryRestrictions?: string[];
    preferences?: string[];
    dailyCalories?: number;
  };
  onSelectMeal?: (meal: MealRecommendation) => void;
}

const AINutritionRecommendations: React.FC<AINutritionRecommendationsProps> = ({
  userProfile,
  onSelectMeal
}) => {
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered meal recommendations
    const mockRecommendations: MealRecommendation[] = [
      {
        id: '1',
        name: 'Grilled Chicken Salad',
        mealType: 'lunch',
        calories: 350,
        protein: 35,
        carbs: 20,
        fat: 12,
        prepTime: 15,
        matchScore: 0.95,
        reasoning: 'High protein, low calorie meal perfect for your weight loss goals. Rich in nutrients and easy to prepare.',
        ingredients: ['Chicken Breast', 'Mixed Greens', 'Cherry Tomatoes', 'Cucumber', 'Olive Oil', 'Lemon']
      },
      {
        id: '2',
        name: 'Overnight Oats',
        mealType: 'breakfast',
        calories: 300,
        protein: 15,
        carbs: 45,
        fat: 8,
        prepTime: 5,
        matchScore: 0.92,
        reasoning: 'Perfect breakfast option. High in fiber and protein, keeps you full until lunch. Can be prepared the night before.',
        ingredients: ['Oats', 'Greek Yogurt', 'Berries', 'Honey', 'Chia Seeds', 'Almonds']
      },
      {
        id: '3',
        name: 'Salmon with Quinoa',
        mealType: 'dinner',
        calories: 450,
        protein: 40,
        carbs: 35,
        fat: 15,
        prepTime: 25,
        matchScore: 0.88,
        reasoning: 'Excellent source of omega-3 fatty acids and complete protein. Aligns with your muscle gain goals.',
        ingredients: ['Salmon Fillet', 'Quinoa', 'Broccoli', 'Lemon', 'Garlic', 'Olive Oil']
      },
      {
        id: '4',
        name: 'Protein Smoothie',
        mealType: 'snack',
        calories: 250,
        protein: 25,
        carbs: 30,
        fat: 5,
        prepTime: 5,
        matchScore: 0.90,
        reasoning: 'Quick and nutritious post-workout snack. High protein content supports muscle recovery.',
        ingredients: ['Protein Powder', 'Banana', 'Spinach', 'Almond Milk', 'Berries', 'Peanut Butter']
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is generating personalized meal recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-green-600" size={24} />
        <h3 className="text-lg font-semibold">AI Nutrition Recommendations</h3>
        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className="text-green-600" size={18} />
                  <h4 className="font-semibold">{meal.name}</h4>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded capitalize">
                    {meal.mealType}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${meal.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(meal.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
              <div>
                <div className="text-gray-500">Calories</div>
                <div className="font-medium">{meal.calories}</div>
              </div>
              <div>
                <div className="text-gray-500">Protein</div>
                <div className="font-medium">{meal.protein}g</div>
              </div>
              <div>
                <div className="text-gray-500">Carbs</div>
                <div className="font-medium">{meal.carbs}g</div>
              </div>
              <div>
                <div className="text-gray-500">Fat</div>
                <div className="font-medium">{meal.fat}g</div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} />
              <span>Prep time: {meal.prepTime} min</span>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-green-800 dark:text-green-200 mb-1">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {meal.reasoning}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key Ingredients:</p>
              <div className="flex flex-wrap gap-1">
                {meal.ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {onSelectMeal && (
              <button
                onClick={() => onSelectMeal(meal)}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus size={16} />
                Add to Meal Plan
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AINutritionRecommendations;

