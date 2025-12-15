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
import { isGuestMode, generateLocalId } from '../utils/financeHelpers';

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
  updateHealthGoal: (id: string, goal: Partial<HealthGoalCreate>) => Promise<void>;
  deleteHealthGoal: (id: string) => Promise<void>;
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
  
  // Streak Actions
  incrementStreak: (type?: string) => void;
  isStreakMarkedToday: (type?: string) => boolean;
  getStreakInfo: (type?: string) => {
    current: number;
    longest: number;
    isActive: boolean;
    lastActivity: string | null;
    startDate: string | null;
    daysUntilNextMilestone: number | null;
    nextMilestone: number | null | undefined;
  };
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
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            // Don't overwrite existing data
            return;
          }
          
          set((state) => ({ 
            isLoading: { ...state.isLoading, workoutPlans: true },
            errors: { ...state.errors, workoutPlans: null }
          }));
          
          try {
            const plans = await fitnessAPIService.getWorkoutPlans(activeOnly);
            // Merge with existing local plans (local takes precedence)
            set((state) => {
              const existingPlans = state.workoutPlans || [];
              const apiPlansMap = new Map(plans.map(p => [p.id, p]));
              const localPlansMap = new Map(existingPlans.map(p => [p.id, p]));
              
              // Merge: Local plans take precedence, then API plans that don't exist locally
              const mergedPlans = [
                ...Array.from(localPlansMap.values()),
                ...Array.from(apiPlansMap.values()).filter(p => !localPlansMap.has(p.id))
              ];
              
              return {
                workoutPlans: mergedPlans,
                isLoading: { ...state.isLoading, workoutPlans: false }
              };
            });
          } catch (error) {
            // Don't overwrite existing plans if API fails - keep what's in localStorage
            set((state) => ({ 
              isLoading: { ...state.isLoading, workoutPlans: false },
              errors: { ...state.errors, workoutPlans: null } // Don't show error, just use local data
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
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            // Don't overwrite existing data
            return;
          }
          
          set((state) => ({ 
            isLoading: { ...state.isLoading, workoutSessions: true },
            errors: { ...state.errors, workoutSessions: null }
          }));
          
          try {
            const sessions = await fitnessAPIService.getWorkoutSessions(limit, offset, type);
            // Merge with existing local sessions (local takes precedence)
            set((state) => {
              const existingSessions = state.workoutSessions || [];
              const apiSessionsMap = new Map(sessions.map(s => [s.id, s]));
              const localSessionsMap = new Map(existingSessions.map(s => [s.id, s]));
              
              // Merge: Local sessions take precedence, then API sessions that don't exist locally
              const mergedSessions = [
                ...Array.from(localSessionsMap.values()),
                ...Array.from(apiSessionsMap.values()).filter(s => !localSessionsMap.has(s.id))
              ];
              
              return {
                workoutSessions: mergedSessions,
                isLoading: { ...state.isLoading, workoutSessions: false }
              };
            });
          } catch (error) {
            // Don't overwrite existing sessions if API fails - keep what's in localStorage
            set((state) => ({ 
              isLoading: { ...state.isLoading, workoutSessions: false },
              errors: { ...state.errors, workoutSessions: null } // Don't show error, just use local data
            }));
          }
        },

        createWorkoutSession: async (session: WorkoutSessionCreate) => {
          try {
            const guest = isGuestMode();
            let newSession: WorkoutSession;
            
            if (guest) {
              // Guest mode: Create locally only
              newSession = {
                id: generateLocalId(),
                user_id: 'guest_user',
                name: session.name || 'Workout',
                type: session.type || 'strength',
                duration: session.duration || 30,
                intensity: session.intensity || 'moderate',
                calories_burned: session.calories_burned || 0,
                notes: session.notes || '',
                completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as WorkoutSession;
            } else {
              // Logged-in mode: Call API
              newSession = await fitnessAPIService.createWorkoutSession(session);
            }
            
            set((state) => ({ 
              workoutSessions: [newSession, ...state.workoutSessions]
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to create workout session' }
            }));
            // In guest mode, don't throw error, just log it
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        updateWorkoutSession: async (id: string, session: Partial<WorkoutSessionCreate>) => {
          try {
            const guest = isGuestMode();
            let updatedSession: WorkoutSession;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().workoutSessions.find(s => s.id === id);
              if (!existing) throw new Error('Workout session not found');
              
              updatedSession = {
                ...existing,
                ...session,
                updated_at: new Date().toISOString(),
              } as WorkoutSession;
            } else {
              // Logged-in mode: Call API
              updatedSession = await fitnessAPIService.updateWorkoutSession(id, session);
            }
            
            set((state) => ({ 
              workoutSessions: state.workoutSessions.map(s => s.id === id ? updatedSession : s)
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to update workout session' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
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
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await fitnessAPIService.deleteWorkoutSession(id);
            }
            // Guest mode: Just remove from state
            
            set((state) => ({ 
              workoutSessions: state.workoutSessions.filter(s => s.id !== id)
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, workoutSessions: error instanceof Error ? error.message : 'Failed to delete workout session' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        // Nutrition Actions
        fetchNutritionEntries: async (limit = 50, offset = 0, mealType?: NutritionType) => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set((state) => ({ 
            isLoading: { ...state.isLoading, nutritionEntries: true },
            errors: { ...state.errors, nutritionEntries: null }
          }));
          
          try {
            const entries = await fitnessAPIService.getNutritionEntries(limit, offset, mealType);
            // Merge with existing local entries (local takes precedence)
            set((state) => {
              const existingEntries = state.nutritionEntries || [];
              const apiEntriesMap = new Map(entries.map(e => [e.id, e]));
              const localEntriesMap = new Map(existingEntries.map(e => [e.id, e]));
              
              // Merge: Local entries take precedence, then API entries that don't exist locally
              const mergedEntries = [
                ...Array.from(localEntriesMap.values()),
                ...Array.from(apiEntriesMap.values()).filter(e => !localEntriesMap.has(e.id))
              ];
              
              return {
                nutritionEntries: mergedEntries,
                isLoading: { ...state.isLoading, nutritionEntries: false }
              };
            });
          } catch (error) {
            // Don't overwrite existing entries if API fails - keep what's in localStorage
            set((state) => ({ 
              isLoading: { ...state.isLoading, nutritionEntries: false },
              errors: { ...state.errors, nutritionEntries: null } // Don't show error, just use local data
            }));
          }
        },

        createNutritionEntry: async (nutrition: NutritionEntryCreate) => {
          try {
            const guest = isGuestMode();
            let newEntry: NutritionEntry;
            
            if (guest) {
              // Guest mode: Create locally only
              newEntry = {
                id: generateLocalId(),
                user_id: 'guest_user',
                meal_type: nutrition.meal_type || 'breakfast',
                foods: nutrition.foods || [],
                total_calories: nutrition.total_calories || 0,
                total_protein: nutrition.total_protein || 0,
                total_carbs: nutrition.total_carbs || 0,
                total_fat: nutrition.total_fat || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as NutritionEntry;
            } else {
              // Logged-in mode: Call API
              newEntry = await fitnessAPIService.createNutritionEntry(nutrition);
            }
            
            set((state) => ({ 
              nutritionEntries: [newEntry, ...state.nutritionEntries]
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to create nutrition entry' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        updateNutritionEntry: async (id: string, nutrition: Partial<NutritionEntryCreate>) => {
          try {
            const guest = isGuestMode();
            let updatedEntry: NutritionEntry;
            
            if (guest) {
              // Guest mode: Update locally only
              const existing = get().nutritionEntries.find(e => e.id === id);
              if (!existing) throw new Error('Nutrition entry not found');
              
              updatedEntry = {
                ...existing,
                ...nutrition,
                updated_at: new Date().toISOString(),
              } as NutritionEntry;
            } else {
              // Logged-in mode: Call API
              updatedEntry = await fitnessAPIService.updateNutritionEntry(id, nutrition);
            }
            
            set((state) => ({ 
              nutritionEntries: state.nutritionEntries.map(e => e.id === id ? updatedEntry : e)
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to update nutrition entry' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        deleteNutritionEntry: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest) {
              // Logged-in mode: Call API
              await fitnessAPIService.deleteNutritionEntry(id);
            }
            // Guest mode: Just remove from state
            
            set((state) => ({ 
              nutritionEntries: state.nutritionEntries.filter(e => e.id !== id)
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, nutritionEntries: error instanceof Error ? error.message : 'Failed to delete nutrition entry' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        // Health Metrics Actions
        fetchHealthMetrics: async (limit = 50, offset = 0, metricType?: HealthMetricType) => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            return;
          }
          
          set((state) => ({ 
            isLoading: { ...state.isLoading, healthMetrics: true },
            errors: { ...state.errors, healthMetrics: null }
          }));
          
          try {
            const metrics = await fitnessAPIService.getHealthMetrics(limit, offset, metricType);
            // Merge with existing local metrics (local takes precedence)
            set((state) => {
              const existingMetrics = state.healthMetrics || [];
              const apiMetricsMap = new Map(metrics.map(m => [m.id, m]));
              const localMetricsMap = new Map(existingMetrics.map(m => [m.id, m]));
              
              // Merge: Local metrics take precedence, then API metrics that don't exist locally
              const mergedMetrics = [
                ...Array.from(localMetricsMap.values()),
                ...Array.from(apiMetricsMap.values()).filter(m => !localMetricsMap.has(m.id))
              ];
              
              return {
                healthMetrics: mergedMetrics,
                isLoading: { ...state.isLoading, healthMetrics: false }
              };
            });
          } catch (error) {
            // Don't overwrite existing metrics if API fails - keep what's in localStorage
            set((state) => ({ 
              isLoading: { ...state.isLoading, healthMetrics: false },
              errors: { ...state.errors, healthMetrics: null } // Don't show error, just use local data
            }));
          }
        },

        createHealthMetric: async (metric: HealthMetricCreate) => {
          try {
            const guest = isGuestMode();
            let newMetric: HealthMetric;
            
            if (guest) {
              // Guest mode: Create locally only
              newMetric = {
                id: generateLocalId(),
                user_id: 'guest_user',
                metric_type: metric.metric_type,
                value: metric.value,
                unit: metric.unit || 'kg',
                notes: metric.notes || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as HealthMetric;
            } else {
              // Logged-in mode: Call API
              newMetric = await fitnessAPIService.createHealthMetric(metric);
            }
            
            set((state) => ({ 
              healthMetrics: [newMetric, ...state.healthMetrics]
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            set((state) => ({ 
              errors: { ...state.errors, healthMetrics: error instanceof Error ? error.message : 'Failed to create health metric' }
            }));
            if (!isGuestMode()) {
              throw error;
            }
          }
        },

        // Health Goals Actions
        fetchHealthGoals: async () => {
          const guest = isGuestMode();
          
          if (guest) {
            // Guest mode: Data is already loaded from localStorage via persist middleware
            // Don't overwrite existing data
            return;
          }
          
          set((state) => ({ 
            isLoading: { ...state.isLoading, healthGoals: true },
            errors: { ...state.errors, healthGoals: null }
          }));
          
          try {
            const goals = await fitnessAPIService.getHealthGoals();
            // Merge with existing local goals (local takes precedence)
            set((state) => {
              const existingGoals = state.healthGoals || [];
              const apiGoalsMap = new Map(goals.map(g => [g.id, g]));
              const localGoalsMap = new Map(existingGoals.map(g => [g.id, g]));
              
              // Merge: Local goals take precedence, then API goals that don't exist locally
              const mergedGoals = [
                ...Array.from(localGoalsMap.values()),
                ...Array.from(apiGoalsMap.values()).filter(g => !localGoalsMap.has(g.id))
              ];
              
              return {
                healthGoals: mergedGoals,
                isLoading: { ...state.isLoading, healthGoals: false }
              };
            });
          } catch (error) {
            // Don't overwrite existing goals if API fails - keep what's in localStorage
            set((state) => ({ 
              isLoading: { ...state.isLoading, healthGoals: false },
              errors: { ...state.errors, healthGoals: null } // Don't show error, just use local data
            }));
          }
        },

        createHealthGoal: async (goal: HealthGoalCreate) => {
          try {
            const guest = isGuestMode();
            let newGoal: HealthGoal;
            
            if (guest) {
              // Guest mode: Create locally only
              newGoal = {
                id: generateLocalId(),
                user_id: 'guest_user',
                name: (goal as any).name || '',
                description: goal.description || '',
                type: (goal as any).type || 'weight',
                target_value: goal.target_value || 0,
                current_value: (goal as any).current_value || 0,
                unit: goal.unit || '',
                deadline: goal.deadline || new Date().toISOString(),
                status: 'active',
                progress_percentage: goal.target_value > 0 ? (((goal as any).current_value || 0) / goal.target_value) * 100 : 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as HealthGoal;
            } else {
              // Logged-in mode: Call API
              newGoal = await fitnessAPIService.createHealthGoal(goal);
            }
            
            set((state) => ({ 
              healthGoals: [...state.healthGoals, newGoal]
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            // Fallback to local creation if API fails
            const localGoal: HealthGoal = {
              id: generateLocalId(),
              user_id: 'guest_user',
              name: (goal as any).name || '',
              description: goal.description || '',
              type: (goal as any).type || 'weight',
              target_value: goal.target_value || 0,
              current_value: (goal as any).current_value || 0,
              unit: goal.unit || '',
              deadline: goal.deadline || new Date().toISOString(),
              status: 'active',
              progress_percentage: goal.target_value > 0 ? (((goal as any).current_value || 0) / goal.target_value) * 100 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            set((state) => ({ 
              healthGoals: [...state.healthGoals, localGoal]
            }));
          }
        },

        updateHealthGoal: async (id: string, goal: Partial<HealthGoalCreate>) => {
          try {
            await fitnessAPIService.updateHealthGoal?.(id, goal);
            set((state) => ({
              healthGoals: state.healthGoals.map(g =>
                g.id === id ? { ...g, ...goal, updated_at: new Date().toISOString() } : g
              )
            }));
          } catch (error) {
            // In guest mode, update locally
            set((state) => ({
              healthGoals: state.healthGoals.map(g =>
                g.id === id ? { ...g, ...goal, updated_at: new Date().toISOString() } : g
              )
            }));
          }
        },

        deleteHealthGoal: async (id: string) => {
          try {
            const guest = isGuestMode();
            
            if (!guest && (fitnessAPIService as any).deleteHealthGoal) {
              // Logged-in mode: Call API
              await (fitnessAPIService as any).deleteHealthGoal(id);
            }
            // Guest mode: Just remove from state
            
            set((state) => ({
              healthGoals: state.healthGoals.filter(g => g.id !== id)
            }));
            // localStorage is automatically updated via persist middleware
          } catch (error) {
            // Fallback to local delete if API fails
            set((state) => ({
              healthGoals: state.healthGoals.filter(g => g.id !== id)
            }));
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
            // In guest mode, initialize with empty streaks if needed
            const state = get();
            if (state.streaks.length === 0) {
              const today = new Date().toISOString();
              const defaultStreak: HealthStreak = {
                id: generateLocalId(),
                user_id: 'guest',
                type: 'workout',
                current_streak: 0,
                longest_streak: 0,
                start_date: today,
                last_activity: today,
                created_at: today,
                updated_at: today,
              };
              set((state) => ({ 
                streaks: [defaultStreak],
                isLoading: { ...state.isLoading, streaks: false }
              }));
            } else {
              set((state) => ({ 
                isLoading: { ...state.isLoading, streaks: false },
                errors: { ...state.errors, streaks: error instanceof Error ? error.message : 'Failed to fetch streaks' }
              }));
            }
          }
        },
        
        incrementStreak: (type = 'workout') => {
          const state = get();
          const now = new Date();
          const today = now.toISOString().split('T')[0];
          
          // Check if today is already marked
          const existingStreak = state.streaks.find(s => s.type === type);
          if (existingStreak) {
            const lastActivityDate = existingStreak.last_activity?.split('T')[0];
            
            // If already marked today, don't increment
            if (lastActivityDate === today) {
              return;
            }
            
            // Calculate yesterday's date properly
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            let newStreak = existingStreak.current_streak;
            let newStartDate = existingStreak.start_date;
            
            if (lastActivityDate === yesterdayStr) {
              // Continue streak - perfect continuation
              newStreak = existingStreak.current_streak + 1;
            } else if (lastActivityDate && lastActivityDate < yesterdayStr) {
              // Streak broken - more than 1 day gap, reset to 1
              newStreak = 1;
              newStartDate = now.toISOString();
            } else if (!lastActivityDate) {
              // No previous activity, start new streak
              newStreak = 1;
              newStartDate = now.toISOString();
            } else {
              // Same day or future date (shouldn't happen, but handle gracefully)
              newStreak = existingStreak.current_streak;
            }
            
            const updatedStreak: HealthStreak = {
              ...existingStreak,
              current_streak: newStreak,
              longest_streak: Math.max(existingStreak.longest_streak, newStreak),
              start_date: newStartDate,
              last_activity: now.toISOString(),
              updated_at: now.toISOString(),
            };
            
            set((state) => ({
              streaks: state.streaks.map(s => s.type === type ? updatedStreak : s)
            }));
          } else {
            // Create new streak
            const newStreak: HealthStreak = {
              id: generateLocalId(),
              user_id: isGuestMode() ? 'guest' : '',
              type: type,
              current_streak: 1,
              longest_streak: 1,
              start_date: now.toISOString(),
              last_activity: now.toISOString(),
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
            };
            
            set((state) => ({
              streaks: [...state.streaks, newStreak]
            }));
          }
        },
        
        isStreakMarkedToday: (type = 'workout') => {
          const state = get();
          const today = new Date().toISOString().split('T')[0];
          const streak = state.streaks.find(s => s.type === type);
          
          if (!streak || !streak.last_activity) {
            return false;
          }
          
          const lastActivityDate = streak.last_activity.split('T')[0];
          return lastActivityDate === today;
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
          if (!workoutStreak) return 0;
          
          // Check if streak is still valid (not broken)
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const lastActivityDate = workoutStreak.last_activity?.split('T')[0];
          
          // If last activity was yesterday or today, streak is still valid
          if (lastActivityDate === today || lastActivityDate === yesterdayStr) {
            return workoutStreak.current_streak;
          }
          
          // If last activity was before yesterday, streak is broken (return 0 or keep showing until user marks again)
          // For better UX, we'll still show the streak but it will reset when they mark again
          return workoutStreak.current_streak;
        },
        
        getStreakInfo: (type = 'workout') => {
          const state = get();
          const streak = state.streaks.find(s => s.type === type);
          if (!streak) {
            return {
              current: 0,
              longest: 0,
              isActive: false,
              lastActivity: null,
              startDate: null,
              daysUntilNextMilestone: null,
              nextMilestone: null,
            };
          }
          
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const lastActivityDate = streak.last_activity?.split('T')[0];
          
          const isActive = lastActivityDate === today || lastActivityDate === yesterdayStr;
          
          // Calculate next milestone (10, 30, 50, 100, etc.)
          const milestones = [10, 30, 50, 100, 200, 365];
          const nextMilestone = milestones.find(m => m > streak.current_streak) || null;
          const daysUntilNextMilestone = nextMilestone ? nextMilestone - streak.current_streak : null;
          
          return {
            current: streak.current_streak,
            longest: streak.longest_streak,
            isActive,
            lastActivity: streak.last_activity,
            startDate: streak.start_date,
            daysUntilNextMilestone,
            nextMilestone,
          };
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
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Migration logic for future structure changes
          if (version === 0) {
            // Ensure all arrays exist
            return {
              ...persistedState,
              workoutPlans: persistedState.workoutPlans || [],
              workoutSessions: persistedState.workoutSessions || [],
              nutritionEntries: persistedState.nutritionEntries || [],
              healthMetrics: persistedState.healthMetrics || [],
              healthGoals: persistedState.healthGoals || [],
            };
          }
          return persistedState;
        },
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name);
              if (!str) return null;
              const parsed = JSON.parse(str);
              // Validate structure
              if (!parsed.state) {
                console.warn(`[Fitness Store] Invalid localStorage structure for ${name}, resetting...`);
                return null;
              }
              return parsed;
            } catch (error) {
              console.error(`[Fitness Store] Failed to parse localStorage for ${name}:`, error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error(`[Fitness Store] Failed to save to localStorage for ${name}:`, error);
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error(`[Fitness Store] Failed to remove from localStorage for ${name}:`, error);
            }
          },
        },
      }
    ),
    {
      name: 'fitness-store-devtools',
    }
  )
);
