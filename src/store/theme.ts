import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  isSystem: boolean
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSystem: (isSystem: boolean) => void
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isSystem: false,

      setTheme: (theme: Theme) => {
        set({ theme, isSystem: false })
        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme, isSystem: false })
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newTheme)
      },

      setSystem: (isSystem: boolean) => {
        set({ isSystem })
        if (isSystem) {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          set({ theme: systemTheme })
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(systemTheme)
        }
      },
    }),
    {
      name: 'omnilife-theme',
    }
  )
)

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const { theme, isSystem } = useThemeStore.getState()
  
  if (isSystem) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.documentElement.classList.add(systemTheme)
  } else {
    document.documentElement.classList.add(theme)
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { isSystem } = useThemeStore.getState()
    if (isSystem) {
      const newTheme = e.matches ? 'dark' : 'light'
      useThemeStore.getState().setTheme(newTheme)
    }
  })
}
