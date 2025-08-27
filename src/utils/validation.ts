import DOMPurify from 'dompurify';
import { useState, useCallback } from 'react';

// Validation schemas
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  positive?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

// Common validation patterns
export const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/.+/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  CREDIT_CARD: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}(:\d{2})?$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Validation functions
export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];
  let sanitizedValue = value;

  // Handle null/undefined
  if (value === null || value === undefined) {
    if (rules.required) {
      errors.push('This field is required');
    }
    return { isValid: errors.length === 0, errors, sanitizedValue };
  }

  // Convert to string for validation
  const stringValue = String(value).trim();

  // Required validation
  if (rules.required && (!stringValue || stringValue.length === 0)) {
    errors.push('This field is required');
  }

  // Skip other validations if empty and not required
  if (!stringValue && !rules.required) {
    return { isValid: true, errors: [], sanitizedValue: '' };
  }

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push('Invalid format');
  }

  // Email validation
  if (rules.email && !PATTERNS.EMAIL.test(stringValue)) {
    errors.push('Invalid email address');
  }

  // URL validation
  if (rules.url && !PATTERNS.URL.test(stringValue)) {
    errors.push('Invalid URL');
  }

  // Numeric validation
  if (rules.numeric) {
    const numValue = Number(stringValue);
    if (isNaN(numValue)) {
      errors.push('Must be a number');
    } else {
      sanitizedValue = numValue;
      
      // Integer validation
      if (rules.integer && !Number.isInteger(numValue)) {
        errors.push('Must be an integer');
      }

      // Positive validation
      if (rules.positive && numValue <= 0) {
        errors.push('Must be a positive number');
      }
    }
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(sanitizedValue);
    if (typeof customResult === 'string') {
      errors.push(customResult);
    } else if (!customResult) {
      errors.push('Invalid value');
    }
  }

  return { isValid: errors.length === 0, errors, sanitizedValue };
};

// Sanitization functions
export const sanitizeInput = (input: any, options: {
  allowHTML?: boolean;
  allowScripts?: boolean;
  maxLength?: number;
  stripTags?: boolean;
} = {}): any => {
  if (input === null || input === undefined) {
    return input;
  }

  const { allowHTML = false, allowScripts = false, maxLength, stripTags = true } = options;

  // Handle different input types
  if (typeof input === 'string') {
    let sanitized = input.trim();

    // Apply max length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Strip HTML tags if not allowed
    if (stripTags && !allowHTML) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Sanitize HTML if allowed
    if (allowHTML) {
      const config = {
        ALLOWED_TAGS: allowHTML ? ['b', 'i', 'em', 'strong', 'a', 'p', 'br'] : [],
        ALLOWED_ATTR: allowHTML ? ['href', 'target'] : [],
        FORBID_TAGS: allowScripts ? [] : ['script', 'iframe', 'object', 'embed'],
        FORBID_ATTR: allowScripts ? [] : ['onerror', 'onload', 'onclick', 'onmouseover']
      };
      sanitized = DOMPurify.sanitize(sanitized, config);
    }

    return sanitized;
  }

  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item, options));
  }

  // Handle objects
  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value, options);
    }
    return sanitized;
  }

  return input;
};

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  // User authentication
  LOGIN: {
    email: { required: true, email: true, maxLength: 255 },
    password: { required: true, minLength: 8, maxLength: 128 }
  },

  REGISTER: {
    email: { required: true, email: true, maxLength: 255 },
    password: { required: true, pattern: PATTERNS.PASSWORD },
    confirmPassword: { required: true },
    username: { required: true, pattern: PATTERNS.USERNAME },
    firstName: { required: true, maxLength: 50 },
    lastName: { required: true, maxLength: 50 }
  },

  // Marketplace
  PRODUCT_REVIEW: {
    rating: { required: true, numeric: true, integer: true, positive: true, custom: (value) => value >= 1 && value <= 5 },
    title: { required: true, maxLength: 100 },
    content: { required: true, maxLength: 1000 }
  },

  PRODUCT_QUESTION: {
    question: { required: true, maxLength: 500 }
  },

  PRICE_ALERT: {
    targetPrice: { required: true, numeric: true, positive: true },
    alertType: { required: true, custom: (value) => ['drop', 'increase'].includes(value) },
    notificationType: { required: true, custom: (value) => ['email', 'push', 'both'].includes(value) }
  },

  // Address
  ADDRESS: {
    firstName: { required: true, maxLength: 50 },
    lastName: { required: true, maxLength: 50 },
    email: { required: true, email: true },
    phone: { required: true, pattern: PATTERNS.PHONE },
    address: { required: true, maxLength: 200 },
    city: { required: true, maxLength: 100 },
    state: { required: true, maxLength: 100 },
    zipCode: { required: true, pattern: PATTERNS.ZIP_CODE },
    country: { required: true, maxLength: 100 }
  },

  // Payment
  PAYMENT_METHOD: {
    cardNumber: { required: true, pattern: PATTERNS.CREDIT_CARD },
    expiryMonth: { required: true, numeric: true, integer: true, custom: (value) => value >= 1 && value <= 12 },
    expiryYear: { required: true, numeric: true, integer: true, custom: (value) => value >= new Date().getFullYear() },
    cvv: { required: true, pattern: /^\d{3,4}$/ }
  },

  // Search
  SEARCH: {
    query: { maxLength: 200 },
    category: { maxLength: 100 },
    minPrice: { numeric: true, positive: true },
    maxPrice: { numeric: true, positive: true }
  }
};

// Validate form data
export const validateForm = (data: any, schema: Record<string, ValidationRule>): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: any;
} => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: any = {};

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules);
    
    if (!result.isValid) {
      errors[field] = result.errors;
    }
    
    sanitizedData[field] = result.sanitizedValue;
  }

  // Special validation for password confirmation
  if (schema.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = ['Passwords do not match'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// XSS Prevention
export const preventXSS = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL Injection Prevention
export const preventSQLInjection = (input: string): string => {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi
  ];

  let sanitized = input;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

// File upload validation
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): ValidationResult => {
  const errors: string[] = [];
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  // Check for malicious file types
  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msi',
    'application/x-msdos-program',
    'application/x-msdos-windows'
  ];

  if (dangerousTypes.includes(file.type)) {
    errors.push('This file type is not allowed for security reasons');
  }

  return { isValid: errors.length === 0, errors };
};

// Rate limiting validation
export const validateRateLimit = (identifier: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  const attempts = JSON.parse(localStorage.getItem(key) || '[]');
  const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validAttempts.length >= limit) {
    return false;
  }
  
  validAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(validAttempts));
  return true;
};

// CSRF token validation
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = localStorage.getItem('csrf_token');
  return token === storedToken;
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('csrf_token', token);
  return token;
};

// Input validation hook for React
export const useInputValidation = (initialValue: string, rules: ValidationRule) => {
  const [value, setValue] = useState(initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((inputValue: string) => {
    const result = validateField(inputValue, rules);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [rules]);

  const handleChange = useCallback((inputValue: string) => {
    const sanitized = sanitizeInput(inputValue);
    setValue(sanitized);
    validate(sanitized);
  }, [validate]);

  const handleBlur = useCallback(() => {
    validate(value);
  }, [value, validate]);

  return {
    value,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validate: () => validate(value)
  };
};
