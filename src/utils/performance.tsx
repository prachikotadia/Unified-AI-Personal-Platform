import { useState, useEffect, useCallback } from 'react';
import { imageOptimizer, OptimizedImage, useLazyImage } from './imageOptimization';
import { apiCache, useAPICache, withCache } from './apiCache';
import { cdnProvider, useCDN, CDNImage } from './cdn';

// Performance configuration
interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableAPICaching: boolean;
  enableCDN: boolean;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  enableCompression: boolean;
  enableMonitoring: boolean;
  cacheTTL: number; // in milliseconds
  imageQuality: number; // 0-100
  maxCacheSize: number;
}

// Default performance configuration
const DEFAULT_CONFIG: PerformanceConfig = {
  enableImageOptimization: true,
  enableAPICaching: true,
  enableCDN: true,
  enableLazyLoading: true,
  enablePreloading: true,
  enableCompression: true,
  enableMonitoring: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  imageQuality: 80,
  maxCacheSize: 100
};

// Performance metrics
interface PerformanceMetrics {
  pageLoadTime: number;
  imageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
  timestamp: number;
}

// Performance manager class
class PerformanceManager {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor(config: PerformanceConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeMonitoring();
  }

  // Initialize performance monitoring
  private initializeMonitoring(): void {
    if (!this.config.enableMonitoring) return;

    // Monitor page load performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('pageLoadTime', entry.duration);
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('networkRequests', resourceEntry.duration);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memoryUsage', memory.usedJSHeapSize);
      }, 5000);
    }
  }

  // Record performance metric
  private recordMetric(type: keyof PerformanceMetrics, value: number): void {
    const metric: PerformanceMetrics = {
      pageLoadTime: 0,
      imageLoadTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      networkRequests: 0,
      errors: 0,
      timestamp: Date.now()
    };

    metric[type] = value;
    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Get performance report
  public getPerformanceReport(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    trends: Record<string, number>;
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        current: this.getEmptyMetrics(),
        average: this.getEmptyMetrics(),
        trends: {},
        recommendations: []
      };
    }

    const current = this.metrics[this.metrics.length - 1];
    const average = this.calculateAverageMetrics();
    const trends = this.calculateTrends();
    const recommendations = this.generateRecommendations(current, average);

    return {
      current,
      average,
      trends,
      recommendations
    };
  }

  // Calculate average metrics
  private calculateAverageMetrics(): PerformanceMetrics {
    const sum = this.metrics.reduce((acc, metric) => {
      Object.keys(metric).forEach(key => {
        if (key !== 'timestamp') {
          acc[key as keyof PerformanceMetrics] += metric[key as keyof PerformanceMetrics];
        }
      });
      return acc;
    }, this.getEmptyMetrics());

    const count = this.metrics.length;
    Object.keys(sum).forEach(key => {
      if (key !== 'timestamp') {
        sum[key as keyof PerformanceMetrics] /= count;
      }
    });

    return sum;
  }

  // Calculate trends
  private calculateTrends(): Record<string, number> {
    if (this.metrics.length < 2) return {};

    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);

    const trends: Record<string, number> = {};
    const metricKeys = Object.keys(this.metrics[0]).filter(key => key !== 'timestamp');

    metricKeys.forEach(key => {
      const recentAvg = recent.reduce((sum, m) => sum + m[key as keyof PerformanceMetrics], 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m[key as keyof PerformanceMetrics], 0) / older.length;
      trends[key] = ((recentAvg - olderAvg) / olderAvg) * 100;
    });

    return trends;
  }

  // Generate recommendations
  private generateRecommendations(current: PerformanceMetrics, average: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Page load time recommendations
    if (current.pageLoadTime > 3000) {
      recommendations.push('Page load time is slow. Consider optimizing images and reducing bundle size.');
    }

    // API response time recommendations
    if (current.apiResponseTime > 1000) {
      recommendations.push('API response time is slow. Consider implementing caching and optimizing database queries.');
    }

    // Cache hit rate recommendations
    if (current.cacheHitRate < 0.5) {
      recommendations.push('Cache hit rate is low. Consider increasing cache TTL and implementing better caching strategies.');
    }

    // Memory usage recommendations
    if (current.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory usage is high. Consider implementing memory cleanup and optimizing component rendering.');
    }

    // Network requests recommendations
    if (current.networkRequests > 50) {
      recommendations.push('Too many network requests. Consider bundling resources and implementing request batching.');
    }

    return recommendations;
  }

  // Get empty metrics
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 0,
      imageLoadTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      networkRequests: 0,
      errors: 0,
      timestamp: Date.now()
    };
  }

  // Optimize images
  public optimizeImage(url: string, options: any = {}): string {
    if (!this.config.enableImageOptimization) return url;
    return imageOptimizer.optimizeUrl(url, options);
  }

  // Cache API response
  public async cacheAPIResponse<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    if (!this.config.enableAPICaching) {
      return apiCall();
    }

    return withCache(apiCall, key, {}, { ttl: ttl || this.config.cacheTTL });
  }

  // Get CDN URL
  public getCDNUrl(path: string, type: string, options: any = {}): string {
    if (!this.config.enableCDN) return path;
    return cdnProvider.generateUrl(path, type as any, options);
  }

  // Preload resources
  public preloadResources(resources: string[]): void {
    if (!this.config.enablePreloading) return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = this.getResourceType(resource);
      document.head.appendChild(link);
    });
  }

  // Get resource type
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'css': return 'style';
      case 'js': return 'script';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf': return 'font';
      default: return 'fetch';
    }
  }

  // Cleanup
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create global performance manager instance
export const performanceManager = new PerformanceManager();

