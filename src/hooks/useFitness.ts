import { useEffect } from 'react';
import { useFitnessStore } from '../store/fitness';
import {
  WorkoutPlanCreate,
  WorkoutSessionCreate,
  NutritionEntryCreate,
  HealthMetricCreate,
  HealthGoalCreate,
  ActivityType,
  NutritionType,
  HealthMetricType,
} from '../services/fitnessAPI';

// Main fitness hook that provides all data and actions
export const useFitness = () => {
  const store = useFitnessStore();

  // Auto-fetch data on mount
  useEffect(() => {
    const loadFitnessData = async () => {
      try {
        await Promise.all([
          store.fetchDashboard(),
          store.fetchWorkoutSessions(),
          store.fetchNutritionEntries(),
          store.fetchHealthGoals(),
          store.fetchAchievements(),
          store.fetchStreaks(),
        ]);
      } catch (error) {
        console.error('Failed to load fitness data:', error);
      }
    };

    loadFitnessData();
  }, []);

  return {
    // Data
    workoutPlans: store.workoutPlans,
    workoutSessions: store.workoutSessions,
    nutritionEntries: store.nutritionEntries,
    healthMetrics: store.healthMetrics,
    healthGoals: store.healthGoals,
    achievements: store.achievements,
    streaks: store.streaks,
    dailySummary: store.dailySummary,
    insights: store.insights,
    recommendations: store.recommendations,
    dashboard: store.dashboard,

    // Loading states
    isLoading: store.isLoading,

    // Error states
    errors: store.errors,

    // Actions
    // Workout Plans
    fetchWorkoutPlans: store.fetchWorkoutPlans,
    createWorkoutPlan: store.createWorkoutPlan,
    updateWorkoutPlan: store.updateWorkoutPlan,
    deleteWorkoutPlan: store.deleteWorkoutPlan,

    // Workout Sessions
    fetchWorkoutSessions: store.fetchWorkoutSessions,
    createWorkoutSession: store.createWorkoutSession,
    updateWorkoutSession: store.updateWorkoutSession,
    completeWorkoutSession: store.completeWorkoutSession,
    deleteWorkoutSession: store.deleteWorkoutSession,

    // Nutrition
    fetchNutritionEntries: store.fetchNutritionEntries,
    createNutritionEntry: store.createNutritionEntry,
    updateNutritionEntry: store.updateNutritionEntry,
    deleteNutritionEntry: store.deleteNutritionEntry,

    // Health Metrics
    fetchHealthMetrics: store.fetchHealthMetrics,
    createHealthMetric: store.createHealthMetric,

    // Health Goals
    fetchHealthGoals: store.fetchHealthGoals,
    createHealthGoal: store.createHealthGoal,
    updateGoalProgress: store.updateGoalProgress,

    // Achievements and Streaks
    fetchAchievements: store.fetchAchievements,
    fetchStreaks: store.fetchStreaks,

    // Daily Summary
    fetchDailySummary: store.fetchDailySummary,
    updateDailySummary: store.updateDailySummary,

    // Insights and Recommendations
    fetchInsights: store.fetchInsights,
    fetchRecommendations: store.fetchRecommendations,

    // Dashboard
    fetchDashboard: store.fetchDashboard,

    // Utility
    clearErrors: store.clearErrors,
    resetStore: store.resetStore,

    // Calculations
    getTodaySteps: store.getTodaySteps,
    getTodayCaloriesBurned: store.getTodayCaloriesBurned,
    getTodayCaloriesConsumed: store.getTodayCaloriesConsumed,
    getWeeklyWorkouts: store.getWeeklyWorkouts,
    getCurrentStreak: store.getCurrentStreak,
    getGoalProgress: store.getGoalProgress,
    getTotalWorkouts: store.getTotalWorkouts,
    getAverageWorkoutDuration: store.getAverageWorkoutDuration,
    getNutritionTotals: store.getNutritionTotals,
  };
};

