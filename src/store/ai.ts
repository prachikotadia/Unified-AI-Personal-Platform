import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIInsight {
  id: string
  type: 'finance' | 'marketplace' | 'fitness' | 'travel' | 'social' | 'chat'
  title: string
  description: string
  confidence: number
  action?: string
  actionType?: 'message' | 'product_search' | 'budget_create' | 'workout_plan' | 'trip_plan' | 'social_post' | 'reminder'
  actionData?: any
  data?: any
  timestamp: Date
  ai_model: string
}

export interface AIRecommendation {
  id: string
  type: 'finance' | 'marketplace' | 'fitness' | 'travel' | 'social' | 'chat'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  action?: string
  actionType?: 'message' | 'product_search' | 'budget_create' | 'workout_plan' | 'trip_plan' | 'social_post' | 'reminder'
  actionData?: any
  data?: any
  timestamp: Date
  ai_model: string
}

export interface AIPrediction {
  id: string
  type: 'finance' | 'marketplace' | 'fitness' | 'travel' | 'social' | 'chat'
  title: string
  prediction: string
  confidence: number
  timeframe: string
  factors: string[]
  action?: string
  actionType?: 'message' | 'product_search' | 'budget_create' | 'workout_plan' | 'trip_plan' | 'social_post' | 'reminder'
  actionData?: any
  timestamp: Date
  ai_model: string
}

export interface AIConversation {
  id: string
  module: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    actions?: AIAction[]
  }>
  timestamp: Date
  ai_model: string
}

export interface AIAction {
  id: string
  type: string
  title: string
  description: string
  executed: boolean
  data?: any
  timestamp: Date
  ai_model: string
}

export interface AIUser {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

export interface ModelInfo {
  model: string
  version: string
  capabilities: string[]
  max_tokens: number
  temperature: number
  provider: string
}

interface AIState {
  insights: AIInsight[]
  recommendations: AIRecommendation[]
  predictions: AIPrediction[]
  conversations: AIConversation[]
  actions: AIAction[]
  users: AIUser[]
  modelInfo: ModelInfo | null
  isLoading: boolean
  error: string | null
  
