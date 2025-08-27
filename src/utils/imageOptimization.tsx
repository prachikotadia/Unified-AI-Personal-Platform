import { useState, useEffect, useRef, useCallback } from 'react';

// Image optimization configuration
interface ImageConfig {
  quality: number; // 0-100
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  placeholder?: 'blur' | 'dominant' | 'none';
  lazy?: boolean;
  preload?: boolean;
}

// Default image configuration
const DEFAULT_CONFIG: ImageConfig = {
  quality: 80,
  format: 'auto',
  fit: 'cover',
  placeholder: 'blur',
  lazy: true,
  preload: false
};

// Image optimization utilities
class ImageOptimizer {
  private config: ImageConfig;

  constructor(config: ImageConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Generate optimized image URL
  public optimizeUrl(originalUrl: string, options: Partial<ImageConfig> = {}): string {
    const config = { ...this.config, ...options };
    
    // If using a CDN service like Cloudinary, ImageKit, or similar
    if (this.isCDNUrl(originalUrl)) {
      return this.optimizeCDNUrl(originalUrl, config);
    }

    // For local images, use WebP conversion if supported
    if (this.supportsWebP() && config.format === 'auto') {
      return this.convertToWebP(originalUrl, config);
    }

    return originalUrl;
  }

  // Check if URL is from a CDN
  private isCDNUrl(url: string): boolean {
    const cdnDomains = [
      'cloudinary.com',
      'imagekit.io',
      'imgix.net',
      'cloudimage.io',
      'fastly.com',
      'amazonaws.com'
    ];
    
    return cdnDomains.some(domain => url.includes(domain));
  }

  // Optimize CDN URL with parameters
  private optimizeCDNUrl(url: string, config: ImageConfig): string {
    const urlObj = new URL(url);
    
    // Add optimization parameters
    if (config.quality) {
      urlObj.searchParams.set('q', config.quality.toString());
    }
    
    if (config.width) {
      urlObj.searchParams.set('w', config.width.toString());
    }
    
    if (config.height) {
      urlObj.searchParams.set('h', config.height.toString());
    }
    
    if (config.format && config.format !== 'auto') {
      urlObj.searchParams.set('f', config.format);
    }
    
    if (config.fit) {
      urlObj.searchParams.set('fit', config.fit);
    }
    
    return urlObj.toString();
  }

  // Convert image to WebP format
  private convertToWebP(url: string, config: ImageConfig): string {
    // This would typically be handled by a CDN or image processing service
    // For now, we'll return the original URL
    return url;
  }

  // Check WebP support
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  // Generate placeholder image
  public generatePlaceholder(width: number, height: number, color: string = '#f0f0f0'): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  }

  // Generate dominant color placeholder
  public async generateDominantColor(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let r = 0, g = 0, b = 0, count = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          
          resolve(`rgb(${r}, ${g}, ${b})`);
        } else {
          resolve('#f0f0f0');
        }
      };
      
      img.onerror = () => resolve('#f0f0f0');
      img.src = imageUrl;
    });
  }

  // Preload image
  public preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  // Get image dimensions
  public getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = url;
    });
  }
}

// Create global image optimizer instance
export const imageOptimizer = new ImageOptimizer();

// Lazy loading hook
export const useLazyImage = (
  src: string,
  options: {
    threshold?: number;
    rootMargin?: string;
    fallback?: string;
    placeholder?: string;
  } = {}
) => {
  const [imageSrc, setImageSrc] = useState(options.placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    fallback = '/placeholder.jpg'
  } = options;

  const loadImage = useCallback(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setImageSrc(fallback);
      setIsError(true);
    };
    img.src = src;
  }, [src, fallback]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [loadImage, threshold, rootMargin]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isError
  };
};

// Optimized image component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  placeholder?: 'blur' | 'dominant' | 'none';
  lazy?: boolean;
  preload?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'auto',
  fit = 'cover',
  placeholder = 'blur',
  lazy = true,
  preload = false,
  className,
  style,
  onClick
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [placeholderSrc, setPlaceholderSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Generate optimized URL
    const optimized = imageOptimizer.optimizeUrl(src, {
      quality,
      format,
      width,
      height,
      fit
    });
    setOptimizedSrc(optimized);

    // Generate placeholder
    if (placeholder === 'blur' && width && height) {
      setPlaceholderSrc(imageOptimizer.generatePlaceholder(width, height));
    } else if (placeholder === 'dominant') {
      imageOptimizer.generateDominantColor(src).then(color => {
        setPlaceholderSrc(imageOptimizer.generatePlaceholder(width || 300, height || 200, color));
      });
    }

    // Preload if requested
    if (preload) {
      imageOptimizer.preloadImage(optimized);
    }
  }, [src, quality, format, width, height, fit, placeholder, preload]);

  const { ref, src: lazySrc, isLoaded: lazyLoaded } = useLazyImage(
    optimizedSrc,
    {
      placeholder: placeholderSrc,
      fallback: '/placeholder.jpg'
    }
  );

  const finalSrc = lazy ? lazySrc : optimizedSrc;
  const finalLoaded = lazy ? lazyLoaded : isLoaded;

  return (
    <img
      ref={ref}
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className || ''} ${finalLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        opacity: finalLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out'
      }}
      onLoad={() => setIsLoaded(true)}
      onClick={onClick}
    />
  );
};

// Image gallery component with lazy loading
export const ImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
}> = ({ images, columns = 3, gap = 16, className }) => {
  return (
    <div
      className={`image-gallery ${className || ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          lazy={true}
          placeholder="blur"
          className="gallery-image"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      ))}
    </div>
  );
};

// Progressive image loading component
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  thumbnail: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, alt, thumbnail, width, height, className }) => {
  const [currentSrc, setCurrentSrc] = useState(thumbnail);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={`progressive-image ${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        filter: isLoaded ? 'none' : 'blur(10px)',
        transition: 'filter 0.3s ease-in-out'
      }}
    />
  );
};

// Image optimization utilities
export const imageUtils = {
  // Optimize image URL
  optimize: (url: string, options?: Partial<ImageConfig>) => {
    return imageOptimizer.optimizeUrl(url, options);
  },

  // Preload image
  preload: (url: string) => {
    return imageOptimizer.preloadImage(url);
  },

  // Get image dimensions
  getDimensions: (url: string) => {
    return imageOptimizer.getImageDimensions(url);
  },

  // Generate placeholder
  generatePlaceholder: (width: number, height: number, color?: string) => {
    return imageOptimizer.generatePlaceholder(width, height, color);
  },

  // Generate dominant color
  generateDominantColor: (url: string) => {
    return imageOptimizer.generateDominantColor(url);
  }
};

export default imageOptimizer;
