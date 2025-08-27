import { useState, useEffect, useCallback } from 'react';

// Cache configuration
interface CacheConfig {
  maxSize: number; // Maximum number of cached items
  ttl: number; // Time to live in milliseconds
  strategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  enableCompression: boolean;
  enableBackgroundRefresh: boolean;
}

// Cache entry
interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
  headers?: Record<string, string>;
}

// Default cache configuration
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5 minutes
  strategy: 'memory',
  enableCompression: true,
  enableBackgroundRefresh: false
};

// API Cache class
class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private compressionWorker?: Worker;

  constructor(config: CacheConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeCache();
  }

  // Initialize cache based on strategy
  private async initializeCache(): Promise<void> {
    if (this.config.strategy === 'localStorage') {
      await this.loadFromStorage();
    } else if (this.config.strategy === 'indexedDB') {
      await this.initializeIndexedDB();
    }
  }

  // Load cache from localStorage
  private async loadFromStorage(): Promise<void> {
    try {
      const cached = localStorage.getItem('api_cache');
      if (cached) {
        const entries = JSON.parse(cached);
        entries.forEach((entry: CacheEntry) => {
          if (!this.isExpired(entry)) {
            this.cache.set(entry.key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Save cache to localStorage
  private async saveToStorage(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      localStorage.setItem('api_cache', JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  // Initialize IndexedDB
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('APICache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Check if cache entry is expired
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Generate cache key
  public generateKey(url: string, params?: any): string {
    const keyData = { url, params };
    return btoa(JSON.stringify(keyData));
  }

  // Compress data
  private async compress(data: any): Promise<string> {
    if (!this.config.enableCompression) {
      return JSON.stringify(data);
    }

    // Simple compression for demo - in production, use a proper compression library
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }

  // Decompress data
  private async decompress(compressedData: string): Promise<any> {
    if (!this.config.enableCompression) {
      return JSON.parse(compressedData);
    }

    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      // Fallback to uncompressed data
      return JSON.parse(compressedData);
    }
  }

  // Get cached data
  public async get<T>(url: string, params?: any): Promise<T | null> {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    try {
      const data = await this.decompress(entry.data as string);
      return data as T;
    } catch (error) {
      console.warn('Failed to decompress cached data:', error);
      this.cache.delete(key);
      return null;
    }
  }

  // Set cached data
  public async set<T>(
    url: string,
    data: T,
    params?: any,
    ttl?: number,
    etag?: string,
    lastModified?: string,
    headers?: Record<string, string>
  ): Promise<void> {
    const key = this.generateKey(url, params);
    const compressedData = await this.compress(data);

    const entry: CacheEntry = {
      key,
      data: compressedData,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      etag,
      lastModified,
      headers
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);

    // Save to storage if needed
    if (this.config.strategy === 'localStorage') {
      await this.saveToStorage();
    }
  }

  // Check if data is cached
  public has(url: string, params?: any): boolean {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  // Delete cached data
  public delete(url: string, params?: any): boolean {
    const key = this.generateKey(url, params);
    const deleted = this.cache.delete(key);

    if (deleted && this.config.strategy === 'localStorage') {
      this.saveToStorage();
    }

    return deleted;
  }

  // Clear all cache
  public clear(): void {
    this.cache.clear();

    if (this.config.strategy === 'localStorage') {
      localStorage.removeItem('api_cache');
    }
  }

  // Get cache statistics
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    strategy: string;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses
      strategy: this.config.strategy
    };
  }

  // Preload data
  public async preload<T>(
    url: string,
    params?: any,
    ttl?: number
  ): Promise<T | null> {
    const cached = await this.get<T>(url, params);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.set(url, data, params, ttl);
        return data;
      }
    } catch (error) {
      console.warn('Failed to preload data:', error);
    }

    return null;
  }

  // Background refresh
  public async backgroundRefresh<T>(
    url: string,
    params?: any,
    ttl?: number
  ): Promise<void> {
    if (!this.config.enableBackgroundRefresh) {
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.set(url, data, params, ttl);
      }
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }
}

// Create global cache instance
export const apiCache = new APICache();

// Cache hook for React components
export const useAPICache = <T>(
  url: string,
  params?: any,
  options: {
    ttl?: number;
    enableBackgroundRefresh?: boolean;
    dependencies?: any[];
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    ttl,
    enableBackgroundRefresh = false,
    dependencies = []
  } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = await apiCache.get<T>(url, params);
      if (cached) {
        setData(cached);
        setLoading(false);

        // Background refresh if enabled
        if (enableBackgroundRefresh) {
          apiCache.backgroundRefresh(url, params, ttl);
        }
        return;
      }

      // Fetch from API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      await apiCache.set(url, result, params, ttl);
      
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, params, ttl, enableBackgroundRefresh]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    apiCache.delete(url, params);
    fetchData();
  }, [fetchData, url, params]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Cached API call wrapper
export const withCache = <T>(
  apiCall: () => Promise<T>,
  url: string,
  params?: any,
  options: {
    ttl?: number;
    skipCache?: boolean;
  } = {}
): Promise<T> => {
  const { ttl, skipCache = false } = options;

  return new Promise(async (resolve, reject) => {
    try {
      // Check cache if not skipped
      if (!skipCache) {
        const cached = await apiCache.get<T>(url, params);
        if (cached) {
          resolve(cached);
          return;
        }
      }

      // Make API call
      const result = await apiCall();
      
      // Cache the result
      await apiCache.set(url, result, params, ttl);
      
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Cache utilities
export const cacheUtils = {
  // Get cache statistics
  getStats: () => apiCache.getStats(),

  // Clear cache
  clear: () => apiCache.clear(),

  // Preload data
  preload: <T>(url: string, params?: any, ttl?: number) => {
    return apiCache.preload<T>(url, params, ttl);
  },

  // Check if data is cached
  has: (url: string, params?: any) => apiCache.has(url, params),

  // Delete cached data
  delete: (url: string, params?: any) => apiCache.delete(url, params)
};

// Cache middleware for API calls
export const cacheMiddleware = {
  // Add cache headers to request
  addCacheHeaders: (headers: HeadersInit = {}): HeadersInit => {
    return {
      ...headers,
      'Cache-Control': 'max-age=300', // 5 minutes
      'X-Cache-Enabled': 'true'
    };
  },

  // Handle cache headers in response
  handleCacheHeaders: (response: Response, url: string, params?: any): void => {
    const etag = response.headers.get('ETag');
    const lastModified = response.headers.get('Last-Modified');
    const cacheControl = response.headers.get('Cache-Control');

    if (etag || lastModified) {
      // Store cache metadata
      const cacheKey = apiCache.generateKey(url, params);
      // This would be stored with the cache entry
    }
  }
};

export default apiCache;
