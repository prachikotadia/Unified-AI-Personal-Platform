import { API_BASE_URL } from '../config/api'

export interface DashboardSummary {
  finance: {
    monthlySpend: number
    monthlyIncome: number
    monthlyBudget: number
    change: number
    forecast: number[]
  }
  marketplace: {
    cartItems: number
    totalValue: number
    recommendations: Array<{
      id: number
      name: string
      price: number
      image: string
    }>
  }
  fitness: {
    stepsToday: number
    goalSteps: number
    caloriesBurned: number
    workoutsThisWeek: number
    streak: number
  }
  travel: {
    upcomingTrips: number
    nextTrip: {
      destination: string
      date: string
      image: string
    } | null
  }
  social: {
    connections: number
    sharedItems: number
    recentActivity: Array<{
      type: string
      user: string
      action: string
    }>
  }
  chat: {
    activeConversations: number
    unreadMessages: number
  }
  timestamp: string
}

class DashboardAPIService {
  private baseURL = `${API_BASE_URL}/api/dashboard`

  async getSummary(userId?: number | string): Promise<DashboardSummary> {
    try {
      // Handle both number and string user IDs (for guest users)
      let url = `${this.baseURL}/summary`
      if (userId) {
        // Extract numeric ID if it's a string like "guest_123"
        const numericId = typeof userId === 'string' 
          ? userId.replace('guest_', '') 
          : userId
        url = `${this.baseURL}/summary?user_id=${numericId}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        // Return fallback data if backend is not available
        return this.getFallbackData()
      }

      const data = await response.json()
      return data
    } catch (error) {
      // Return fallback data on error
      return this.getFallbackData()
    }
  }

  private getFallbackData(): DashboardSummary {
    return {
      finance: {
        monthlySpend: 2847.50,
        monthlyIncome: 5000,
        monthlyBudget: 3500,
        change: 12.5,
        forecast: [3200, 3100, 3300, 3400, 3500, 3600]
      },
      marketplace: {
        cartItems: 3,
        totalValue: 156.78,
        recommendations: [
          { id: 1, name: 'Wireless Headphones', price: 89.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop' },
          { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop' },
          { id: 3, name: 'Laptop Stand', price: 45.99, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=150&h=150&fit=crop' },
        ]
      },
      fitness: {
        stepsToday: 8420,
        goalSteps: 10000,
        caloriesBurned: 420,
        workoutsThisWeek: 4,
        streak: 7
      },
      travel: {
        upcomingTrips: 2,
        nextTrip: {
          destination: 'Tokyo, Japan',
          date: '2024-03-15',
          image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop'
        }
      },
      social: {
        connections: 24,
        sharedItems: 8,
        recentActivity: [
          { type: 'budget', user: 'Sarah', action: 'shared a budget' },
          { type: 'trip', user: 'Mike', action: 'shared a trip' },
          { type: 'workout', user: 'Emma', action: 'completed a workout' },
        ]
      },
      chat: {
        activeConversations: 3,
        unreadMessages: 2
      },
      timestamp: new Date().toISOString()
    }
  }
}

export const dashboardAPI = new DashboardAPIService()

