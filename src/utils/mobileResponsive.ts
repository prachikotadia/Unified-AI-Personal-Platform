/**
 * Mobile Responsive Utilities
 * Provides helper functions and constants for mobile-first responsive design
 */

// Minimum touch target size (iOS/Android guidelines)
export const MIN_TOUCH_TARGET = 44; // pixels

// Responsive text sizes
export const textSizes = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl',
  '4xl': 'text-4xl sm:text-5xl',
};

// Responsive heading sizes
export const headingSizes = {
  h1: 'text-2xl sm:text-3xl md:text-4xl font-bold',
  h2: 'text-xl sm:text-2xl md:text-3xl font-bold',
  h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
  h4: 'text-base sm:text-lg md:text-xl font-semibold',
};

// Responsive padding
export const padding = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  base: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10',
};

// Responsive gap
export const gap = {
  xs: 'gap-2 sm:gap-3',
  sm: 'gap-3 sm:gap-4',
  base: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

// Button classes with proper touch targets
export const buttonSizes = {
  sm: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm min-h-[44px]',
  base: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base min-h-[44px]',
  lg: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg min-h-[48px]',
  icon: 'p-2 sm:p-2.5 min-w-[44px] min-h-[44px]',
};

// Modal classes
export const modalClasses = {
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4',
  container: 'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto',
  header: 'p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700',
  content: 'p-4 sm:p-6',
  footer: 'p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700',
};

// Grid classes
export const gridClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

// Container classes
export const containerClasses = 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

