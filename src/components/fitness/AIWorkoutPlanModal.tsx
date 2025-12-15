import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, Target, Clock, Calendar, Users, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useToastHelpers } from '../../components/ui/Toast';
import aiService from '../../services/aiService';

interface AIWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (planData: {
    goal: string;
    duration: number;
    frequency: number;
    level: string;
    preferences: string[];
  }) => void;
}

const AIWorkoutPlanModal: React.FC<AIWorkoutPlanModalProps> = ({
  isOpen,
  onClose,
  onGeneratePlan
}) => {
  const [goal, setGoal] = useState('weight_loss');
  const [duration, setDuration] = useState(4);
  const [frequency, setFrequency] = useState(3);
  const [level, setLevel] = useState('intermediate');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAvailable, setIsAIAvailable] = useState<boolean | null>(null);
  const { recommendWorkoutPlan } = useAI();
  const { info, error: showError } = useToastHelpers();

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'strength', label: 'Strength' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'general_fitness', label: 'General Fitness' }
  ];

  const preferenceOptions = [
    'Cardio',
    'Strength Training',
    'Yoga',
    'HIIT',
    'Pilates',
    'Swimming',
    'Running',
    'Cycling',
    'Home Workouts',
    'Gym Workouts'
  ];

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
        info('AI Offline', 'AI service is unavailable. Using fallback workout plan generator.');
      }
    } catch (err) {
      setIsAIAvailable(false);
    }
  };

  const getFallbackWorkoutPlan = () => {
    const goalMap: Record<string, string> = {
      weight_loss: 'Focus on cardio and full-body strength training',
      muscle_gain: 'Focus on progressive overload and compound movements',
      endurance: 'Focus on long-duration cardio and interval training',
      strength: 'Focus on heavy lifting and power movements',
      flexibility: 'Focus on stretching, yoga, and mobility work',
      general_fitness: 'Focus on balanced cardio and strength training'
    };

    const levelMap: Record<string, { sets: number; reps: string; rest: string }> = {
      beginner: { sets: 2, reps: '10-12', rest: '60-90s' },
      intermediate: { sets: 3, reps: '8-12', rest: '60-90s' },
      advanced: { sets: 4, reps: '6-10', rest: '90-120s' }
    };

    const plan = levelMap[level] || levelMap.intermediate;
    const focus = goalMap[goal] || goalMap.general_fitness;

    return {
      content: `**${duration}-Week ${goal.replace('_', ' ').toUpperCase()} Workout Plan**\n\n` +
        `**Fitness Level:** ${level}\n` +
        `**Frequency:** ${frequency} workouts per week\n` +
        `**Focus:** ${focus}\n\n` +
        `**Weekly Structure:**\n` +
        `- ${frequency} workout days per week\n` +
        `- ${plan.sets} sets per exercise\n` +
        `- ${plan.reps} reps per set\n` +
        `- ${plan.rest} rest between sets\n\n` +
        `**Recommended Exercises:**\n` +
        (preferences.length > 0 
          ? `Based on your preferences: ${preferences.join(', ')}\n`
          : 'Full-body compound movements, cardio intervals, and flexibility work\n') +
        `\n**Progression:** Increase weight or reps every 2 weeks.\n` +
        `**Recovery:** Ensure at least 1 rest day between strength training sessions.`,
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
          const goals = [goal, ...preferences];
          planResponse = await recommendWorkoutPlan(level, goals, frequency * 60); // Convert to minutes
          
          // If AI returned an error, use fallback
          if (planResponse.error) {
            planResponse = getFallbackWorkoutPlan();
            info('Using Fallback Plan', 'AI service returned an error. Using a generated workout plan.');
          }
        } catch (aiError: any) {
          console.warn('AI service call failed, using fallback:', aiError);
          planResponse = getFallbackWorkoutPlan();
          info('Using Fallback Plan', 'AI service unavailable. Using a generated workout plan.');
        }
      } else {
        // Use fallback immediately if AI is not available
        planResponse = getFallbackWorkoutPlan();
      }

      // Call onGeneratePlan with the plan data
      onGeneratePlan({
        goal,
        duration,
        frequency,
        level,
        preferences,
        aiPlan: planResponse.content,
        isFallback: !!planResponse.error || !isAIAvailable
      } as any);

      setLoading(false);
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate workout plan';
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
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Workout Plan Generator</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
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
              Fitness Goal *
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {goalOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Duration (weeks) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="52"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Workouts per Week *
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
                min="1"
                max="7"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fitness Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    level === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workout Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {preferenceOptions.map((pref) => (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferences.includes(pref)
                      ? 'bg-blue-600 text-white'
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

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Sparkles className="inline w-4 h-4 mr-1" />
              {isAIAvailable 
                ? `AI will create a personalized ${duration}-week workout plan with ${frequency} workouts per week, tailored to your ${goal.replace('_', ' ')} goal and ${level} fitness level.`
                : `A ${duration}-week workout plan with ${frequency} workouts per week will be generated based on your ${goal.replace('_', ' ')} goal and ${level} fitness level.`
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default AIWorkoutPlanModal;

