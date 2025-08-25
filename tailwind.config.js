/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors
        white: '#FFFFFF',
        'light-grey': '#F5F5F5',
        black: '#0D0D0D',
        'charcoal-grey': '#1E1E1E',
        
        // Accent gradients
        'blue-gradient': {
          from: '#4A90E2',
          to: '#007AFF',
        },
        'green-gradient': {
          from: '#43E97B',
          to: '#38F9D7',
        },
        'orange-gradient': {
          from: '#FF6A00',
          to: '#FF8E53',
        },
        'purple-gradient': {
          from: '#8E2DE2',
          to: '#4A00E0',
        },
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #4A90E2, #007AFF)',
        'green-gradient': 'linear-gradient(135deg, #43E97B, #38F9D7)',
        'orange-gradient': 'linear-gradient(135deg, #FF6A00, #FF8E53)',
        'purple-gradient': 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
        'glass-light': 'rgba(255, 255, 255, 0.15)',
        'glass-dark': 'rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      borderRadius: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
