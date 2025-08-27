import { useState, useEffect, useCallback } from 'react';

// CDN configuration
interface CDNConfig {
  provider: 'cloudflare' | 'aws' | 'cloudinary' | 'imgix' | 'custom';
  baseUrl: string;
  apiKey?: string;
  apiSecret?: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  enableCompression: boolean;
  enableCache: boolean;
  cacheDuration: number; // in seconds
}

// CDN asset types
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'script' | 'style' | 'font';

// CDN optimization options
interface CDNOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  compression?: 'gzip' | 'brotli' | 'none';
  cache?: boolean;
  version?: string;
}

// Default CDN configuration
const DEFAULT_CDN_CONFIG: CDNConfig = {
  provider: 'cloudflare',
  baseUrl: 'https://cdn.omnilife.com',
  version: 'v1',
  environment: 'production',
  enableCompression: true,
  enableCache: true,
  cacheDuration: 31536000 // 1 year
};

// CDN provider class
class CDNProvider {
  private config: CDNConfig;
  private cache: Map<string, string> = new Map();

  constructor(config: CDNConfig = DEFAULT_CDN_CONFIG) {
    this.config = { ...DEFAULT_CDN_CONFIG, ...config };
  }

  // Generate CDN URL
  public generateUrl(
    assetPath: string,
    assetType: AssetType,
    options: CDNOptions = {}
  ): string {
    const {
      quality,
      format,
      width,
      height,
      fit,
      compression,
      cache = this.config.enableCache,
      version = this.config.version
    } = options;

    // Check cache first
    const cacheKey = this.generateCacheKey(assetPath, assetType, options);
    if (cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let cdnUrl = this.buildBaseUrl(assetPath, version);

    // Add provider-specific optimizations
    switch (this.config.provider) {
      case 'cloudflare':
        cdnUrl = this.optimizeForCloudflare(cdnUrl, assetType, options);
        break;
      case 'aws':
        cdnUrl = this.optimizeForAWS(cdnUrl, assetType, options);
        break;
      case 'cloudinary':
        cdnUrl = this.optimizeForCloudinary(cdnUrl, assetType, options);
        break;
      case 'imgix':
        cdnUrl = this.optimizeForImgix(cdnUrl, assetType, options);
        break;
      case 'custom':
        cdnUrl = this.optimizeForCustom(cdnUrl, assetType, options);
        break;
    }

    // Add compression if enabled
    if (compression && compression !== 'none') {
      cdnUrl = this.addCompression(cdnUrl, compression);
    }

    // Cache the URL
    if (cache) {
      this.cache.set(cacheKey, cdnUrl);
    }

    return cdnUrl;
  }

  // Build base URL
  private buildBaseUrl(assetPath: string, version: string): string {
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    return `${this.config.baseUrl}/${version}/${cleanPath}`;
  }

  // Generate cache key
  private generateCacheKey(assetPath: string, assetType: AssetType, options: CDNOptions): string {
    return `${assetPath}_${assetType}_${JSON.stringify(options)}`;
  }

  // Optimize for Cloudflare
  private optimizeForCloudflare(url: string, assetType: AssetType, options: CDNOptions): string {
    const params = new URLSearchParams();

    if (options.quality) {
      params.set('q', options.quality.toString());
    }

    if (options.format && options.format !== 'auto') {
      params.set('f', options.format);
    }

    if (options.width) {
      params.set('w', options.width.toString());
    }

    if (options.height) {
      params.set('h', options.height.toString());
    }

    if (options.fit) {
      params.set('fit', options.fit);
    }

    // Add Cloudflare-specific optimizations
    if (assetType === 'image') {
      params.set('auto', 'format,compress');
    }

    return params.toString() ? `${url}?${params.toString()}` : url;
  }

  // Optimize for AWS CloudFront
  private optimizeForAWS(url: string, assetType: AssetType, options: CDNOptions): string {
    const params = new URLSearchParams();

    if (options.quality) {
      params.set('quality', options.quality.toString());
    }

    if (options.format && options.format !== 'auto') {
      params.set('format', options.format);
    }

    if (options.width) {
      params.set('width', options.width.toString());
    }

    if (options.height) {
      params.set('height', options.height.toString());
    }

    if (options.fit) {
      params.set('fit', options.fit);
    }

    return params.toString() ? `${url}?${params.toString()}` : url;
  }

  // Optimize for Cloudinary
  private optimizeForCloudinary(url: string, assetType: AssetType, options: CDNOptions): string {
    const transformations: string[] = [];

    if (options.width || options.height) {
      const size = [];
      if (options.width) size.push(`w_${options.width}`);
      if (options.height) size.push(`h_${options.height}`);
      if (options.fit) size.push(`c_${options.fit}`);
      transformations.push(size.join(','));
    }

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format && options.format !== 'auto') {
      transformations.push(`f_${options.format}`);
    }

    if (transformations.length > 0) {
      const transformString = transformations.join('/');
      return url.replace('/upload/', `/upload/${transformString}/`);
    }

    return url;
  }

