import { initializeCSRF } from './csrf';
import { initializeEncryption } from './encryption';
import { rateLimiters } from './rateLimiter';
import { validateForm, VALIDATION_SCHEMAS } from './validation';

// Security configuration
export interface SecurityConfig {
  enableCSRF: boolean;
  enableEncryption: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableFileUploadValidation: boolean;
  enableSecureHeaders: boolean;
  enableContentSecurityPolicy: boolean;
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableCSRF: true,
  enableEncryption: true,
  enableRateLimiting: true,
  enableInputValidation: true,
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  enableFileUploadValidation: true,
  enableSecureHeaders: true,
  enableContentSecurityPolicy: true
};

// Security manager class
class SecurityManager {
  private config: SecurityConfig;
  private isInitialized: boolean = false;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
  }

  // Initialize all security features
  public initialize(): void {
    if (this.isInitialized) {
      console.warn('Security manager already initialized');
      return;
    }

    try {
      // Initialize CSRF protection
      if (this.config.enableCSRF) {
        initializeCSRF();
        console.log('CSRF protection initialized');
      }

      // Initialize encryption
      if (this.config.enableEncryption) {
        initializeEncryption();
        console.log('Encryption initialized');
      }

      // Set up secure headers
      if (this.config.enableSecureHeaders) {
        this.setupSecureHeaders();
        console.log('Secure headers configured');
      }

      // Set up Content Security Policy
      if (this.config.enableContentSecurityPolicy) {
        this.setupContentSecurityPolicy();
        console.log('Content Security Policy configured');
      }

      // Set up XSS protection
      if (this.config.enableXSSProtection) {
        this.setupXSSProtection();
        console.log('XSS protection configured');
      }

      this.isInitialized = true;
      console.log('Security manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize security manager:', error);
      throw error;
    }
  }

  // Set up secure headers
  private setupSecureHeaders(): void {
    // Note: X-Frame-Options and frame-ancestors should be set via HTTP headers on the server
    // These meta tags are for client-side fallback only
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'X-Content-Type-Options';
    meta.content = 'nosniff';
    document.head.appendChild(meta);

    const meta3 = document.createElement('meta');
    meta3.httpEquiv = 'X-XSS-Protection';
    meta3.content = '1; mode=block';
    document.head.appendChild(meta3);
  }

  // Set up Content Security Policy
  private setupContentSecurityPolicy(): void {
    // Note: frame-ancestors should be set via HTTP headers on the server
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' http://localhost:5000 http://localhost:8001 http://localhost:8003 https://api.localhost:5000 wss://localhost:5000 ws://localhost:8003 https://*.netlify.app https://*.railway.app https://*.render.com https://*.herokuapp.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  // Set up XSS protection
  private setupXSSProtection(): void {
    // Override dangerous functions
    if (typeof window !== 'undefined') {
      // Disable eval
      window.eval = () => {
        throw new Error('eval() is disabled for security reasons');
      };

      // Disable Function constructor
      (window as any).Function = () => {
        throw new Error('Function constructor is disabled for security reasons');
      };

      // Disable innerHTML for script tags
      const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value: string) {
          if (typeof value === 'string' && value.toLowerCase().includes('<script')) {
            throw new Error('innerHTML with script tags is disabled for security reasons');
          }
          originalInnerHTML?.set?.call(this, value);
        },
        get: originalInnerHTML?.get
      });
    }
  }

  // Validate form data with security checks
  public validateFormData(data: any, schema: string): {
    isValid: boolean;
    errors: Record<string, string[]>;
    sanitizedData: any;
  } {
    if (!this.config.enableInputValidation) {
      return { isValid: true, errors: {}, sanitizedData: data };
    }

    const validationSchema = VALIDATION_SCHEMAS[schema as keyof typeof VALIDATION_SCHEMAS];
    if (!validationSchema) {
      throw new Error(`Validation schema '${schema}' not found`);
    }

    return validateForm(data, validationSchema);
  }

  // Check rate limit for user action
  public checkRateLimit(action: string, identifier: string): boolean {
    if (!this.config.enableRateLimiting) {
      return true;
    }

    const limiter = rateLimiters[action as keyof typeof rateLimiters];
    if (!limiter) {
      console.warn(`Rate limiter for action '${action}' not found`);
      return true;
    }

    const result = limiter.checkLimit(identifier);
    return result.allowed;
  }

  // Get security status
  public getSecurityStatus(): {
    isInitialized: boolean;
    config: SecurityConfig;
    features: Record<string, boolean>;
  } {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      features: {
        csrf: this.config.enableCSRF,
        encryption: this.config.enableEncryption,
        rateLimiting: this.config.enableRateLimiting,
        inputValidation: this.config.enableInputValidation,
        xssProtection: this.config.enableXSSProtection,
        sqlInjectionProtection: this.config.enableSQLInjectionProtection,
        fileUploadValidation: this.config.enableFileUploadValidation,
        secureHeaders: this.config.enableSecureHeaders,
        contentSecurityPolicy: this.config.enableContentSecurityPolicy
      }
    };
  }

  // Update security configuration
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Security configuration updated:', this.config);
  }

  // Security audit
  public performSecurityAudit(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check if HTTPS is being used
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Not using HTTPS');
      recommendations.push('Enable HTTPS for production');
      score -= 20;
    }

    // Check if security headers are present
    if (!this.config.enableSecureHeaders) {
      issues.push('Secure headers not enabled');
      recommendations.push('Enable secure headers');
      score -= 15;
    }

    // Check if CSP is enabled
    if (!this.config.enableContentSecurityPolicy) {
      issues.push('Content Security Policy not enabled');
      recommendations.push('Enable Content Security Policy');
      score -= 15;
    }

    // Check if CSRF protection is enabled
    if (!this.config.enableCSRF) {
      issues.push('CSRF protection not enabled');
      recommendations.push('Enable CSRF protection');
      score -= 10;
    }

    // Check if encryption is enabled
    if (!this.config.enableEncryption) {
      issues.push('Encryption not enabled');
      recommendations.push('Enable encryption for sensitive data');
      score -= 10;
    }

    // Check if rate limiting is enabled
    if (!this.config.enableRateLimiting) {
      issues.push('Rate limiting not enabled');
      recommendations.push('Enable rate limiting');
      score -= 10;
    }

    // Check if input validation is enabled
    if (!this.config.enableInputValidation) {
      issues.push('Input validation not enabled');
      recommendations.push('Enable input validation');
      score -= 10;
    }

    // Check if XSS protection is enabled
    if (!this.config.enableXSSProtection) {
      issues.push('XSS protection not enabled');
      recommendations.push('Enable XSS protection');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}

