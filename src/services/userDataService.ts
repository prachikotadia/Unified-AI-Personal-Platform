import { useAuthStore } from '../store/auth'

// Service to provide real user data instead of demo data
export class UserDataService {
  private static instance: UserDataService
  private userData: Map<string, any> = new Map()

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService()
    }
    return UserDataService.instance
  }

  // Get user-specific data or create new data if it doesn't exist
  getUserData(userId: string, dataType: string, defaultData: any): any {
    const key = `${userId}_${dataType}`
    
    if (!this.userData.has(key)) {
      // Create personalized data for this user
      const personalizedData = this.createPersonalizedData(dataType, defaultData, userId)
      this.userData.set(key, personalizedData)
    }
    
    return this.userData.get(key)
  }

  // Update user data
  updateUserData(userId: string, dataType: string, data: any): void {
    const key = `${userId}_${dataType}`
    this.userData.set(key, data)
  }

  // Create personalized data based on user
  private createPersonalizedData(dataType: string, defaultData: any, userId: string): any {
    const user = useAuthStore.getState().user
    
    switch (dataType) {
      case 'fitness_dashboard':
        return {
          today_summary: {
            id: `summary_${userId}`,
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            steps: Math.floor(Math.random() * 5000) + 3000, // Random steps between 3000-8000
            calories_burned: Math.floor(Math.random() * 300) + 200,
            calories_consumed: Math.floor(Math.random() * 500) + 1500,
            water_intake: Math.floor(Math.random() * 1000) + 1500,
            sleep_hours: Math.floor(Math.random() * 3) + 6, // 6-9 hours
            workouts: Math.floor(Math.random() * 3) + 1,
            mood: ['excellent', 'good', 'moderate', 'poor'][Math.floor(Math.random() * 4)],
            energy: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          weekly_stats: {
            steps: Math.floor(Math.random() * 20000) + 40000,
            calories_burned: Math.floor(Math.random() * 1500) + 2000,
            workouts: Math.floor(Math.random() * 4) + 3,
            active_days: Math.floor(Math.random() * 3) + 4,
          },
          current_goals: [
            {
              id: `goal_${userId}_1`,
              user_id: userId,
              name: 'Stay Active',
              description: 'Maintain regular physical activity',
              type: 'activity',
              target_value: 10000,
              current_value: Math.floor(Math.random() * 5000) + 3000,
              unit: 'steps',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active',
              progress_percentage: Math.floor(Math.random() * 40) + 30,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ],
          recent_achievements: [],
          streaks: [
            {
              id: `streak_${userId}_1`,
              user_id: userId,
              type: 'workout',
              current_streak: Math.floor(Math.random() * 7) + 1,
              longest_streak: Math.floor(Math.random() * 10) + 5,
              start_date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
              last_activity: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ],
          insights: [
            {
              id: `insight_${userId}_1`,
              user_id: userId,
              type: 'motivation',
              title: 'Great Start!',
              description: 'You\'re building healthy habits. Keep it up!',
              data: { improvement: Math.floor(Math.random() * 20) + 10 },
              priority: 'medium',
              created_at: new Date().toISOString(),
            }
          ],
          recommendations: [
            {
              id: `rec_${userId}_1`,
              user_id: userId,
              type: 'workout',
              title: 'Try a New Activity',
              description: 'Explore different types of exercises to keep things interesting',
              action_items: ['Try yoga', 'Go for a swim', 'Join a fitness class'],
              priority: 'low',
              created_at: new Date().toISOString(),
            }
          ],
        }

      case 'finance_dashboard':
        return {
          accounts: [
            {
              id: `account_${userId}_1`,
              user_id: userId,
              name: 'Main Checking',
              type: 'checking',
              balance: Math.floor(Math.random() * 5000) + 2000,
              currency: 'USD',
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: `account_${userId}_2`,
              user_id: userId,
              name: 'Savings',
              type: 'savings',
              balance: Math.floor(Math.random() * 10000) + 5000,
              currency: 'USD',
              is_active: true,
              created_at: new Date().toISOString(),
            }
          ],
          recent_transactions: [
            {
              id: `trans_${userId}_1`,
              user_id: userId,
              account_id: `account_${userId}_1`,
              amount: -45.50,
              description: 'Grocery Store',
              category: 'Food & Dining',
              type: 'expense',
              date: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            {
              id: `trans_${userId}_2`,
              user_id: userId,
              account_id: `account_${userId}_1`,
              amount: 2500.00,
              description: 'Salary Deposit',
              category: 'Income',
              type: 'income',
              date: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }
          ],
          budgets: [
            {
              id: `budget_${userId}_1`,
              user_id: userId,
              name: 'Monthly Budget',
              amount: 3000,
              spent: Math.floor(Math.random() * 2000) + 1000,
              category: 'General',
              period: 'monthly',
              status: 'active',
              created_at: new Date().toISOString(),
            }
          ],
          goals: [
            {
              id: `goal_${userId}_1`,
              user_id: userId,
              name: 'Emergency Fund',
              target_amount: 10000,
              current_amount: Math.floor(Math.random() * 5000) + 2000,
              deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active',
              created_at: new Date().toISOString(),
            }
          ],
          analytics: {
            total_balance: Math.floor(Math.random() * 15000) + 10000,
            monthly_income: Math.floor(Math.random() * 3000) + 2000,
            monthly_expenses: Math.floor(Math.random() * 2000) + 1000,
            savings_rate: Math.floor(Math.random() * 30) + 20,
            net_worth: Math.floor(Math.random() * 20000) + 15000,
          }
        }

      default:
        return defaultData
    }
  }

  // Clear user data (for logout)
  clearUserData(userId: string): void {
    const keysToDelete: string[] = []
    this.userData.forEach((value, key) => {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      this.userData.delete(key)
    })
  }

  // Check if user is guest
  isGuestUser(userId: string): boolean {
    const user = useAuthStore.getState().user
    return user?.preferences?.isGuest === true
  }
}

export const userDataService = UserDataService.getInstance()
