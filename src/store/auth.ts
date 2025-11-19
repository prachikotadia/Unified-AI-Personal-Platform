import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_BASE_URL } from '../config/api'

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signup: (email: string, username: string, password: string, verificationMethod?: 'email' | 'sms') => Promise<void>
  guestLogin: () => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
  updateUser: (updates: Partial<User>) => void
  verifyCode: (userId: string, codeType: 'email' | 'phone', code: string) => Promise<boolean>
  resendVerification: (userId: string, contactType: 'email' | 'phone') => Promise<boolean>
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
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null })
        try {
          // Check if we should use mock API
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock API call - but create real user data based on login
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Create personalized user data based on email
            const username = email.split('@')[0]
            const displayName = username.charAt(0).toUpperCase() + username.slice(1)
            
            const realUser: User = {
              id: 'user_' + Date.now(),
              username: username,
              email,
              displayName: displayName,
              avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&v=${Date.now()}`,
              bio: 'Welcome to OmniLife! Your personal AI-powered lifestyle platform.',
              location: 'Your Location',
              preferences: { 
                theme: 'light', 
                notifications: true,
                isGuest: false,
                language: 'en'
              },
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = 'real-user-token-' + Date.now()
            
            set({
              user: realUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username_or_email: email,
                password,
                remember_me: rememberMe
              }),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.detail || 'Login failed')
            }
            
            const data = await response.json()
            
            set({
              user: data.user,
              token: data.tokens.access_token,
              isAuthenticated: true,
              isLoading: false,
            })
          }
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
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock OAuth login - but create real user data
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Create personalized user data for OAuth
            const oauthUsername = `${provider}_${Date.now().toString().slice(-4)}`
            const displayName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
            
            const realUser: User = {
              id: 'oauth_' + Date.now(),
              username: oauthUsername,
              email: `${oauthUsername}@${provider}.com`,
              displayName: displayName,
              avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&v=${Date.now()}`,
              bio: `Connected via ${provider} - Welcome to OmniLife!`,
              location: 'Your Location',
              preferences: { 
                theme: 'light', 
                notifications: true,
                isGuest: false,
                language: 'en',
                oauthProvider: provider
              },
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = `${provider}-token-` + Date.now()
            
            set({
              user: realUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Real OAuth flow
            // First, get the OAuth URL
            const urlResponse = await fetch(`${API_BASE_URL}/auth/oauth/${provider}/url`)
            const urlData = await urlResponse.json()
            
            // Redirect to OAuth provider
            window.location.href = urlData.oauth_url
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'OAuth login failed',
            isLoading: false,
          })
        }
      },

      signup: async (email: string, username: string, password: string, verificationMethod = 'email') => {
        set({ isLoading: true, error: null })
        try {
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock API call - but create real user data based on signup
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Create personalized user data based on signup info
            const displayName = username.charAt(0).toUpperCase() + username.slice(1)
            
            const realUser: User = {
              id: 'user_' + Date.now(),
              username,
              email,
              displayName: displayName,
              avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&v=${Date.now()}`,
              bio: 'Welcome to OmniLife! Your personal AI-powered lifestyle platform.',
              location: 'Your Location',
              preferences: { 
                theme: 'light', 
                notifications: true,
                isGuest: false,
                language: 'en',
                verificationMethod: verificationMethod
              },
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = 'real-user-token-' + Date.now()
            
            set({
              user: realUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Real API call
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username,
                email,
                password,
                verification_method: verificationMethod
              }),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.detail || 'Signup failed')
            }
            
            const data = await response.json()
            
            set({
              user: data.user,
              token: data.tokens.access_token,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
          })
        }
      },

      logout: () => {
        const currentUser = get().user
        if (currentUser) {
          // Clear user data if not guest
          if (currentUser.preferences?.isGuest !== true) {
            // Import and clear user data
            import('../services/userDataService').then(({ userDataService }) => {
              userDataService.clearUserData(currentUser.id)
            })
          }
        }
        
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

      guestLogin: async () => {
        set({ isLoading: true, error: null })
        try {
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock guest login
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const mockGuestUser: User = {
              id: 'guest_' + Date.now(),
              username: 'guest_user',
              email: 'guest@omnilife.com',
              displayName: 'Guest User',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              bio: 'Demo user - explore OmniLife features',
              location: 'Demo Mode',
              preferences: { theme: 'light', notifications: false, isGuest: true },
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = 'guest-token-' + Date.now()
            
            set({
              user: mockGuestUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Real guest login API call
            const response = await fetch(`${API_BASE_URL}/auth/guest-login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.detail || 'Guest login failed')
            }
            
            const data = await response.json()
            
            set({
              user: data.user,
              token: data.tokens.access_token,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Guest login failed',
            isLoading: false,
          })
        }
      },

      verifyCode: async (userId: string, codeType: 'email' | 'phone', code: string) => {
        try {
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock verification
            await new Promise(resolve => setTimeout(resolve, 500))
            return true
          } else {
            // Real verification API call
            const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: parseInt(userId),
                code_type: codeType,
                code
              }),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.detail || 'Verification failed')
            }
            
            return true
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Verification failed',
          })
          return false
        }
      },

      resendVerification: async (userId: string, contactType: 'email' | 'phone') => {
        try {
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock resend
            await new Promise(resolve => setTimeout(resolve, 500))
            return true
          } else {
            // Real resend API call
            const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: parseInt(userId),
                contact_type: contactType
              }),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.detail || 'Failed to resend verification')
            }
            
            return true
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to resend verification',
          })
          return false
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