  // Actions
  addInsight: (insight: Omit<AIInsight, 'id' | 'timestamp' | 'ai_model'>) => void
  addRecommendation: (recommendation: Omit<AIRecommendation, 'id' | 'timestamp' | 'ai_model'>) => void
  addPrediction: (prediction: Omit<AIPrediction, 'id' | 'timestamp' | 'ai_model'>) => void
  addConversation: (conversation: Omit<AIConversation, 'id' | 'timestamp' | 'ai_model'>) => void
  updateConversation: (id: string, message: { role: 'user' | 'assistant'; content: string; actions?: AIAction[] }) => void
  addAction: (action: Omit<AIAction, 'id' | 'timestamp' | 'ai_model'>) => void
  executeAction: (actionId: string) => void
  setModelInfo: (modelInfo: ModelInfo) => void
  findUser: (query: string) => AIUser[]
  searchProducts: (query: string) => any[]
  createBudget: (data: any) => any
  createWorkoutPlan: (data: any) => any
  planTrip: (data: any) => any
  sendMessage: (userId: string, message: string) => void
  createSocialPost: (data: any) => void
  setReminder: (data: any) => void
  clearInsights: (type?: string) => void
  clearRecommendations: (type?: string) => void
  clearPredictions: (type?: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state
      insights: [
        {
          id: '1',
          type: 'finance',
          title: 'Spending Pattern Detected',
          description: 'Your dining out expenses have increased by 25% this month. Consider setting a budget for restaurants.',
          confidence: 0.85,
          action: 'Create dining budget',
          actionType: 'budget_create',
          actionData: { category: 'dining', amount: 300, period: 'monthly' },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '2',
          type: 'fitness',
          title: 'Workout Consistency Alert',
          description: 'You\'ve missed 3 scheduled workouts this week. Your fitness goals may be at risk.',
          confidence: 0.78,
          action: 'Reschedule workouts',
          actionType: 'workout_plan',
          actionData: { type: 'reschedule', days: ['monday', 'wednesday', 'friday'] },
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '3',
          type: 'travel',
          title: 'Travel Opportunity',
          description: 'Based on your preferences and current deals, Paris would be perfect for your next trip.',
          confidence: 0.72,
          action: 'Plan Paris trip',
          actionType: 'trip_plan',
          actionData: { destination: 'Paris', budget: 2000, duration: 7 },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        }
      ],
      recommendations: [
        {
          id: '1',
          type: 'marketplace',
          title: 'Smart Watch Recommendation',
          description: 'Based on your fitness goals, the Apple Watch Series 9 would be perfect for tracking your workouts.',
          priority: 'high',
          category: 'electronics',
          action: 'View product',
          actionType: 'product_search',
          actionData: { product: 'Apple Watch Series 9', category: 'smartwatches' },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '2',
          type: 'finance',
          title: 'Investment Opportunity',
          description: 'Consider opening a high-yield savings account to maximize your emergency fund returns.',
          priority: 'medium',
          category: 'savings',
          action: 'Research accounts',
          actionType: 'product_search',
          actionData: { category: 'savings_accounts', type: 'high_yield' },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        }
      ],
      predictions: [
        {
          id: '1',
          type: 'finance',
          title: 'Monthly Savings Forecast',
          prediction: 'You\'re projected to save $1,200 this month based on current spending patterns.',
          confidence: 0.87,
          timeframe: '30 days',
          factors: ['Reduced dining out', 'Lower entertainment costs', 'Increased income'],
          action: 'Create savings budget',
          actionType: 'budget_create',
          actionData: { category: 'savings', amount: 1200, period: 'monthly' },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '2',
          type: 'fitness',
          title: 'Weight Loss Prediction',
          prediction: 'At current rate, you\'ll reach your goal weight in 8 weeks.',
          confidence: 0.78,
          timeframe: '8 weeks',
          factors: ['Consistent workouts', 'Calorie deficit', 'Protein intake'],
          action: 'Create weight loss plan',
          actionType: 'workout_plan',
          actionData: { type: 'weight_loss', duration: '8 weeks', target: 'goal_weight' },
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '3',
          type: 'marketplace',
          title: 'Price Prediction',
          prediction: 'Smart watch prices expected to drop 10% in the next 2 weeks.',
          confidence: 0.82,
          timeframe: '2 weeks',
          factors: ['New model release', 'Seasonal sales', 'Market trends'],
          action: 'Set price alert',
          actionType: 'reminder',
          actionData: { product: 'smart_watch', targetPrice: 270, timeframe: '2 weeks' },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        }
      ],
      conversations: [
        {
          id: '1',
          module: 'finance',
          messages: [
            {
              role: 'user',
              content: 'Help me create a budget for next month',
              timestamp: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
              role: 'assistant',
              content: 'I\'ll help you create a comprehensive budget using GPT-4\'s advanced planning capabilities. Let me analyze your current spending patterns and create a personalized budget plan.',
              timestamp: new Date(Date.now() - 29 * 60 * 1000),
              actions: [
                {
                  id: 'action_1',
                  type: 'budget_analysis',
                  title: 'Analyze Current Spending',
                  description: 'Reviewing your transaction history to identify patterns',
                  executed: true,
                  timestamp: new Date(Date.now() - 29 * 60 * 1000),
                  ai_model: 'GPT-4'
                }
              ]
            }
          ],
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ai_model: 'GPT-4'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'budget_create',
          title: 'Create Monthly Budget',
          description: 'Creating personalized budget using GPT-4 analysis',
          executed: true,
          data: { income: 5000, expenses: 3500, savings: 1500 },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        },
        {
          id: '2',
          type: 'workout_plan',
          title: 'Generate Workout Plan',
          description: 'Creating personalized fitness plan with GPT-4 expertise',
          executed: false,
          data: { level: 'intermediate', goals: ['strength', 'endurance'], time: 45 },
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          ai_model: 'GPT-4'
        }
      ],
      users: [
        {
          id: '1',
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          status: 'online',
          lastSeen: new Date()
        },
        {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          status: 'away',
          lastSeen: new Date(Date.now() - 30 * 60 * 1000)
        }
      ],
      modelInfo: {
        model: 'gpt-4',
        version: 'Latest',
        capabilities: [
          'Advanced reasoning',
          'Function calling',
          'Code generation',
          'Creative writing',
          'Data analysis',
          'Multi-modal understanding'
        ],
        max_tokens: 1000,
        temperature: 0.7,
        provider: 'OpenAI'
      },
      isLoading: false,
      error: null,

      // Actions
      addInsight: (insight) => {
        const newInsight: AIInsight = {
          ...insight,
          id: `insight_${Date.now()}`,
          timestamp: new Date(),
          ai_model: 'GPT-4'
        }
        set((state) => ({
          insights: [newInsight, ...state.insights]
        }))
      },

      addRecommendation: (recommendation) => {
        const newRecommendation: AIRecommendation = {
          ...recommendation,
          id: `rec_${Date.now()}`,
          timestamp: new Date(),
          ai_model: 'GPT-4'
        }
        set((state) => ({
          recommendations: [newRecommendation, ...state.recommendations]
        }))
      },

      addPrediction: (prediction) => {
        const newPrediction: AIPrediction = {
          ...prediction,
          id: `pred_${Date.now()}`,
          timestamp: new Date(),
          ai_model: 'GPT-4'
        }
        set((state) => ({
          predictions: [newPrediction, ...state.predictions]
        }))
      },

      addConversation: (conversation) => {
        const newConversation: AIConversation = {
          ...conversation,
          id: `conv_${Date.now()}`,
          timestamp: new Date(),
          ai_model: 'GPT-4'
        }
        set((state) => ({
          conversations: [newConversation, ...state.conversations]
        }))
      },

      updateConversation: (id, message) => {
        set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === id 
              ? { ...conv, messages: [...conv.messages, { ...message, timestamp: new Date() }] }
              : conv
          )
        }))
      },

      addAction: (action) => {
        const newAction: AIAction = {
          ...action,
          id: `action_${Date.now()}`,
          timestamp: new Date(),
          ai_model: 'GPT-4'
        }
        set((state) => ({
          actions: [newAction, ...state.actions]
        }))
      },

      executeAction: (actionId) => {
        set((state) => ({
          actions: state.actions.map(action => 
            action.id === actionId 
              ? { ...action, executed: true }
              : action
          )
        }))
      },

      setModelInfo: (modelInfo) => {
        set({ modelInfo })
      },

      findUser: (query) => {
        const { users } = get()
        return users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase())
        )
      },

      searchProducts: (query) => {
        // Mock product search
        return [
          { id: '1', name: 'Product 1', price: 100 },
          { id: '2', name: 'Product 2', price: 200 }
        ]
      },

      createBudget: (data) => {
        // Mock budget creation
        return { id: 'budget_1', ...data }
      },

      createWorkoutPlan: (data) => {
        // Mock workout plan creation
        return { id: 'workout_1', ...data }
      },

      planTrip: (data) => {
        // Mock trip planning
        return { id: 'trip_1', ...data }
      },

      sendMessage: (userId, message) => {
        // Mock message sending
        console.log(`Sending message to ${userId}: ${message}`)
      },

      createSocialPost: (data) => {
        // Mock social post creation
        console.log('Creating social post:', data)
      },

      setReminder: (data) => {
        // Mock reminder setting
        console.log('Setting reminder:', data)
      },

      clearInsights: (type) => {
        set((state) => ({
          insights: type 
            ? state.insights.filter(insight => insight.type !== type)
            : []
        }))
      },

      clearRecommendations: (type) => {
        set((state) => ({
          recommendations: type 
            ? state.recommendations.filter(rec => rec.type !== type)
            : []
        }))
      },

      clearPredictions: (type) => {
        set((state) => ({
          predictions: type 
            ? state.predictions.filter(pred => pred.type !== type)
            : []
        }))
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'ai-store',
      partialize: (state) => ({
        insights: state.insights,
        recommendations: state.recommendations,
        predictions: state.predictions,
        conversations: state.conversations,
        actions: state.actions,
        users: state.users,
        modelInfo: state.modelInfo
      })
    }
  )
)
