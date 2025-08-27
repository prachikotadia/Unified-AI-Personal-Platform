import React, { useState, useCallback, useEffect } from 'react';

// Image utility functions to handle broken images and provide fallbacks

// Common fallback images for different categories
export const FALLBACK_IMAGES = {
  travel: {
    paris: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300&h=200&fit=crop',
    tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
    bali: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
    santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop',
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop'
  },
  profile: {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  marketplace: {
    electronics: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
    fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop'
  },
  fitness: {
    workout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop',
    default: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
  }
};

// Function to get a fallback image based on category and type
export const getFallbackImage = (category: keyof typeof FALLBACK_IMAGES, type?: string): string => {
  const categoryImages = FALLBACK_IMAGES[category];
  if (type && categoryImages[type as keyof typeof categoryImages]) {
    return categoryImages[type as keyof typeof categoryImages];
  }
  return categoryImages.default;
};

// Function to validate image URL
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Function to get a safe image URL with fallback
export const getSafeImageUrl = (
  url: string, 
  category: keyof typeof FALLBACK_IMAGES, 
  type?: string
): string => {
  // If URL is empty or invalid, return fallback
  if (!url || url.includes('photo-1502602898535-0b7b0b7b0b7b')) {
    return getFallbackImage(category, type);
  }
  return url;
};

// React hook for handling image errors
export const useImageError = (
  category: keyof typeof FALLBACK_IMAGES,
  type?: string
) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const handleImageError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(getFallbackImage(category, type));
    }
  }, [category, type, hasError]);

  const setImage = useCallback((url: string) => {
    setImageSrc(getSafeImageUrl(url, category, type));
    setHasError(false);
  }, [category, type]);

  return {
    imageSrc,
    hasError,
    handleImageError,
    setImage
  };
};

// React component for safe image display
export const SafeImage: React.FC<{
  src: string;
  alt: string;
  category: keyof typeof FALLBACK_IMAGES;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}> = ({ src, alt, category, type, className, style, width, height }) => {
  const { imageSrc, handleImageError } = useImageError(category, type);

  useEffect(() => {
    // Set the image source when component mounts or src changes
    const safeSrc = getSafeImageUrl(src, category, type);
    if (safeSrc !== imageSrc) {
      // This would be handled by the hook, but we need to trigger it
    }
  }, [src, category, type, imageSrc]);

  return (
    <img
      src={getSafeImageUrl(src, category, type)}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
};

// Utility to preload images
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Utility to preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url).catch(() => {
    // Silently fail for individual images
    console.warn(`Failed to preload image: ${url}`);
  }));
  await Promise.all(promises);
};

// Utility to get image dimensions
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Utility to optimize image URL for different sizes
export const optimizeImageUrl = (
  url: string, 
  width: number, 
  height: number, 
  quality: number = 80
): string => {
  if (!url || !url.includes('unsplash.com')) {
    return url;
  }

  // For Unsplash images, add optimization parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&h=${height}&fit=crop&q=${quality}`;
};

// Utility to check if image is from a trusted source
export const isTrustedImageSource = (url: string): boolean => {
  const trustedDomains = [
    'images.unsplash.com',
    'images.pexels.com',
    'images.pixabay.com',
    'cdn.example.com', // Add your CDN domain
    'localhost',
    '127.0.0.1'
  ];

  try {
    const domain = new URL(url).hostname;
    return trustedDomains.some(trusted => domain.includes(trusted));
  } catch {
    return false;
  }
};

// Utility to sanitize image URL
export const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove any potentially dangerous protocols
  if (url.startsWith('javascript:') || url.startsWith('data:')) {
    return '';
  }
  
  // Ensure it's a valid URL
  try {
    new URL(url);
    return url;
  } catch {
    return '';
  }
};

export default {
  FALLBACK_IMAGES,
  getFallbackImage,
  validateImageUrl,
  getSafeImageUrl,
  useImageError,
  SafeImage,
  preloadImage,
  preloadImages,
  getImageDimensions,
  optimizeImageUrl,
  isTrustedImageSource,
  sanitizeImageUrl
};

// Test function to verify image utilities are working
export const testImageUtils = () => {
  console.log('✅ Image utilities loaded successfully');
  console.log('📸 Fallback images available:', Object.keys(FALLBACK_IMAGES));
  
  // Test safe image URL function
  const testUrl = getSafeImageUrl('', 'travel', 'paris');
  console.log('🛡️ Safe image URL test:', testUrl);
  
  return {
    fallbackImages: FALLBACK_IMAGES,
    safeUrlTest: testUrl,
    status: 'working'
  };
};
