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
        // Check if we already have a user in localStorage
        const currentUser = get().user;
        if (currentUser && currentUser.email === email) {
          // User already logged in with this email, don't overwrite
          return;
        }
        
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
            
            // Preserve existing user data if available
            const existingUser = get().user;
            const realUser: User = {
              id: existingUser?.id || 'user_' + Date.now(),
              username: existingUser?.username || username,
              email,
              displayName: existingUser?.displayName || displayName,
              avatar: existingUser?.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&v=${Date.now()}`,
              bio: existingUser?.bio || 'Welcome to OmniLife! Your personal AI-powered lifestyle platform.',
              location: existingUser?.location || 'Your Location',
              preferences: { 
                ...existingUser?.preferences,
                theme: existingUser?.preferences?.theme || 'light', 
                notifications: existingUser?.preferences?.notifications !== undefined ? existingUser.preferences.notifications : true,
                isGuest: false,
                language: existingUser?.preferences?.language || 'en'
              },
              createdAt: existingUser?.createdAt || new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = existingUser ? get().token : 'real-user-token-' + Date.now()
            
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
          // Properly merge preferences if they exist
          const mergedPreferences = updates.preferences 
            ? { ...currentUser.preferences, ...updates.preferences }
            : currentUser.preferences
          
          // Merge all updates, ensuring preferences are properly merged
          // CRITICAL: Explicitly handle avatar - if provided and not empty, use it; otherwise keep current
          const avatarToSave = updates.avatar && updates.avatar.trim() !== '' 
            ? updates.avatar 
            : currentUser.avatar;
          
          const updatedUser: User = {
            ...currentUser,
            ...updates,
            // CRITICAL: Explicitly set avatar - never let it be undefined or empty if we have one
            avatar: avatarToSave,
            preferences: mergedPreferences,
            // Ensure email is updated if provided
            email: updates.email || currentUser.email,
            // Update lastSeen timestamp
            lastSeen: new Date().toISOString(),
          }
          
          set({ user: updatedUser })
          
          // Debug: Log avatar save
          if (updates.avatar && updates.avatar.startsWith('data:image')) {
            console.log('[Auth Store] Avatar updated and saved, length:', updates.avatar.length);
            console.log('[Auth Store] Avatar preview:', updates.avatar.substring(0, 50) + '...');
          } else if (currentUser.avatar && currentUser.avatar.startsWith('data:image')) {
            console.log('[Auth Store] Avatar preserved from existing user, length:', currentUser.avatar.length);
          }
        }
      },

      guestLogin: async () => {
        set({ isLoading: true, error: null })
        try {
          const useMockAPI = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || (import.meta as any).env?.DEV
          
          if (useMockAPI) {
            // Mock guest login - but preserve existing user data if available
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Preserve existing user data if available (especially avatar)
            const existingUser = get().user;
            const mockGuestUser: User = {
              id: existingUser?.id || 'guest_' + Date.now(),
              username: existingUser?.username || 'guest_user',
              email: existingUser?.email || 'guest@omnilife.com',
              displayName: existingUser?.displayName || 'Guest User',
              // CRITICAL: Preserve existing avatar if it exists (user-uploaded), otherwise use default
              avatar: existingUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              bio: existingUser?.bio || 'Demo user - explore OmniLife features',
              location: existingUser?.location || 'Demo Mode',
              preferences: { 
                ...existingUser?.preferences,
                theme: existingUser?.preferences?.theme || 'light', 
                notifications: existingUser?.preferences?.notifications !== undefined ? existingUser.preferences.notifications : false,
                isGuest: true,
                language: existingUser?.preferences?.language || 'en'
              },
              createdAt: existingUser?.createdAt || new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            }
            
            const mockToken = existingUser ? get().token : 'guest-token-' + Date.now()
            
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
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            user: persistedState.user || null,
            token: persistedState.token || null,
            isAuthenticated: persistedState.isAuthenticated || false,
          };
        }
        return persistedState;
      },
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) {
              console.log('[Auth Store] ℹ️ No data found in localStorage');
              return null;
            }
            const parsed = JSON.parse(str);
            if (!parsed.state) {
              console.warn(`[Auth Store] ⚠️ Invalid localStorage structure for ${name}, resetting...`);
              return null;
            }
            
            // Debug: Check if avatar exists in loaded data
            if (parsed.state?.user?.avatar) {
              if (parsed.state.user.avatar.startsWith('data:image')) {
                console.log('[Auth Store] ✅ Loaded from localStorage - Avatar found (Base64), length:', parsed.state.user.avatar.length);
              } else {
                console.log('[Auth Store] ✅ Loaded from localStorage - Avatar found (URL):', parsed.state.user.avatar);
              }
            } else {
              console.log('[Auth Store] ⚠️ Loaded from localStorage - No avatar found');
            }
            
            return parsed;
          } catch (error) {
            console.error(`[Auth Store] ❌ Failed to parse localStorage for ${name}:`, error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Check if avatar exists and log it
            if (value?.state?.user?.avatar && value.state.user.avatar.startsWith('data:image')) {
              console.log('[Auth Store] 💾 Saving to localStorage - Avatar present, length:', value.state.user.avatar.length);
            }
            
            localStorage.setItem(name, JSON.stringify(value));
            console.log('[Auth Store] ✅ Successfully saved to localStorage');
          } catch (error: any) {
            // Check if it's a quota exceeded error
            if (error.name === 'QuotaExceededError' || error.code === 22) {
              console.error(`[Auth Store] ❌ localStorage quota exceeded! Avatar might be too large.`);
              // Try to save without avatar if it's too large
              if (value?.state?.user?.avatar) {
                console.warn('[Auth Store] ⚠️ Attempting to save without avatar due to size limit');
                const valueWithoutAvatar = {
                  ...value,
                  state: {
                    ...value.state,
                    user: {
                      ...value.state.user,
                      avatar: undefined
                    }
                  }
                };
                try {
                  localStorage.setItem(name, JSON.stringify(valueWithoutAvatar));
                  console.log('[Auth Store] ✅ Saved without avatar due to size limit');
                } catch (retryError) {
                  console.error(`[Auth Store] ❌ Failed to save even without avatar:`, retryError);
                }
              }
            } else {
              console.error(`[Auth Store] ❌ Failed to save to localStorage for ${name}:`, error);
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error(`[Auth Store] Failed to remove from localStorage for ${name}:`, error);
          }
        },
      },
    }
  )
)
