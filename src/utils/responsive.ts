/**
 * Responsive Design Utilities
 * Provides consistent responsive breakpoints and utilities
 */

// Tailwind breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Mobile-first responsive classes
export const responsive = {
  // Text sizes
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
  },
  
  // Heading sizes
  heading: {
    h1: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl font-semibold',
  },
  
  // Padding
  padding: {
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    base: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  },
  
  // Margin
  margin: {
    xs: 'm-2 sm:m-3',
    sm: 'm-3 sm:m-4',
    base: 'm-4 sm:m-6',
    lg: 'm-6 sm:m-8',
  },
  
  // Gap
  gap: {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    base: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  },
  
  // Button sizes
  button: {
    sm: 'px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base min-h-[44px]',
    base: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base min-h-[44px]',
    lg: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg min-h-[48px]',
  },
  
  // Container
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid
  grid: {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  },
  
  // Modal
  modal: {
    container: 'w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl',
    padding: 'p-4 sm:p-6',
    header: 'p-4 sm:p-6',
    content: 'p-4 sm:p-6',
    footer: 'p-4 sm:p-6',
  },
};

// Touch target minimum size (iOS/Android guidelines)
export const TOUCH_TARGET_MIN = 44; // pixels