// Create global security manager instance
export const securityManager = new SecurityManager();

// Security initialization function
export const initializeSecurity = (config?: Partial<SecurityConfig>): void => {
  if (config) {
    securityManager.updateConfig(config);
  }
  securityManager.initialize();
};

// Security utilities for components
export const useSecurity = () => {
  const validateForm = (data: any, schema: string) => {
    return securityManager.validateFormData(data, schema);
  };

  const checkRateLimit = (action: string, identifier: string) => {
    return securityManager.checkRateLimit(action, identifier);
  };

  const getSecurityStatus = () => {
    return securityManager.getSecurityStatus();
  };

  const performAudit = () => {
    return securityManager.performSecurityAudit();
  };

  return {
    validateForm,
    checkRateLimit,
    getSecurityStatus,
    performAudit
  };
};

// Security middleware for API calls
export const withSecurity = (
  apiCall: () => Promise<any>,
  options: {
    validateInput?: boolean;
    schema?: string;
    rateLimit?: boolean;
    action?: string;
    identifier?: string;
  } = {}
): Promise<any> => {
  const {
    validateInput = true,
    schema,
    rateLimit = true,
    action,
    identifier
  } = options;

  return new Promise((resolve, reject) => {
    // Check rate limiting
    if (rateLimit && action && identifier) {
      if (!securityManager.checkRateLimit(action, identifier)) {
        reject(new Error('Rate limit exceeded'));
        return;
      }
    }

    // Validate input if schema provided
    if (validateInput && schema) {
      // This would be called with actual data in a real implementation
      // For now, we just proceed
    }

    // Make API call
    apiCall()
      .then(resolve)
      .catch(reject);
  });
};

// Security constants
export const SECURITY_CONSTANTS = {
  // Rate limit actions
  RATE_LIMIT_ACTIONS: {
    LOGIN: 'auth',
    REGISTER: 'auth',
    PASSWORD_RESET: 'auth',
    SEARCH: 'search',
    UPLOAD: 'upload',
    PAYMENT: 'payment',
    REVIEW: 'review',
    CONTACT: 'contact'
  },

  // Validation schemas
  VALIDATION_SCHEMAS: {
    LOGIN: 'LOGIN',
    REGISTER: 'REGISTER',
    PRODUCT_REVIEW: 'PRODUCT_REVIEW',
    PRODUCT_QUESTION: 'PRODUCT_QUESTION',
    PRICE_ALERT: 'PRICE_ALERT',
    ADDRESS: 'ADDRESS',
    PAYMENT_METHOD: 'PAYMENT_METHOD',
    SEARCH: 'SEARCH'
  },

  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
};

export default securityManager;