  // Optimize for Imgix
  private optimizeForImgix(url: string, assetType: AssetType, options: CDNOptions): string {
    const params = new URLSearchParams();

    if (options.quality) {
      params.set('q', options.quality.toString());
    }

    if (options.format && options.format !== 'auto') {
      params.set('fm', options.format);
    }

    if (options.width) {
      params.set('w', options.width.toString());
    }

    if (options.height) {
      params.set('h', options.height.toString());
    }

    if (options.fit) {
      params.set('fit', options.fit);
    }

    // Add Imgix-specific optimizations
    params.set('auto', 'format,compress');

    return params.toString() ? `${url}?${params.toString()}` : url;
  }

  // Optimize for custom CDN
  private optimizeForCustom(url: string, assetType: AssetType, options: CDNOptions): string {
    const params = new URLSearchParams();

    if (options.quality) {
      params.set('quality', options.quality.toString());
    }

    if (options.format && options.format !== 'auto') {
      params.set('format', options.format);
    }

    if (options.width) {
      params.set('width', options.width.toString());
    }

    if (options.height) {
      params.set('height', options.height.toString());
    }

    if (options.fit) {
      params.set('fit', options.fit);
    }

    return params.toString() ? `${url}?${params.toString()}` : url;
  }

  // Add compression
  private addCompression(url: string, compression: 'gzip' | 'brotli'): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}compression=${compression}`;
  }

  // Preload asset
  public async preloadAsset(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload: ${url}`));

      document.head.appendChild(link);
    });
  }

  // Upload asset to CDN
  public async uploadAsset(
    file: File,
    path: string,
    options: {
      public?: boolean;
      folder?: string;
      tags?: string[];
    } = {}
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      if (options.public !== undefined) {
        formData.append('public', options.public.toString());
      }

      if (options.folder) {
        formData.append('folder', options.folder);
      }

      if (options.tags) {
        formData.append('tags', options.tags.join(','));
      }

      const response = await fetch(`${this.config.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('CDN upload failed:', error);
      throw error;
    }
  }

  // Delete asset from CDN
  public async deleteAsset(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      });

      return response.ok;
    } catch (error) {
      console.error('CDN delete failed:', error);
      return false;
    }
  }

  // Get CDN statistics
  public async getStats(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get CDN stats:', error);
    }

    return null;
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  public getCacheStats(): {
    size: number;
    entries: string[];
  } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create global CDN provider instance
export const cdnProvider = new CDNProvider();

// CDN hook for React components
export const useCDN = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAssetUrl = useCallback((
    assetPath: string,
    assetType: AssetType,
    options: CDNOptions = {}
  ): string => {
    return cdnProvider.generateUrl(assetPath, assetType, options);
  }, []);

  const preloadAsset = useCallback(async (url: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await cdnProvider.preloadAsset(url);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadAsset = useCallback(async (
    file: File,
    path: string,
    options: { public?: boolean; folder?: string; tags?: string[] } = {}
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await cdnProvider.uploadAsset(file, path, options);
      return url;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (path: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await cdnProvider.deleteAsset(path);
      return success;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAssetUrl,
    preloadAsset,
    uploadAsset,
    deleteAsset,
    isLoading,
    error
  };
};

// CDN optimized image component
export const CDNImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
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
  lazy = true,
  preload = false,
  className,
  style,
  onClick
}) => {
  const { getAssetUrl, preloadAsset } = useCDN();
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const cdnUrl = getAssetUrl(src, 'image', {
      quality,
      format,
      width,
      height,
      fit
    });
    setImageSrc(cdnUrl);

    if (preload) {
      preloadAsset(cdnUrl);
    }
  }, [src, quality, format, width, height, fit, preload, getAssetUrl, preloadAsset]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onClick={onClick}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};

// CDN optimized video component
export const CDNVideo: React.FC<{
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'mp4' | 'webm' | 'auto';
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  width,
  height,
  quality = 80,
  format = 'auto',
  controls = true,
  autoplay = false,
  loop = false,
  muted = false,
  preload = false,
  className,
  style
}) => {
  const { getAssetUrl, preloadAsset } = useCDN();
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    const cdnUrl = getAssetUrl(src, 'video', {
      quality,
      format
    });
    setVideoSrc(cdnUrl);

    if (preload) {
      preloadAsset(cdnUrl);
    }
  }, [src, quality, format, preload, getAssetUrl, preloadAsset]);

  return (
    <video
      src={videoSrc}
      width={width}
      height={height}
      controls={controls}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      preload={preload ? 'auto' : 'none'}
      className={className}
      style={style}
    />
  );
};

// CDN utilities
export const cdnUtils = {
  // Get asset URL
  getUrl: (assetPath: string, assetType: AssetType, options?: CDNOptions) => {
    return cdnProvider.generateUrl(assetPath, assetType, options);
  },

  // Preload asset
  preload: (url: string) => {
    return cdnProvider.preloadAsset(url);
  },

  // Upload asset
  upload: (file: File, path: string, options?: { public?: boolean; folder?: string; tags?: string[] }) => {
    return cdnProvider.uploadAsset(file, path, options);
  },

  // Delete asset
  delete: (path: string) => {
    return cdnProvider.deleteAsset(path);
  },

  // Get stats
  getStats: () => {
    return cdnProvider.getStats();
  },

  // Clear cache
  clearCache: () => {
    cdnProvider.clearCache();
  },

  // Get cache stats
  getCacheStats: () => {
    return cdnProvider.getCacheStats();
  }
};

export default cdnProvider;
