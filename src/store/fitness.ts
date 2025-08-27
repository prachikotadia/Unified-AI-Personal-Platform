import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  WorkoutPlan,
  WorkoutSession,
  NutritionEntry,
  HealthMetric,
  HealthGoal,
  HealthAchievement,
  HealthStreak,
  DailyHealthSummary,
  HealthInsight,
  HealthRecommendation,
  FitnessDashboard,
  WorkoutPlanCreate,
  WorkoutSessionCreate,
  NutritionEntryCreate,
  HealthMetricCreate,
  HealthGoalCreate,
  ActivityType,
  NutritionType,
  HealthMetricType,
  fitnessAPIService,
} from '../services/fitnessAPI';

// Fitness Store State Interface
interface FitnessState {
  // Data
  workoutPlans: WorkoutPlan[];
  workoutSessions: WorkoutSession[];
  nutritionEntries: NutritionEntry[];
  healthMetrics: HealthMetric[];
  healthGoals: HealthGoal[];
  achievements: HealthAchievement[];
  streaks: HealthStreak[];
  dailySummary: DailyHealthSummary | null;
  insights: HealthInsight[];
  recommendations: HealthRecommendation[];
  dashboard: FitnessDashboard | null;
  
  // Loading States
  isLoading: {
    workoutPlans: boolean;
    workoutSessions: boolean;
    nutritionEntries: boolean;
    healthMetrics: boolean;
    healthGoals: boolean;
    achievements: boolean;
    streaks: boolean;
    dailySummary: boolean;
    insights: boolean;
    recommendations: boolean;
    dashboard: boolean;
  };
  
  // Error States
  errors: {
    workoutPlans: string | null;
    workoutSessions: string | null;
    nutritionEntries: string | null;
    healthMetrics: string | null;
    healthGoals: string | null;
    achievements: string | null;
    streaks: string | null;
    dailySummary: string | null;
    insights: string | null;
    recommendations: string | null;
    dashboard: string | null;
  };
  
  // Actions
  // Workout Plans
  fetchWorkoutPlans: (activeOnly?: boolean) => Promise<void>;
  createWorkoutPlan: (plan: WorkoutPlanCreate) => Promise<void>;
  updateWorkoutPlan: (id: string, plan: Partial<WorkoutPlanCreate>) => Promise<void>;
  deleteWorkoutPlan: (id: string) => Promise<void>;
  
  // Workout Sessions
  fetchWorkoutSessions: (limit?: number, offset?: number, type?: ActivityType) => Promise<void>;
  createWorkoutSession: (session: WorkoutSessionCreate) => Promise<void>;
  updateWorkoutSession: (id: string, session: Partial<WorkoutSessionCreate>) => Promise<void>;
  completeWorkoutSession: (id: string) => Promise<void>;
  deleteWorkoutSession: (id: string) => Promise<void>;
  
  // Nutrition
  fetchNutritionEntries: (limit?: number, offset?: number, mealType?: NutritionType) => Promise<void>;
  createNutritionEntry: (nutrition: NutritionEntryCreate) => Promise<void>;
  updateNutritionEntry: (id: string, nutrition: Partial<NutritionEntryCreate>) => Promise<void>;
  deleteNutritionEntry: (id: string) => Promise<void>;
  
  // Health Metrics
  fetchHealthMetrics: (limit?: number, offset?: number, metricType?: HealthMetricType) => Promise<void>;
  createHealthMetric: (metric: HealthMetricCreate) => Promise<void>;
  
  // Health Goals
  fetchHealthGoals: () => Promise<void>;
  createHealthGoal: (goal: HealthGoalCreate) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>;
  
  // Achievements and Streaks
  fetchAchievements: () => Promise<void>;
  fetchStreaks: () => Promise<void>;
  
  // Daily Summary
  fetchDailySummary: (date: string) => Promise<void>;
  updateDailySummary: (date: string, summary: Partial<DailyHealthSummary>) => Promise<void>;
  
  // Insights and Recommendations
  fetchInsights: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  
  // Dashboard
  fetchDashboard: () => Promise<void>;
  
  // Utility Actions
  clearErrors: () => void;
  resetStore: () => void;
  
  // Calculation Functions
  getTodaySteps: () => number;
  getTodayCaloriesBurned: () => number;
  getTodayCaloriesConsumed: () => number;
  getWeeklyWorkouts: () => number;
  getCurrentStreak: () => number;
  getGoalProgress: (goalId: string) => number;
  getTotalWorkouts: () => number;
  getAverageWorkoutDuration: () => number;
  getNutritionTotals: () => { calories: number; protein: number; carbs: number; fat: number };
}

