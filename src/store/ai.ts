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
}

export interface AIConversation {
  id: string
  module: string
  messages: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    actions?: AIAction[]
  }[]
  context: any
  timestamp: Date
}

export interface AIAction {
  id: string
  type: 'message' | 'product_search' | 'budget_create' | 'workout_plan' | 'trip_plan' | 'social_post' | 'reminder' | 'notification'
  title: string
  description: string
  data: any
  executed: boolean
  timestamp: Date
}

export interface AIUser {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

interface AIState {
  insights: AIInsight[]
  recommendations: AIRecommendation[]
  predictions: AIPrediction[]
  conversations: AIConversation[]
  actions: AIAction[]
  users: AIUser[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addInsight: (insight: Omit<AIInsight, 'id' | 'timestamp'>) => void
  addRecommendation: (recommendation: Omit<AIRecommendation, 'id' | 'timestamp'>) => void
  addPrediction: (prediction: Omit<AIPrediction, 'id' | 'timestamp'>) => void
  addConversation: (conversation: Omit<AIConversation, 'id' | 'timestamp'>) => void
  updateConversation: (id: string, message: { role: 'user' | 'assistant'; content: string; actions?: AIAction[] }) => void
  addAction: (action: Omit<AIAction, 'id' | 'timestamp'>) => void
  executeAction: (actionId: string) => void
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
      insights: [
        {
          id: '1',
          type: 'finance',
          title: 'Spending Pattern Detected',
          description: 'Your dining out expenses have increased by 25% this month. Consider setting a budget limit.',
          confidence: 0.89,
          action: 'Create dining budget',
          actionType: 'budget_create',
          actionData: { category: 'dining', amount: 300, period: 'monthly' },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'fitness',
          title: 'Workout Consistency Improving',
          description: 'You\'ve maintained a 4-day workout streak. Great progress!',
          confidence: 0.92,
          action: 'Create workout plan',
          actionType: 'workout_plan',
          actionData: { type: 'strength', duration: '4 weeks', focus: 'muscle building' },
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'marketplace',
          title: 'Price Drop Alert',
          description: 'Wireless headphones you viewed are now 15% off. Limited time offer!',
          confidence: 0.95,
          action: 'View product',
          actionType: 'product_search',
          data: { productId: '1', originalPrice: 299.99, currentPrice: 254.99 },
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        }
      ],
      recommendations: [
        {
          id: '1',
          type: 'finance',
          title: 'Emergency Fund Boost',
          description: 'Based on your spending patterns, consider increasing your emergency fund to cover 6 months of expenses.',
          priority: 'high',
          category: 'savings',
          action: 'Create emergency fund budget',
          actionType: 'budget_create',
          actionData: { category: 'emergency_fund', amount: 6000, period: 'monthly', target: 6 },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          type: 'fitness',
          title: 'Try HIIT Training',
          description: 'Your current cardio routine could benefit from high-intensity interval training for better results.',
          priority: 'medium',
          category: 'workout',
          action: 'Create HIIT workout plan',
          actionType: 'workout_plan',
          actionData: { type: 'hiit', duration: '20 minutes', intensity: 'high' },
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'travel',
          title: 'Weekend Getaway',
          description: 'Perfect weather forecast for a weekend trip to nearby mountains. Great for hiking!',
          priority: 'low',
          category: 'leisure',
          action: 'Plan weekend trip',
          actionType: 'trip_plan',
          actionData: { destination: 'mountain hiking', duration: '2 days', budget: 500 },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
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
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
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
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
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
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ],
      conversations: [
        {
          id: '1',
          module: 'finance',
          messages: [
            {
              id: '1',
              role: 'user',
              content: 'How can I save more money this month?',
              timestamp: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
              id: '2',
              role: 'assistant',
              content: 'Based on your spending patterns, I recommend: 1) Reduce dining out by 30% (save $150), 2) Cancel unused subscriptions (save $45), 3) Use public transport instead of rideshares (save $80). Total potential savings: $275/month. Would you like me to create a budget plan for you?',
              timestamp: new Date(Date.now() - 29 * 60 * 1000),
              actions: [
                {
                  id: 'action_1',
                  type: 'budget_create',
                  title: 'Create Savings Budget',
                  description: 'Create a monthly budget to save $275',
                  data: { category: 'savings', amount: 275, period: 'monthly' },
                  executed: false,
                  timestamp: new Date(Date.now() - 29 * 60 * 1000)
                }
              ]
            }
          ],
          context: { module: 'finance', userId: 'user1' },
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        }
      ],
      actions: [],
      users: [
        { id: '1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'online' },
        { id: '2', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', status: 'offline' },
        { id: '3', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'online' },
        { id: '4', name: 'John D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', status: 'away' },
        { id: '5', name: 'Lisa K.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', status: 'online' }
      ],
      isLoading: false,
      error: null,

      addInsight: (insightData) => {
        const { insights } = get()
        const newInsight: AIInsight = {
          ...insightData,
          id: `insight_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }
        set({ insights: [newInsight, ...insights] })
      },

      addRecommendation: (recommendationData) => {
        const { recommendations } = get()
        const newRecommendation: AIRecommendation = {
          ...recommendationData,
          id: `rec_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }
        set({ recommendations: [newRecommendation, ...recommendations] })
      },

      addPrediction: (predictionData) => {
        const { predictions } = get()
        const newPrediction: AIPrediction = {
          ...predictionData,
          id: `pred_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }
        set({ predictions: [newPrediction, ...predictions] })
      },

      addConversation: (conversationData) => {
        const { conversations } = get()
        const newConversation: AIConversation = {
          ...conversationData,
          id: `conv_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }
        set({ conversations: [newConversation, ...conversations] })
      },

      updateConversation: (id, message) => {
        const { conversations } = get()
        const updatedConversations = conversations.map(conv => {
          if (conv.id === id) {
            return {
              ...conv,
              messages: [...conv.messages, {
                id: `msg_${Date.now()}_${Math.random()}`,
                ...message,
                timestamp: new Date()
              }]
            }
          }
          return conv
        })
        set({ conversations: updatedConversations })
      },

      addAction: (actionData) => {
        const { actions } = get()
        const newAction: AIAction = {
          ...actionData,
          id: `action_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }
        set({ actions: [newAction, ...actions] })
      },

      executeAction: (actionId) => {
        const { actions } = get()
        const updatedActions = actions.map(action => 
          action.id === actionId ? { ...action, executed: true } : action
        )
        set({ actions: updatedActions })
      },

      findUser: (query) => {
        const { users } = get()
        return users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase())
        )
      },

      searchProducts: (query) => {
        // Mock products for AI search functionality
        const mockProducts = [
          { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 199.99 },
          { id: '2', name: 'Smart Watch', category: 'Electronics', price: 299.99 },
          { id: '3', name: 'Laptop Stand', category: 'Office', price: 49.99 },
          { id: '4', name: 'Gaming Mouse', category: 'Electronics', price: 79.99 },
          { id: '5', name: 'Bluetooth Speaker', category: 'Audio', price: 89.99 }
        ]
        return mockProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
      },

      createBudget: (data) => {
        // This would integrate with the finance store
        const budget = {
          id: `budget_${Date.now()}`,
          ...data,
          createdAt: new Date()
        }
        // Add to finance store here
        return budget
      },

      createWorkoutPlan: (data) => {
        const workoutPlan = {
          id: `workout_${Date.now()}`,
          ...data,
          createdAt: new Date()
        }
        return workoutPlan
      },

      planTrip: (data) => {
        const trip = {
          id: `trip_${Date.now()}`,
          ...data,
          createdAt: new Date()
        }
        return trip
      },

      sendMessage: (userId, message) => {
        // Mock message sending functionality
        console.log(`Sending message to user ${userId}: ${message}`)
        // In a real implementation, this would integrate with the chat store
        return {
          id: `message_${Date.now()}`,
          userId,
          message,
          timestamp: new Date(),
          sent: true
        }
      },

      createSocialPost: (data) => {
        const post = {
          id: `post_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          likes: 0,
          comments: []
        }
        return post
      },

      setReminder: (data) => {
        const reminder = {
          id: `reminder_${Date.now()}`,
          ...data,
          createdAt: new Date(),
          completed: false
        }
        return reminder
      },

      clearInsights: (type) => {
        const { insights } = get()
        if (type) {
          set({ insights: insights.filter(insight => insight.type !== type) })
        } else {
          set({ insights: [] })
        }
      },

      clearRecommendations: (type) => {
        const { recommendations } = get()
        if (type) {
          set({ recommendations: recommendations.filter(rec => rec.type !== type) })
        } else {
          set({ recommendations: [] })
        }
      },

      clearPredictions: (type) => {
        const { predictions } = get()
        if (type) {
          set({ predictions: predictions.filter(pred => pred.type !== type) })
        } else {
          set({ predictions: [] })
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'ai-storage',
      partialize: (state) => ({
        insights: state.insights,
        recommendations: state.recommendations,
        predictions: state.predictions,
        conversations: state.conversations,
        actions: state.actions,
        users: state.users
      })
    }
  )
)