// Specific hooks for individual entities
export const useWorkoutPlans = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchWorkoutPlans();
  }, []);

  return {
    workoutPlans: store.workoutPlans,
    isLoading: store.isLoading.workoutPlans,
    error: store.errors.workoutPlans,
    fetchWorkoutPlans: store.fetchWorkoutPlans,
    createWorkoutPlan: store.createWorkoutPlan,
    updateWorkoutPlan: store.updateWorkoutPlan,
    deleteWorkoutPlan: store.deleteWorkoutPlan,
  };
};

export const useWorkoutSessions = (limit?: number, offset?: number, type?: ActivityType) => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchWorkoutSessions(limit, offset, type);
  }, [limit, offset, type]);

  return {
    workoutSessions: store.workoutSessions,
    isLoading: store.isLoading.workoutSessions,
    error: store.errors.workoutSessions,
    fetchWorkoutSessions: store.fetchWorkoutSessions,
    createWorkoutSession: store.createWorkoutSession,
    updateWorkoutSession: store.updateWorkoutSession,
    completeWorkoutSession: store.completeWorkoutSession,
    deleteWorkoutSession: store.deleteWorkoutSession,
  };
};

export const useNutrition = (limit?: number, offset?: number, mealType?: NutritionType) => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchNutritionEntries(limit, offset, mealType);
  }, [limit, offset, mealType]);

  return {
    nutritionEntries: store.nutritionEntries,
    isLoading: store.isLoading.nutritionEntries,
    error: store.errors.nutritionEntries,
    fetchNutritionEntries: store.fetchNutritionEntries,
    createNutritionEntry: store.createNutritionEntry,
    updateNutritionEntry: store.updateNutritionEntry,
    deleteNutritionEntry: store.deleteNutritionEntry,
    getNutritionTotals: store.getNutritionTotals,
  };
};

export const useHealthMetrics = (limit?: number, offset?: number, metricType?: HealthMetricType) => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchHealthMetrics(limit, offset, metricType);
  }, [limit, offset, metricType]);

  return {
    healthMetrics: store.healthMetrics,
    isLoading: store.isLoading.healthMetrics,
    error: store.errors.healthMetrics,
    fetchHealthMetrics: store.fetchHealthMetrics,
    createHealthMetric: store.createHealthMetric,
  };
};

export const useHealthGoals = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchHealthGoals();
  }, []);

  return {
    healthGoals: store.healthGoals,
    isLoading: store.isLoading.healthGoals,
    error: store.errors.healthGoals,
    fetchHealthGoals: store.fetchHealthGoals,
    createHealthGoal: store.createHealthGoal,
    updateGoalProgress: store.updateGoalProgress,
    getGoalProgress: store.getGoalProgress,
  };
};

export const useAchievements = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchAchievements();
  }, []);

  return {
    achievements: store.achievements,
    isLoading: store.isLoading.achievements,
    error: store.errors.achievements,
    fetchAchievements: store.fetchAchievements,
  };
};

export const useStreaks = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchStreaks();
  }, []);

  return {
    streaks: store.streaks,
    isLoading: store.isLoading.streaks,
    error: store.errors.streaks,
    fetchStreaks: store.fetchStreaks,
    getCurrentStreak: store.getCurrentStreak,
  };
};

export const useDailySummary = (date?: string) => {
  const store = useFitnessStore();
  const targetDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    store.fetchDailySummary(targetDate);
  }, [targetDate]);

  return {
    dailySummary: store.dailySummary,
    isLoading: store.isLoading.dailySummary,
    error: store.errors.dailySummary,
    fetchDailySummary: store.fetchDailySummary,
    updateDailySummary: store.updateDailySummary,
    getTodaySteps: store.getTodaySteps,
    getTodayCaloriesBurned: store.getTodayCaloriesBurned,
    getTodayCaloriesConsumed: store.getTodayCaloriesConsumed,
  };
};

export const useInsights = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchInsights();
  }, []);

  return {
    insights: store.insights,
    isLoading: store.isLoading.insights,
    error: store.errors.insights,
    fetchInsights: store.fetchInsights,
  };
};

export const useRecommendations = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchRecommendations();
  }, []);

  return {
    recommendations: store.recommendations,
    isLoading: store.isLoading.recommendations,
    error: store.errors.recommendations,
    fetchRecommendations: store.fetchRecommendations,
  };
};

