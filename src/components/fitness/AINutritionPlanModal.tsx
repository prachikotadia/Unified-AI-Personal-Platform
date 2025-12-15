import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, Apple, Target, Users, Calendar, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useToastHelpers } from '../../components/ui/Toast';
import aiService from '../../services/aiService';

interface AINutritionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (planData: {
    goal: string;
    calories: number;
    duration: number;
    dietaryRestrictions: string[];
    preferences: string[];
  }) => void;
}

const AINutritionPlanModal: React.FC<AINutritionPlanModalProps> = ({
  isOpen,
  onClose,
  onGeneratePlan
}) => {
  const [goal, setGoal] = useState('weight_loss');
  const [calories, setCalories] = useState(2000);
  const [duration, setDuration] = useState(7);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAvailable, setIsAIAvailable] = useState<boolean | null>(null);
  const { generateResponse } = useAI();
  const { info, error: showError } = useToastHelpers();

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'weight_gain', label: 'Weight Gain' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'health', label: 'General Health' }
  ];

  const restrictionOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'High-Protein',
    'Mediterranean',
    'Halal',
    'Kosher'
  ];

  const preferenceOptions = [
    'Meal Prep Friendly',
    'Quick Meals',
    'Budget Friendly',
    'Gourmet',
    'Simple Recipes',
    'International Cuisine'
  ];

  const toggleRestriction = (restriction: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const togglePreference = (pref: string) => {
    setPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  // Check AI availability on mount
  useEffect(() => {
    if (isOpen) {
      checkAIAvailability();
    }
  }, [isOpen]);

  const checkAIAvailability = async () => {
    try {
      const available = await aiService.isAIServiceAvailable();
      setIsAIAvailable(available);
      if (!available) {
        info('AI Offline', 'AI service is unavailable. Using fallback nutrition plan generator.');
      }
    } catch (err) {
      setIsAIAvailable(false);
    }
  };

  const getFallbackNutritionPlan = () => {
    const goalMap: Record<string, { macroSplit: string; focus: string }> = {
      weight_loss: { macroSplit: '40% Protein, 30% Carbs, 30% Fat', focus: 'Calorie deficit with high protein' },
      weight_gain: { macroSplit: '25% Protein, 45% Carbs, 30% Fat', focus: 'Calorie surplus with balanced macros' },
      muscle_gain: { macroSplit: '35% Protein, 40% Carbs, 25% Fat', focus: 'High protein for muscle recovery' },
      maintenance: { macroSplit: '30% Protein, 40% Carbs, 30% Fat', focus: 'Balanced nutrition for maintenance' },
      health: { macroSplit: '25% Protein, 45% Carbs, 30% Fat', focus: 'Whole foods and variety' }
    };

    const plan = goalMap[goal] || goalMap.maintenance;
    const restrictions = dietaryRestrictions.length > 0 ? `\n**Dietary Restrictions:** ${dietaryRestrictions.join(', ')}\n` : '';
    const prefs = preferences.length > 0 ? `\n**Preferences:** ${preferences.join(', ')}\n` : '';

    return {
      content: `**${duration}-Day ${goal.replace('_', ' ').toUpperCase()} Nutrition Plan**\n\n` +
        `**Daily Calories:** ${calories} kcal\n` +
        `**Macro Split:** ${plan.macroSplit}\n` +
        `**Focus:** ${plan.focus}\n` +
        restrictions +
        prefs +
        `\n**Meal Structure:**\n` +
        `- Breakfast: ${Math.round(calories * 0.25)} kcal\n` +
        `- Lunch: ${Math.round(calories * 0.35)} kcal\n` +
        `- Dinner: ${Math.round(calories * 0.30)} kcal\n` +
        `- Snacks: ${Math.round(calories * 0.10)} kcal\n\n` +
        `**Recommendations:**\n` +
        `- Eat protein with every meal\n` +
        `- Include vegetables in 2+ meals daily\n` +
        `- Stay hydrated (8-10 glasses water)\n` +
        `- Plan meals ahead for consistency`,
      model: 'fallback-generator',
      confidence: 0.7,
      timestamp: new Date().toISOString(),
      error: 'AI service unavailable - using fallback plan'
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let planResponse;
      
      // Try to use AI service if available
      if (isAIAvailable) {
        try {
          const prompt = `Create a ${duration}-day ${goal} nutrition plan with ${calories} daily calories. ` +
            `Dietary restrictions: ${dietaryRestrictions.join(', ') || 'None'}. ` +
            `Preferences: ${preferences.join(', ') || 'None'}. ` +
            `Provide detailed meal plans, macro breakdowns, and meal prep tips.`;
          
          const response = await generateResponse(prompt, { type: 'fitness', module: 'nutrition' });
          planResponse = {
            content: response,
            model: 'gpt-4',
            confidence: 0.85,
            timestamp: new Date().toISOString(),
          };
        } catch (aiError: any) {
          console.warn('AI service call failed, using fallback:', aiError);
          planResponse = getFallbackNutritionPlan();
          info('Using Fallback Plan', 'AI service unavailable. Using a generated nutrition plan.');
        }
      } else {
        // Use fallback immediately if AI is not available
        planResponse = getFallbackNutritionPlan();
      }

      // Call onGeneratePlan with the plan data
      onGeneratePlan({
        goal,
        calories,
        duration,
        dietaryRestrictions,
        preferences,
        aiPlan: planResponse.content,
        isFallback: !!planResponse.error || !isAIAvailable
      } as any);

      setLoading(false);
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate nutrition plan';
      setError(errorMsg);
      showError('Generation Error', errorMsg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">AI Nutrition Plan Generator</h2>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              Nutrition Goal *
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              {goalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Apple className="inline w-4 h-4 mr-1" />
                Daily Calories *
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Math.max(1000, parseInt(e.target.value) || 2000))}
                min="1000"
                max="5000"
                step="50"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Plan Duration (days) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 7))}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {restrictionOptions.map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => toggleRestriction(restriction)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    dietaryRestrictions.includes(restriction)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meal Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map((pref) => (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferences.includes(pref)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* AI Status Indicator */}
          {isAIAvailable !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isAIAvailable 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              {isAIAvailable ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">AI Service Available</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-700 dark:text-amber-300">AI Offline - Using Fallback Generator</span>
                </>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              <Sparkles className="inline w-4 h-4 mr-1" />
              {isAIAvailable 
                ? `AI will create a personalized ${duration}-day meal plan with ${calories} calories per day, tailored to your ${goal.replace('_', ' ')} goal${dietaryRestrictions.length > 0 ? ` and ${dietaryRestrictions.join(', ')} restrictions` : ''}.`
                : `A ${duration}-day meal plan with ${calories} calories per day will be generated based on your ${goal.replace('_', ' ')} goal${dietaryRestrictions.length > 0 ? ` and ${dietaryRestrictions.join(', ')} restrictions` : ''}.`
              }
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Brain size={16} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AINutritionPlanModal;

