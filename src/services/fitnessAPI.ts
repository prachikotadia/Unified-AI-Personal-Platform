import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Base API configuration

// Types
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: ActivityType;
  duration: number;
  intensity: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
  }>;
  schedule: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  name: string;
  type: ActivityType;
  duration: number;
  intensity: string;
  calories_burned?: number;
  heart_rate?: {
    min: number;
    max: number;
    avg: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  started_at: string;
  completed_at?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NutritionEntry {
  id: string;
  user_id: string;
  meal_type: NutritionType;
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    quantity: number;
    unit: string;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber?: number;
  water_intake?: number;
  supplements: Array<{
    name: string;
    dosage: string;
    time: string;
  }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: HealthMetricType;
  value: number;
  unit: string;
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface HealthAchievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  target: number;
  created_at: string;
}

export interface HealthStreak {
  id: string;
  user_id: string;
  type: string;
  current_streak: number;
  longest_streak: number;
  start_date: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface DailyHealthSummary {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  calories_burned: number;
  calories_consumed: number;
  water_intake: number;
  sleep_hours: number;
  workouts: number;
  mood: MoodLevel;
  energy: EnergyLevel;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthInsight {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface HealthRecommendation {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  action_items: string[];
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface FitnessDashboard {
  today_summary: DailyHealthSummary;
  weekly_stats: {
    steps: number;
    calories_burned: number;
    workouts: number;
    active_days: number;
  };
  current_goals: HealthGoal[];
  recent_achievements: HealthAchievement[];
  streaks: HealthStreak[];
  insights: HealthInsight[];
  recommendations: HealthRecommendation[];
}

// Enums
export enum ActivityType {
  RUNNING = 'running',
  WALKING = 'walking',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  WEIGHT_TRAINING = 'weight_training',
  YOGA = 'yoga',
  PILATES = 'pilates',
  HIIT = 'hiit',
  CARDIO = 'cardio',
  STRETCHING = 'stretching',
  SPORTS = 'sports',
  DANCE = 'dance',
  OTHER = 'other'
}

export enum NutritionType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout'
}

export enum HealthMetricType {
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  MUSCLE_MASS = 'muscle_mass',
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  SLEEP_HOURS = 'sleep_hours',
  WATER_INTAKE = 'water_intake',
  BODY_MEASUREMENTS = 'body_measurements'
}

export enum MoodLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  POOR = 'poor',
  TERRIBLE = 'terrible'
}

export enum EnergyLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Request/Response types
export interface WorkoutPlanCreate {
  name: string;
  description?: string;
  type: ActivityType;
  duration: number;
  intensity: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
  }>;
  schedule: Record<string, any>;
}

export interface WorkoutSessionCreate {
  workout_plan_id?: string;
  name: string;
  type: ActivityType;
  duration: number;
  intensity: string;
  calories_burned?: number;
  heart_rate?: {
    min: number;
    max: number;
    avg: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}

export interface NutritionEntryCreate {
  meal_type: NutritionType;
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    quantity: number;
    unit: string;
  }>;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_fiber?: number;
  water_intake?: number;
  supplements?: Array<{
    name: string;
    dosage: string;
    time: string;
  }>;
  notes?: string;
}

export interface HealthMetricCreate {
  metric_type: HealthMetricType;
  value: number;
  unit: string;
  notes?: string;
  source?: string;
}

export interface HealthGoalCreate {
  name: string;
  description?: string;
  type: string;
  target_value: number;
  unit: string;
  deadline: string;
}

// Fitness API Service Class
class FitnessAPIService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Workout Plans
  async getWorkoutPlans(activeOnly: boolean = true): Promise<WorkoutPlan[]> {
    const response = await fetch(`${this.baseURL}/api/health/workout-plans`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<WorkoutPlan[]>(response);
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan> {
    const response = await fetch(`${this.baseURL}/api/health/workout-plans/${planId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<WorkoutPlan>(response);
  }

  async createWorkoutPlan(plan: WorkoutPlanCreate): Promise<WorkoutPlan> {
    const response = await fetch(`${this.baseURL}/api/health/workout-plans`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(plan),
    });
    return this.handleResponse<WorkoutPlan>(response);
  }

  async updateWorkoutPlan(planId: string, plan: Partial<WorkoutPlanCreate>): Promise<WorkoutPlan> {
    const response = await fetch(`${this.baseURL}/api/health/workout-plans/${planId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(plan),
    });
    return this.handleResponse<WorkoutPlan>(response);
  }

  async deleteWorkoutPlan(planId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/workout-plans/${planId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete workout plan: ${response.statusText}`);
    }
  }

  // Workout Sessions
  async getWorkoutSessions(limit: number = 50, offset: number = 0, type?: ActivityType): Promise<WorkoutSession[]> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<WorkoutSession[]>(response);
  }

  async getWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions/${sessionId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  async createWorkoutSession(session: WorkoutSessionCreate): Promise<WorkoutSession> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(session),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  async updateWorkoutSession(sessionId: string, session: Partial<WorkoutSessionCreate>): Promise<WorkoutSession> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions/${sessionId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(session),
    });
    return this.handleResponse<WorkoutSession>(response);
  }

  async completeWorkoutSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions/${sessionId}/complete`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to complete workout session: ${response.statusText}`);
    }
  }

  async deleteWorkoutSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/workout-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete workout session: ${response.statusText}`);
    }
  }

  // Nutrition
  async getNutritionEntries(limit: number = 50, offset: number = 0, mealType?: NutritionType): Promise<NutritionEntry[]> {
    const response = await fetch(`${this.baseURL}/api/health/nutrition`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<NutritionEntry[]>(response);
  }

  async getNutritionEntry(entryId: string): Promise<NutritionEntry> {
    const response = await fetch(`${this.baseURL}/api/health/nutrition/${entryId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<NutritionEntry>(response);
  }

  async createNutritionEntry(nutrition: NutritionEntryCreate): Promise<NutritionEntry> {
    const response = await fetch(`${this.baseURL}/api/health/nutrition`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(nutrition),
    });
    return this.handleResponse<NutritionEntry>(response);
  }

  async updateNutritionEntry(entryId: string, nutrition: Partial<NutritionEntryCreate>): Promise<NutritionEntry> {
    const response = await fetch(`${this.baseURL}/api/health/nutrition/${entryId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(nutrition),
    });
    return this.handleResponse<NutritionEntry>(response);
  }

  async deleteNutritionEntry(entryId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/nutrition/${entryId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete nutrition entry: ${response.statusText}`);
    }
  }

  // Health Metrics
  async getHealthMetrics(limit: number = 50, offset: number = 0, metricType?: HealthMetricType): Promise<HealthMetric[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(metricType && { metric_type: metricType }),
    });
    const response = await fetch(`${this.baseURL}/api/health/metrics?${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthMetric[]>(response);
  }

  async createHealthMetric(metric: HealthMetricCreate): Promise<HealthMetric> {
    const response = await fetch(`${this.baseURL}/api/health/metrics`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(metric),
    });
    return this.handleResponse<HealthMetric>(response);
  }

  // Health Goals
  async getHealthGoals(): Promise<HealthGoal[]> {
    const response = await fetch(`${this.baseURL}/api/health/goals`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthGoal[]>(response);
  }

  async createHealthGoal(goal: HealthGoalCreate): Promise<HealthGoal> {
    const response = await fetch(`${this.baseURL}/api/health/goals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(goal),
    });
    return this.handleResponse<HealthGoal>(response);
  }

  async updateHealthGoal(goalId: string, goal: Partial<HealthGoalCreate>): Promise<HealthGoal> {
    const response = await fetch(`${this.baseURL}/api/health/goals/${goalId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(goal),
    });
    return this.handleResponse<HealthGoal>(response);
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/goals/${goalId}/progress`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ current_value: currentValue }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update goal progress: ${response.statusText}`);
    }
  }

  // Achievements
  async getAchievements(): Promise<HealthAchievement[]> {
    const response = await fetch(`${this.baseURL}/api/health/achievements`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthAchievement[]>(response);
  }

  // Streaks
  async getStreaks(): Promise<HealthStreak[]> {
    const response = await fetch(`${this.baseURL}/api/health/streaks`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthStreak[]>(response);
  }

  // Daily Summary
  async getDailySummary(date: string): Promise<DailyHealthSummary> {
    const response = await fetch(`${this.baseURL}/api/health/daily-summary/${date}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DailyHealthSummary>(response);
  }

  async updateDailySummary(date: string, summary: Partial<DailyHealthSummary>): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/health/daily-summary/${date}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(summary),
    });
    if (!response.ok) {
      throw new Error(`Failed to update daily summary: ${response.statusText}`);
    }
  }

  // Insights and Recommendations
  async getInsights(): Promise<HealthInsight[]> {
    const response = await fetch(`${this.baseURL}/api/health/insights`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthInsight[]>(response);
  }

  async getRecommendations(): Promise<HealthRecommendation[]> {
    const response = await fetch(`${this.baseURL}/api/health/recommendations`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<HealthRecommendation[]>(response);
  }

  // Analytics
  async getWorkoutAnalytics(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/health/analytics/workouts`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getNutritionAnalytics(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/health/analytics/nutrition`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  // Dashboard
  async getDashboard(): Promise<FitnessDashboard> {
    const response = await fetch(`${this.baseURL}/api/health/dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<FitnessDashboard>(response);
  }
}

// Mock Fitness API for development/fallback
const mockFitnessAPI = {
  // Workout Plans
  getWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Beginner Cardio',
        description: 'Simple cardio workout for beginners',
        type: ActivityType.CARDIO,
        duration: 30,
        intensity: 'moderate',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: 20, duration: 60 },
          { name: 'Mountain Climbers', sets: 3, reps: 15, duration: 45 },
          { name: 'Burpees', sets: 3, reps: 10, duration: 30 },
        ],
        schedule: { monday: true, wednesday: true, friday: true },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  getWorkoutPlan: async (planId: string): Promise<WorkoutPlan> => {
    return {
      id: planId,
      user_id: 'user_123',
      name: 'Beginner Cardio',
      description: 'Simple cardio workout for beginners',
      type: ActivityType.CARDIO,
      duration: 30,
      intensity: 'moderate',
      exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: 20, duration: 60 },
        { name: 'Mountain Climbers', sets: 3, reps: 15, duration: 45 },
        { name: 'Burpees', sets: 3, reps: 10, duration: 30 },
      ],
      schedule: { monday: true, wednesday: true, friday: true },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  createWorkoutPlan: async (plan: WorkoutPlanCreate): Promise<WorkoutPlan> => {
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...plan,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateWorkoutPlan: async (planId: string, plan: Partial<WorkoutPlanCreate>): Promise<WorkoutPlan> => {
    return {
      id: planId,
      user_id: 'user_123',
      name: 'Updated Plan',
      description: 'Updated description',
      type: ActivityType.CARDIO,
      duration: 30,
      intensity: 'moderate',
      exercises: [],
      schedule: {},
      ...plan,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  deleteWorkoutPlan: async (planId: string): Promise<void> => {
    console.log('Mock: Deleted workout plan', planId);
  },

  // Workout Sessions
  getWorkoutSessions: async (): Promise<WorkoutSession[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Morning Run',
        type: ActivityType.RUNNING,
        duration: 45,
        intensity: 'moderate',
        calories_burned: 320,
        heart_rate: { min: 120, max: 160, avg: 140 },
        started_at: new Date().toISOString(),
        completed: true,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  getWorkoutSession: async (sessionId: string): Promise<WorkoutSession> => {
    return {
      id: sessionId,
      user_id: 'user_123',
      name: 'Morning Run',
      type: ActivityType.RUNNING,
      duration: 45,
      intensity: 'moderate',
      calories_burned: 320,
      heart_rate: { min: 120, max: 160, avg: 140 },
      started_at: new Date().toISOString(),
      completed: true,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  createWorkoutSession: async (session: WorkoutSessionCreate): Promise<WorkoutSession> => {
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...session,
      started_at: new Date().toISOString(),
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateWorkoutSession: async (sessionId: string, session: Partial<WorkoutSessionCreate>): Promise<WorkoutSession> => {
    return {
      id: sessionId,
      user_id: 'user_123',
      name: 'Updated Session',
      type: ActivityType.RUNNING,
      duration: 45,
      intensity: 'moderate',
      ...session,
      started_at: new Date().toISOString(),
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  completeWorkoutSession: async (sessionId: string): Promise<void> => {
    console.log('Mock: Completed workout session', sessionId);
  },

  deleteWorkoutSession: async (sessionId: string): Promise<void> => {
    console.log('Mock: Deleted workout session', sessionId);
  },

  // Nutrition
  getNutritionEntries: async (): Promise<NutritionEntry[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        meal_type: NutritionType.BREAKFAST,
        foods: [
          { name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 3, quantity: 1, unit: 'cup' },
          { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, quantity: 1, unit: 'medium' },
        ],
        total_calories: 255,
        total_protein: 7,
        total_carbs: 54,
        total_fat: 3,
        supplements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  getNutritionEntry: async (entryId: string): Promise<NutritionEntry> => {
    return {
      id: entryId,
      user_id: 'user_123',
      meal_type: NutritionType.BREAKFAST,
      foods: [
        { name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 3, quantity: 1, unit: 'cup' },
        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, quantity: 1, unit: 'medium' },
      ],
      total_calories: 255,
      total_protein: 7,
      total_carbs: 54,
      total_fat: 3,
      supplements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  createNutritionEntry: async (nutrition: NutritionEntryCreate): Promise<NutritionEntry> => {
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...nutrition,
      total_calories: nutrition.total_calories || 0,
      total_protein: nutrition.total_protein || 0,
      total_carbs: nutrition.total_carbs || 0,
      total_fat: nutrition.total_fat || 0,
      supplements: nutrition.supplements || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateNutritionEntry: async (entryId: string, nutrition: Partial<NutritionEntryCreate>): Promise<NutritionEntry> => {
    return {
      id: entryId,
      user_id: 'user_123',
      meal_type: NutritionType.BREAKFAST,
      foods: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      supplements: [],
      ...nutrition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  deleteNutritionEntry: async (entryId: string): Promise<void> => {
    console.log('Mock: Deleted nutrition entry', entryId);
  },

  // Health Metrics
  getHealthMetrics: async (): Promise<HealthMetric[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        metric_type: HealthMetricType.WEIGHT,
        value: 70.5,
        unit: 'kg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  createHealthMetric: async (metric: HealthMetricCreate): Promise<HealthMetric> => {
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...metric,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  // Health Goals
  getHealthGoals: async (): Promise<HealthGoal[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'Lose 5kg',
        description: 'Weight loss goal',
        type: 'weight_loss',
        target_value: 65,
        current_value: 70.5,
        unit: 'kg',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        progress_percentage: 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  createHealthGoal: async (goal: HealthGoalCreate): Promise<HealthGoal> => {
    return {
      id: Date.now().toString(),
      user_id: 'user_123',
      ...goal,
      current_value: 0,
      status: 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateHealthGoal: async (goalId: string, goal: Partial<HealthGoalCreate>): Promise<HealthGoal> => {
    return {
      id: goalId,
      user_id: 'user_123',
      name: goal.name || 'Updated Goal',
      description: goal.description || '',
      type: goal.type || 'weight',
      target_value: goal.target_value || 0,
      current_value: 0, // This is not part of HealthGoalCreate
      unit: goal.unit || '',
      deadline: goal.deadline || new Date().toISOString(),
      status: 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateGoalProgress: async (goalId: string, currentValue: number): Promise<void> => {
    console.log('Mock: Updated goal progress', goalId, currentValue);
  },

  // Achievements
  getAchievements: async (): Promise<HealthAchievement[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        name: 'First Workout',
        description: 'Complete your first workout',
        type: 'workout',
        icon: '🏃‍♂️',
        unlocked: true,
        unlocked_at: new Date().toISOString(),
        progress: 100,
        target: 1,
        created_at: new Date().toISOString(),
      },
    ];
  },

  // Streaks
  getStreaks: async (): Promise<HealthStreak[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        type: 'workout',
        current_streak: 7,
        longest_streak: 15,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  // Daily Summary
  getDailySummary: async (date: string): Promise<DailyHealthSummary> => {
    return {
      id: '1',
      user_id: 'user_123',
      date,
      steps: 8420,
      calories_burned: 420,
      calories_consumed: 1850,
      water_intake: 2000,
      sleep_hours: 7.5,
      workouts: 1,
      mood: MoodLevel.GOOD,
      energy: EnergyLevel.MEDIUM,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updateDailySummary: async (date: string, summary: Partial<DailyHealthSummary>): Promise<void> => {
    console.log('Mock: Updated daily summary', date, summary);
  },

  // Insights and Recommendations
  getInsights: async (): Promise<HealthInsight[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        type: 'performance',
        title: 'Improving Cardio Performance',
        description: 'Your cardio sessions are getting stronger. Consider increasing intensity.',
        data: { improvement: 15 },
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
    ];
  },

  getRecommendations: async (): Promise<HealthRecommendation[]> => {
    return [
      {
        id: '1',
        user_id: 'user_123',
        type: 'workout',
        title: 'Try HIIT Training',
        description: 'High-intensity interval training can boost your metabolism',
        action_items: ['Start with 20-minute sessions', 'Include 30-second sprints', 'Rest for 1 minute between intervals'],
        priority: 'high',
        created_at: new Date().toISOString(),
      },
    ];
  },

  // Analytics
  getWorkoutAnalytics: async (): Promise<any> => {
    return {
      total_workouts: 25,
      total_duration: 1200,
      total_calories: 15000,
      average_duration: 48,
      favorite_activity: ActivityType.RUNNING,
      weekly_progress: [10, 12, 8, 15, 9, 11, 13],
    };
  },

  getNutritionAnalytics: async (): Promise<any> => {
    return {
      average_calories: 1850,
      protein_goal_met: 85,
      carbs_goal_met: 90,
      fat_goal_met: 95,
      water_goal_met: 80,
      weekly_trends: [1800, 1900, 1750, 1850, 2000, 1800, 1850],
    };
  },

  // Dashboard
  getDashboard: async (): Promise<FitnessDashboard> => {
    return {
      today_summary: {
        id: '1',
        user_id: 'user_123',
        date: new Date().toISOString().split('T')[0],
        steps: 8420,
        calories_burned: 420,
        calories_consumed: 1850,
        water_intake: 2000,
        sleep_hours: 7.5,
        workouts: 1,
        mood: MoodLevel.GOOD,
        energy: EnergyLevel.MEDIUM,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      weekly_stats: {
        steps: 58000,
        calories_burned: 2800,
        workouts: 5,
        active_days: 6,
      },
      current_goals: [
        {
          id: '1',
          user_id: 'user_123',
          name: 'Lose 5kg',
          description: 'Weight loss goal',
          type: 'weight_loss',
          target_value: 65,
          current_value: 70.5,
          unit: 'kg',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          progress_percentage: 70,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      recent_achievements: [
        {
          id: '1',
          user_id: 'user_123',
          name: 'First Workout',
          description: 'Complete your first workout',
          type: 'workout',
          icon: '🏃‍♂️',
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress: 100,
          target: 1,
          created_at: new Date().toISOString(),
        },
      ],
      streaks: [
        {
          id: '1',
          user_id: 'user_123',
          type: 'workout',
          current_streak: 7,
          longest_streak: 15,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      insights: [
        {
          id: '1',
          user_id: 'user_123',
          type: 'performance',
          title: 'Improving Cardio Performance',
          description: 'Your cardio sessions are getting stronger. Consider increasing intensity.',
          data: { improvement: 15 },
          priority: 'medium',
          created_at: new Date().toISOString(),
        },
      ],
      recommendations: [
        {
          id: '1',
          user_id: 'user_123',
          type: 'workout',
          title: 'Try HIIT Training',
          description: 'High-intensity interval training can boost your metabolism',
          action_items: ['Start with 20-minute sessions', 'Include 30-second sprints', 'Rest for 1 minute between intervals'],
          priority: 'high',
          created_at: new Date().toISOString(),
        },
      ],
    };
  },
};

// Export the appropriate API based on environment
const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true';
export const fitnessAPIService = useMockAPI ? mockFitnessAPI : new FitnessAPIService();