// Initial State
const initialState = {
  workoutPlans: [],
  workoutSessions: [],
  nutritionEntries: [],
  healthMetrics: [],
  healthGoals: [],
  achievements: [],
  streaks: [],
  dailySummary: null,
  insights: [],
  recommendations: [],
  dashboard: null,
  
  isLoading: {
    workoutPlans: false,
    workoutSessions: false,
    nutritionEntries: false,
    healthMetrics: false,
    healthGoals: false,
    achievements: false,
    streaks: false,
    dailySummary: false,
    insights: false,
    recommendations: false,
    dashboard: false,
  },
  
  errors: {
    workoutPlans: null,
    workoutSessions: null,
    nutritionEntries: null,
    healthMetrics: null,
    healthGoals: null,
    achievements: null,
    streaks: null,
    dailySummary: null,
    insights: null,
    recommendations: null,
    dashboard: null,
  },
};

// Create Fitness Store
export const useFitnessStore = create<FitnessState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Workout Plans Actions
        fetchWorkoutPlans: async (activeOnly = true) => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, workoutPlans: true },
            errors: { ...state.errors, workoutPlans: null }
          }));
          
          try {
            const plans = await fitnessAPIService.getWorkoutPlans(activeOnly);
            set((state) => ({ 
              workoutPlans: plans,
              isLoading: { ...state.isLoading, workoutPlans: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, workoutPlans: false },
              errors: { ...state.errors, workoutPlans: error instanceof Error ? error.message : 'Failed to fetch workout plans' }
            }));
          }
        },

        createWorkoutPlan: async (plan: WorkoutPlanCreate) => {
          try {
            const newPlan = await fitnessAPIService.createWorkoutPlan(plan);
            set((state) => ({ 
              workoutPlans: [...state.workoutPlans, newPlan]
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutPlans: error instanceof Error ? error.message : 'Failed to create workout plan' }
            }));
            throw error;
          }
        },

        updateWorkoutPlan: async (id: string, plan: Partial<WorkoutPlanCreate>) => {
          try {
            const updatedPlan = await fitnessAPIService.updateWorkoutPlan(id, plan);
            set((state) => ({ 
              workoutPlans: state.workoutPlans.map(p => p.id === id ? updatedPlan : p)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutPlans: error instanceof Error ? error.message : 'Failed to update workout plan' }
            }));
            throw error;
          }
        },

        deleteWorkoutPlan: async (id: string) => {
          try {
            await fitnessAPIService.deleteWorkoutPlan(id);
            set((state) => ({ 
              workoutPlans: state.workoutPlans.filter(p => p.id !== id)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutPlans: error instanceof Error ? error.message : 'Failed to delete workout plan' }
            }));
            throw error;
          }
        },

        // Workout Sessions Actions
        fetchWorkoutSessions: async (limit = 50, offset = 0, type?: ActivityType) => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, workoutSessions: true },
            errors: { ...state.errors, workoutSessions: null }
          }));
          
          try {
            const sessions = await fitnessAPIService.getWorkoutSessions(limit, offset, type);
            set((state) => ({ 
              workoutSessions: sessions,
              isLoading: { ...state.isLoading, workoutSessions: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, workoutSessions: false },
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to fetch workout sessions' }
            }));
          }
        },

        createWorkoutSession: async (session: WorkoutSessionCreate) => {
          try {
            const newSession = await fitnessAPIService.createWorkoutSession(session);
            set((state) => ({ 
              workoutSessions: [newSession, ...state.workoutSessions]
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to create workout session' }
            }));
            throw error;
          }
        },

        updateWorkoutSession: async (id: string, session: Partial<WorkoutSessionCreate>) => {
          try {
            const updatedSession = await fitnessAPIService.updateWorkoutSession(id, session);
            set((state) => ({ 
              workoutSessions: state.workoutSessions.map(s => s.id === id ? updatedSession : s)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to update workout session' }
            }));
            throw error;
          }
        },

        completeWorkoutSession: async (id: string) => {
          try {
            await fitnessAPIService.completeWorkoutSession(id);
            set((state) => ({ 
              workoutSessions: state.workoutSessions.map(s => 
                s.id === id ? { ...s, completed: true, completed_at: new Date().toISOString() } : s
              )
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to complete workout session' }
            }));
            throw error;
          }
        },

        deleteWorkoutSession: async (id: string) => {
          try {
            await fitnessAPIService.deleteWorkoutSession(id);
            set((state) => ({ 
              workoutSessions: state.workoutSessions.filter(s => s.id !== id)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to delete workout session' }
            }));
            throw error;
          }
        },

        // Nutrition Actions
        fetchNutritionEntries: async (limit = 50, offset = 0, mealType?: NutritionType) => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, nutritionEntries: true },
            errors: { ...state.errors, nutritionEntries: null }
          }));
          
          try {
            const entries = await fitnessAPIService.getNutritionEntries(limit, offset, mealType);
            set((state) => ({ 
              nutritionEntries: entries,
              isLoading: { ...state.isLoading, nutritionEntries: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, nutritionEntries: false },
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to fetch nutrition entries' }
            }));
          }
        },

        createNutritionEntry: async (nutrition: NutritionEntryCreate) => {
          try {
            const newEntry = await fitnessAPIService.createNutritionEntry(nutrition);
            set((state) => ({ 
              nutritionEntries: [newEntry, ...state.nutritionEntries]
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to create nutrition entry' }
            }));
            throw error;
          }
        },

        updateNutritionEntry: async (id: string, nutrition: Partial<NutritionEntryCreate>) => {
          try {
            const updatedEntry = await fitnessAPIService.updateNutritionEntry(id, nutrition);
            set((state) => ({ 
              nutritionEntries: state.nutritionEntries.map(e => e.id === id ? updatedEntry : e)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to update nutrition entry' }
            }));
            throw error;
          }
        },

        deleteNutritionEntry: async (id: string) => {
          try {
            await fitnessAPIService.deleteNutritionEntry(id);
            set((state) => ({ 
              nutritionEntries: state.nutritionEntries.filter(e => e.id !== id)
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to delete nutrition entry' }
            }));
            throw error;
          }
        },

        // Health Metrics Actions
        fetchHealthMetrics: async (limit = 50, offset = 0, metricType?: HealthMetricType) => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, healthMetrics: true },
            errors: { ...state.errors, healthMetrics: null }
          }));
          
          try {
            const metrics = await fitnessAPIService.getHealthMetrics(limit, offset, metricType);
            set((state) => ({ 
              healthMetrics: metrics,
              isLoading: { ...state.isLoading, healthMetrics: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, healthMetrics: false },
              errors: { ...state.errors, healthMetrics: error instanceof Error ? error.message : 'Failed to fetch health metrics' }
            }));
          }
        },

        createHealthMetric: async (metric: HealthMetricCreate) => {
          try {
            const newMetric = await fitnessAPIService.createHealthMetric(metric);
            set((state) => ({ 
              healthMetrics: [newMetric, ...state.healthMetrics]
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, healthMetrics: error instanceof Error ? error.message : 'Failed to create health metric' }
            }));
            throw error;
          }
        },

        // Health Goals Actions
        fetchHealthGoals: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, healthGoals: true },
            errors: { ...state.errors, healthGoals: null }
          }));
          
          try {
            const goals = await fitnessAPIService.getHealthGoals();
            set((state) => ({ 
              healthGoals: goals,
              isLoading: { ...state.isLoading, healthGoals: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, healthGoals: false },
              errors: { ...state.errors, healthGoals: error instanceof Error ? error.message : 'Failed to fetch health goals' }
            }));
          }
        },

        createHealthGoal: async (goal: HealthGoalCreate) => {
          try {
            const newGoal = await fitnessAPIService.createHealthGoal(goal);
            set((state) => ({ 
              healthGoals: [...state.healthGoals, newGoal]
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, healthGoals: error instanceof Error ? error.message : 'Failed to create health goal' }
            }));
            throw error;
          }
        },

        updateGoalProgress: async (id: string, currentValue: number) => {
          try {
            await fitnessAPIService.updateGoalProgress(id, currentValue);
            set((state) => ({ 
              healthGoals: state.healthGoals.map(g => 
                g.id === id ? { ...g, current_value: currentValue, progress_percentage: (currentValue / g.target_value) * 100 } : g
              )
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, healthGoals: error instanceof Error ? error.message : 'Failed to update goal progress' }
            }));
            throw error;
          }
        },

        // Achievements and Streaks Actions
        fetchAchievements: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, achievements: true },
            errors: { ...state.errors, achievements: null }
          }));
          
          try {
            const achievements = await fitnessAPIService.getAchievements();
            set((state) => ({ 
              achievements,
              isLoading: { ...state.isLoading, achievements: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, achievements: false },
              errors: { ...state.errors, achievements: error instanceof Error ? error.message : 'Failed to fetch achievements' }
            }));
          }
        },

        fetchStreaks: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, streaks: true },
            errors: { ...state.errors, streaks: null }
          }));
          
          try {
            const streaks = await fitnessAPIService.getStreaks();
            set((state) => ({ 
              streaks,
              isLoading: { ...state.isLoading, streaks: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, streaks: false },
              errors: { ...state.errors, streaks: error instanceof Error ? error.message : 'Failed to fetch streaks' }
            }));
          }
        },

        // Daily Summary Actions
        fetchDailySummary: async (date: string) => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, dailySummary: true },
            errors: { ...state.errors, dailySummary: null }
          }));
          
          try {
            const summary = await fitnessAPIService.getDailySummary(date);
            set((state) => ({ 
              dailySummary: summary,
              isLoading: { ...state.isLoading, dailySummary: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, dailySummary: false },
              errors: { ...state.errors, dailySummary: error instanceof Error ? error.message : 'Failed to fetch daily summary' }
            }));
          }
        },

        updateDailySummary: async (date: string, summary: Partial<DailyHealthSummary>) => {
          try {
            await fitnessAPIService.updateDailySummary(date, summary);
            set((state) => ({ 
              dailySummary: state.dailySummary ? { ...state.dailySummary, ...summary } : null
            }));
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, dailySummary: error instanceof Error ? error.message : 'Failed to update daily summary' }
            }));
            throw error;
          }
        },

        // Insights and Recommendations Actions
        fetchInsights: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, insights: true },
            errors: { ...state.errors, insights: null }
          }));
          
          try {
            const insights = await fitnessAPIService.getInsights();
            set((state) => ({ 
              insights,
              isLoading: { ...state.isLoading, insights: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, insights: false },
              errors: { ...state.errors, insights: error instanceof Error ? error.message : 'Failed to fetch insights' }
            }));
          }
        },

        fetchRecommendations: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, recommendations: true },
            errors: { ...state.errors, recommendations: null }
          }));
          
          try {
            const recommendations = await fitnessAPIService.getRecommendations();
            set((state) => ({ 
              recommendations,
              isLoading: { ...state.isLoading, recommendations: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, recommendations: false },
              errors: { ...state.errors, recommendations: error instanceof Error ? error.message : 'Failed to fetch recommendations' }
            }));
          }
        },

        // Dashboard Actions
        fetchDashboard: async () => {
          set((state) => ({ 
            isLoading: { ...state.isLoading, dashboard: true },
            errors: { ...state.errors, dashboard: null }
          }));
          
          try {
            const dashboard = await fitnessAPIService.getDashboard();
            set((state) => ({ 
              dashboard,
              isLoading: { ...state.isLoading, dashboard: false }
            }));
          } catch (error) {
            set((state) => ({ 
              isLoading: { ...state.isLoading, dashboard: false },
              errors: { ...state.errors, dashboard: error instanceof Error ? error.message : 'Failed to fetch dashboard' }
            }));
          }
        },

        // Utility Actions
        clearErrors: () => {
          set((state) => ({ 
            errors: {
              workoutPlans: null,
              workoutSessions: null,
              nutritionEntries: null,
              healthMetrics: null,
              healthGoals: null,
              achievements: null,
              streaks: null,
              dailySummary: null,
              insights: null,
              recommendations: null,
              dashboard: null,
            }
          }));
        },

        resetStore: () => {
          set(initialState);
        },

        // Calculation Functions
        getTodaySteps: () => {
          const state = get();
          return state.dailySummary?.steps || 0;
        },

        getTodayCaloriesBurned: () => {
          const state = get();
          return state.dailySummary?.calories_burned || 0;
        },

        getTodayCaloriesConsumed: () => {
          const state = get();
          return state.dailySummary?.calories_consumed || 0;
        },

        getWeeklyWorkouts: () => {
          const state = get();
          return state.dashboard?.weekly_stats.workouts || 0;
        },

        getCurrentStreak: () => {
          const state = get();
          const workoutStreak = state.streaks.find(s => s.type === 'workout');
          return workoutStreak?.current_streak || 0;
        },

        getGoalProgress: (goalId: string) => {
          const state = get();
          const goal = state.healthGoals.find(g => g.id === goalId);
          return goal?.progress_percentage || 0;
        },

        getTotalWorkouts: () => {
          const state = get();
          return state.workoutSessions.length;
        },

        getAverageWorkoutDuration: () => {
          const state = get();
          if (state.workoutSessions.length === 0) return 0;
          const totalDuration = state.workoutSessions.reduce((sum, session) => sum + session.duration, 0);
          return Math.round(totalDuration / state.workoutSessions.length);
        },

        getNutritionTotals: () => {
          const state = get();
          const today = new Date().toISOString().split('T')[0];
          const todayEntries = state.nutritionEntries.filter(entry => 
            entry.created_at.startsWith(today)
          );
          
          return todayEntries.reduce((totals, entry) => ({
            calories: totals.calories + entry.total_calories,
            protein: totals.protein + entry.total_protein,
            carbs: totals.carbs + entry.total_carbs,
            fat: totals.fat + entry.total_fat,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        },
      }),
      {
        name: 'fitness-store',
        partialize: (state) => ({
          workoutPlans: state.workoutPlans,
          workoutSessions: state.workoutSessions,
          nutritionEntries: state.nutritionEntries,
          healthMetrics: state.healthMetrics,
          healthGoals: state.healthGoals,
          achievements: state.achievements,
          streaks: state.streaks,
          dailySummary: state.dailySummary,
          insights: state.insights,
          recommendations: state.recommendations,
          dashboard: state.dashboard,
        }),
      }
    ),
    {
      name: 'fitness-store',
    }
  )
);