// Performance hook for React components
export const usePerformance = () => {
  const [report, setReport] = useState(performanceManager.getPerformanceReport());

  const updateReport = useCallback(() => {
    setReport(performanceManager.getPerformanceReport());
  }, []);

  const optimizeImage = useCallback((url: string, options: any = {}) => {
    return performanceManager.optimizeImage(url, options);
  }, []);

  const cacheAPIResponse = useCallback(async function<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return performanceManager.cacheAPIResponse(key, apiCall, ttl);
  }, []);

  const getCDNUrl = useCallback((path: string, type: string, options: any = {}) => {
    return performanceManager.getCDNUrl(path, type, options);
  }, []);

  const preloadResources = useCallback((resources: string[]) => {
    performanceManager.preloadResources(resources);
  }, []);

  useEffect(() => {
    const interval = setInterval(updateReport, 5000);
    return () => clearInterval(interval);
  }, [updateReport]);

  return {
    report,
    optimizeImage,
    cacheAPIResponse,
    getCDNUrl,
    preloadResources,
    updateReport
  };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC<{
  showDetails?: boolean;
  className?: string;
}> = ({ showDetails = false, className }) => {
  const { report } = usePerformance();

  if (!showDetails) {
    return (
      <div className={`performance-monitor ${className || ''}`}>
        <div className="performance-indicators">
          <div className="indicator">
            <span className="label">Page Load:</span>
            <span className="value">{report.current.pageLoadTime.toFixed(0)}ms</span>
          </div>
          <div className="indicator">
            <span className="label">Cache Hit:</span>
            <span className="value">{(report.current.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div className="indicator">
            <span className="label">Memory:</span>
            <span className="value">{(report.current.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-monitor detailed ${className || ''}`}>
      <h3>Performance Report</h3>
      
      <div className="metrics-section">
        <h4>Current Metrics</h4>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Page Load Time:</span>
            <span className="value">{report.current.pageLoadTime.toFixed(0)}ms</span>
          </div>
          <div className="metric">
            <span className="label">API Response Time:</span>
            <span className="value">{report.current.apiResponseTime.toFixed(0)}ms</span>
          </div>
          <div className="metric">
            <span className="label">Cache Hit Rate:</span>
            <span className="value">{(report.current.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="label">Memory Usage:</span>
            <span className="value">{(report.current.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
          </div>
          <div className="metric">
            <span className="label">Network Requests:</span>
            <span className="value">{report.current.networkRequests}</span>
          </div>
          <div className="metric">
            <span className="label">Errors:</span>
            <span className="value">{report.current.errors}</span>
          </div>
        </div>
      </div>

      {report.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>Recommendations</h4>
          <ul className="recommendations-list">
            {report.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Performance utilities
export const performanceUtils = {
  // Get performance report
  getReport: () => performanceManager.getPerformanceReport(),

  // Optimize image
  optimizeImage: (url: string, options: any = {}) => {
    return performanceManager.optimizeImage(url, options);
  },

  // Cache API response
  cacheAPIResponse: function<T>(key: string, apiCall: () => Promise<T>, ttl?: number) {
    return performanceManager.cacheAPIResponse(key, apiCall, ttl);
  },

  // Get CDN URL
  getCDNUrl: (path: string, type: string, options: any = {}) => {
    return performanceManager.getCDNUrl(path, type, options);
  },

  // Preload resources
  preloadResources: (resources: string[]) => {
    performanceManager.preloadResources(resources);
  },

  // Cleanup
  cleanup: () => {
    performanceManager.cleanup();
  }
};

export default performanceManager;
