import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  location?: string
  preferences?: Record<string, any>
  createdAt: string
  lastSeen: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const mockUser: User = {
            id: '1',
            username: 'demo_user',
            email,
            displayName: 'Demo User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            bio: 'AI-powered lifestyle enthusiast',
            location: 'San Francisco, CA',
            preferences: { theme: 'light', notifications: true },
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
        }
      },

      loginWithOAuth: async (provider: 'google' | 'github') => {
        set({ isLoading: true, error: null })
        try {
          // Mock OAuth flow - replace with actual OAuth implementation
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          const mockUser: User = {
            id: '1',
            username: `${provider}_user`,
            email: `${provider}@example.com`,
            displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
            bio: 'Connected via ' + provider,
            location: 'San Francisco, CA',
            preferences: { theme: 'light', notifications: true },
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          }
          
          const mockToken = `mock-oauth-${provider}-token-${Date.now()}`
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'OAuth login failed',
            isLoading: false,
          })
        }
      },

      signup: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const mockUser: User = {
            id: '1',
            username,
            email,
            displayName: username,
            avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
            bio: 'New OmniLife user',
            location: '',
            preferences: { theme: 'light', notifications: true },
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          }
          
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: 'omnilife-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
