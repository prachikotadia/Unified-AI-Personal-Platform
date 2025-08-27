import { useState, useCallback } from 'react';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  keyGenerator?: (req: any) => string; // Custom key generator
  handler?: (req: any, res: any) => void; // Custom handler for rate limit exceeded
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100, // 100 requests per window default
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
  }

  // Generate rate limit key
  private generateKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  // Check if request is within rate limit
  public checkLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.generateKey(identifier);
    const now = Date.now();
    const windowMs = this.config.windowMs;

    // Clean up expired entries
    this.cleanup();

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || now > entry.resetTime) {
      entry = {
        requests: 0,
        resetTime: now + windowMs
      };
      this.store[key] = entry;
    }

    // Check if limit exceeded
    if (entry.requests >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      };
    }

    // Increment request count
    entry.requests++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.requests,
      resetTime: entry.resetTime
    };
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // Reset rate limit for an identifier
  public reset(identifier: string): void {
    const key = this.generateKey(identifier);
    delete this.store[key];
  }

  // Get current rate limit status
  public getStatus(identifier: string): {
    requests: number;
    remaining: number;
    resetTime: number;
  } | null {
    const key = this.generateKey(identifier);
    const entry = this.store[key];
    
    if (!entry) {
      return null;
    }

    return {
      requests: entry.requests,
      remaining: Math.max(0, this.config.maxRequests - entry.requests),
      resetTime: entry.resetTime
    };
  }
}

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true
  },

  // API endpoints
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    skipSuccessfulRequests: false
  },

  // Search endpoints
  SEARCH: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    skipSuccessfulRequests: false
  },

  // File upload endpoints
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    skipSuccessfulRequests: false
  },

  // Payment endpoints
  PAYMENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 payment attempts per hour
    skipSuccessfulRequests: true
  },

  // Review/rating endpoints
  REVIEW: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5, // 5 reviews per day
    skipSuccessfulRequests: true
  },

  // Contact/support endpoints
  CONTACT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 contact messages per hour
    skipSuccessfulRequests: true
  }
};

// Create rate limiters for different endpoints
export const rateLimiters = {
  auth: new RateLimiter(RATE_LIMIT_CONFIGS.AUTH),
  api: new RateLimiter(RATE_LIMIT_CONFIGS.API),
  search: new RateLimiter(RATE_LIMIT_CONFIGS.SEARCH),
  upload: new RateLimiter(RATE_LIMIT_CONFIGS.UPLOAD),
  payment: new RateLimiter(RATE_LIMIT_CONFIGS.PAYMENT),
  review: new RateLimiter(RATE_LIMIT_CONFIGS.REVIEW),
  contact: new RateLimiter(RATE_LIMIT_CONFIGS.CONTACT)
};

// Rate limiting middleware for API calls
export const withRateLimit = (
  apiCall: () => Promise<any>,
  limiter: RateLimiter,
  identifier: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const result = limiter.checkLimit(identifier);
    
    if (!result.allowed) {
      const error = new Error('Rate limit exceeded');
      (error as any).status = 429;
      (error as any).retryAfter = result.retryAfter;
      reject(error);
      return;
    }

    // Add rate limit headers to response
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).then(response => {
        const newResponse = response.clone();
        newResponse.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS.API.maxRequests.toString());
        newResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        newResponse.headers.set('X-RateLimit-Reset', result.resetTime.toString());
        return newResponse;
      });
    };

    apiCall()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        // Restore original fetch
        window.fetch = originalFetch;
      });
  });
};

// Rate limiting hook for React components
export const useRateLimit = (limiter: RateLimiter, identifier: string) => {
  const [isLimited, setIsLimited] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [resetTime, setResetTime] = useState(0);

  const checkLimit = useCallback(() => {
    const result = limiter.checkLimit(identifier);
    setIsLimited(!result.allowed);
    setRemaining(result.remaining);
    setResetTime(result.resetTime);
    return result;
  }, [limiter, identifier]);

  const reset = useCallback(() => {
    limiter.reset(identifier);
    setIsLimited(false);
    setRemaining(0);
    setResetTime(0);
  }, [limiter, identifier]);

  return {
    isLimited,
    remaining,
    resetTime,
    checkLimit,
    reset
  };
};

// Rate limiting decorator for API functions
export const rateLimited = (
  limiter: RateLimiter,
  identifier: string
) => {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const result = limiter.checkLimit(identifier);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

// Rate limiting for specific user actions
export const userActionRateLimit = {
  // Login attempts
  login: (userId: string) => rateLimiters.auth.checkLimit(`login:${userId}`),
  
  // Password reset attempts
  passwordReset: (email: string) => rateLimiters.auth.checkLimit(`password_reset:${email}`),
  
  // Search queries
  search: (userId: string) => rateLimiters.search.checkLimit(`search:${userId}`),
  
  // File uploads
  upload: (userId: string) => rateLimiters.upload.checkLimit(`upload:${userId}`),
  
  // Payment attempts
  payment: (userId: string) => rateLimiters.payment.checkLimit(`payment:${userId}`),
  
  // Review submissions
  review: (userId: string) => rateLimiters.review.checkLimit(`review:${userId}`),
  
  // Contact form submissions
  contact: (userId: string) => rateLimiters.contact.checkLimit(`contact:${userId}`)
};

// Rate limiting for IP addresses
export const ipRateLimit = {
  // General API requests
  api: (ip: string) => rateLimiters.api.checkLimit(`ip:${ip}`),
  
  // Authentication attempts
  auth: (ip: string) => rateLimiters.auth.checkLimit(`ip_auth:${ip}`),
  
  // Search requests
  search: (ip: string) => rateLimiters.search.checkLimit(`ip_search:${ip}`)
};

// Rate limiting middleware for Express.js (if using Node.js backend)
export const expressRateLimit = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config);
  
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const result = limiter.checkLimit(identifier);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.maxRequests,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': result.resetTime
    });
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: result.retryAfter,
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`
      });
      return;
    }
    
    next();
  };
};

export default RateLimiter;