export const useFitnessDashboard = () => {
  const store = useFitnessStore();

  useEffect(() => {
    store.fetchDashboard();
  }, []);

  return {
    dashboard: store.dashboard,
    isLoading: store.isLoading.dashboard,
    error: store.errors.dashboard,
    fetchDashboard: store.fetchDashboard,
    getWeeklyWorkouts: store.getWeeklyWorkouts,
    getTotalWorkouts: store.getTotalWorkouts,
    getAverageWorkoutDuration: store.getAverageWorkoutDuration,
  };
};

// Utility hooks for specific calculations
export const useFitnessStats = () => {
  const store = useFitnessStore();

  return {
    todaySteps: store.getTodaySteps(),
    todayCaloriesBurned: store.getTodayCaloriesBurned(),
    todayCaloriesConsumed: store.getTodayCaloriesConsumed(),
    weeklyWorkouts: store.getWeeklyWorkouts(),
    currentStreak: store.getCurrentStreak(),
    totalWorkouts: store.getTotalWorkouts(),
    averageWorkoutDuration: store.getAverageWorkoutDuration(),
    nutritionTotals: store.getNutritionTotals(),
  };
};

// Hook for workout session management
export const useWorkoutSessionManager = () => {
  const store = useFitnessStore();

  const startWorkout = async (session: WorkoutSessionCreate) => {
    try {
      await store.createWorkoutSession(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to start workout' };
    }
  };

  const completeWorkout = async (sessionId: string) => {
    try {
      await store.completeWorkoutSession(sessionId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to complete workout' };
    }
  };

  const updateWorkout = async (sessionId: string, updates: Partial<WorkoutSessionCreate>) => {
    try {
      await store.updateWorkoutSession(sessionId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update workout' };
    }
  };

  const deleteWorkout = async (sessionId: string) => {
    try {
      await store.deleteWorkoutSession(sessionId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete workout' };
    }
  };

  return {
    startWorkout,
    completeWorkout,
    updateWorkout,
    deleteWorkout,
    workoutSessions: store.workoutSessions,
    isLoading: store.isLoading.workoutSessions,
    error: store.errors.workoutSessions,
  };
};

// Hook for nutrition management
export const useNutritionManager = () => {
  const store = useFitnessStore();

  const logMeal = async (nutrition: NutritionEntryCreate) => {
    try {
      await store.createNutritionEntry(nutrition);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to log meal' };
    }
  };

  const updateMeal = async (entryId: string, updates: Partial<NutritionEntryCreate>) => {
    try {
      await store.updateNutritionEntry(entryId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update meal' };
    }
  };

  const deleteMeal = async (entryId: string) => {
    try {
      await store.deleteNutritionEntry(entryId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete meal' };
    }
  };

  return {
    logMeal,
    updateMeal,
    deleteMeal,
    nutritionEntries: store.nutritionEntries,
    nutritionTotals: store.getNutritionTotals(),
    isLoading: store.isLoading.nutritionEntries,
    error: store.errors.nutritionEntries,
  };
};

// Hook for goal management
export const useGoalManager = () => {
  const store = useFitnessStore();

  const createGoal = async (goal: HealthGoalCreate) => {
    try {
      await store.createHealthGoal(goal);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create goal' };
    }
  };

  const updateProgress = async (goalId: string, currentValue: number) => {
    try {
      await store.updateGoalProgress(goalId, currentValue);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update progress' };
    }
  };

  const getProgress = (goalId: string) => {
    return store.getGoalProgress(goalId);
  };

  return {
    createGoal,
    updateProgress,
    getProgress,
    healthGoals: store.healthGoals,
    isLoading: store.isLoading.healthGoals,
    error: store.errors.healthGoals,
  };
};

// Hook for health metrics
export const useHealthMetricsManager = () => {
  const store = useFitnessStore();

  const logMetric = async (metric: HealthMetricCreate) => {
    try {
      await store.createHealthMetric(metric);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to log metric' };
    }
  };

  return {
    logMetric,
    healthMetrics: store.healthMetrics,
    isLoading: store.isLoading.healthMetrics,
    error: store.errors.healthMetrics,
  };
};
