import { generateCSRFToken, validateCSRFToken } from './validation';
import { useState, useEffect, useCallback } from 'react';

// CSRF token management
class CSRFProtection {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours

  // Generate new CSRF token
  public generateToken(): string {
    this.token = generateCSRFToken();
    this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME;
    
    // Store token in localStorage
    localStorage.setItem('csrf_token', this.token);
    localStorage.setItem('csrf_token_expiry', this.tokenExpiry.toString());
    
    return this.token;
  }

  // Get current CSRF token
  public getToken(): string | null {
    // Check if token exists and is not expired
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Try to get token from localStorage
    const storedToken = localStorage.getItem('csrf_token');
    const storedExpiry = localStorage.getItem('csrf_token_expiry');
    
    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      this.token = storedToken;
      this.tokenExpiry = parseInt(storedExpiry);
      return this.token;
    }

    // Generate new token if expired or doesn't exist
    return this.generateToken();
  }

  // Validate CSRF token
  public validateToken(token: string): boolean {
    if (!token) return false;
    
    const currentToken = this.getToken();
    return currentToken === token;
  }

  // Refresh CSRF token
  public refreshToken(): string {
    return this.generateToken();
  }

  // Clear CSRF token
  public clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('csrf_token_expiry');
  }

  // Check if token is expired
  public isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiry;
  }

  // Get token expiry time
  public getTokenExpiry(): number {
    return this.tokenExpiry;
  }
}

// Create global CSRF protection instance
export const csrfProtection = new CSRFProtection();

// CSRF token hook for React components
export const useCSRFToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const currentToken = csrfProtection.getToken();
    setToken(currentToken);
    setIsValid(!!currentToken && !csrfProtection.isTokenExpired());
  }, []);

  const refreshToken = useCallback(() => {
    const newToken = csrfProtection.refreshToken();
    setToken(newToken);
    setIsValid(true);
    return newToken;
  }, []);

  const validateToken = useCallback((tokenToValidate: string) => {
    const valid = csrfProtection.validateToken(tokenToValidate);
    setIsValid(valid);
    return valid;
  }, []);

  return {
    token,
    isValid,
    refreshToken,
    validateToken
  };
};

// CSRF protected API call wrapper
export const withCSRFProtection = async (
  apiCall: (token: string) => Promise<any>,
  options: {
    autoRefresh?: boolean;
    retryOnFailure?: boolean;
  } = {}
): Promise<any> => {
  const { autoRefresh = true, retryOnFailure = true } = options;

  try {
    const token = csrfProtection.getToken();
    if (!token) {
      throw new Error('CSRF token not available');
    }

    return await apiCall(token);
  } catch (error: any) {
    // Handle CSRF token expired error
    if (error.status === 403 && error.message?.includes('CSRF') && autoRefresh) {
      const newToken = csrfProtection.refreshToken();
      return await apiCall(newToken);
    }

    // Retry on other failures
    if (retryOnFailure && error.status >= 500) {
      const token = csrfProtection.getToken();
      return await apiCall(token);
    }

    throw error;
  }
};

// CSRF token middleware for API requests
export const csrfMiddleware = {
  // Add CSRF token to request headers
  addToken: (headers: HeadersInit = {}): HeadersInit => {
    const token = csrfProtection.getToken();
    return {
      ...headers,
      'X-CSRF-Token': token || '',
      'X-Requested-With': 'XMLHttpRequest'
    };
  },

  // Validate CSRF token in response
  validateResponse: (response: Response): boolean => {
    const csrfHeader = response.headers.get('X-CSRF-Token');
    if (csrfHeader) {
      return csrfProtection.validateToken(csrfHeader);
    }
    return true; // No CSRF header means no validation needed
  },

  // Handle CSRF token refresh
  handleRefresh: (response: Response): void => {
    const newToken = response.headers.get('X-CSRF-Token');
    if (newToken) {
      csrfProtection.token = newToken;
      csrfProtection.tokenExpiry = Date.now() + csrfProtection.TOKEN_LIFETIME;
      localStorage.setItem('csrf_token', newToken);
      localStorage.setItem('csrf_token_expiry', csrfProtection.tokenExpiry.toString());
    }
  }
};

// CSRF protected form submission
export const submitFormWithCSRF = async (
  formData: FormData | object,
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = csrfProtection.getToken();
  
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token || '',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    },
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
    ...options
  };

  const response = await fetch(url, requestOptions);
  
  // Handle CSRF token refresh
  csrfMiddleware.handleRefresh(response);
  
  return response;
};

// CSRF protected fetch wrapper
export const csrfFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = csrfProtection.getToken();
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'X-CSRF-Token': token || '',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  };

  const response = await fetch(url, requestOptions);
  
  // Handle CSRF token refresh
  csrfMiddleware.handleRefresh(response);
  
  return response;
};

// CSRF token component for forms
export const CSRFInput: React.FC = () => {
  const { token } = useCSRFToken();
  
  return token ? (
    <input type="hidden" name="_csrf" value={token} />
  ) : null;
};

// CSRF token validation for form submissions
export const validateFormCSRF = (formData: FormData): boolean => {
  const token = formData.get('_csrf') as string;
  return csrfProtection.validateToken(token);
};

// CSRF token for AJAX requests
export const getCSRFHeaders = (): Record<string, string> => {
  const token = csrfProtection.getToken();
  return {
    'X-CSRF-Token': token || '',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

// CSRF token refresh on page load
export const initializeCSRF = (): void => {
  // Generate token if not exists
  if (!csrfProtection.getToken()) {
    csrfProtection.generateToken();
  }

  // Set up periodic token refresh
  setInterval(() => {
    if (csrfProtection.isTokenExpired()) {
      csrfProtection.refreshToken();
    }
  }, 60 * 60 * 1000); // Check every hour
};

// CSRF token cleanup on logout
export const cleanupCSRF = (): void => {
  csrfProtection.clearToken();
};

// CSRF token validation for API responses
export const validateAPIResponse = (response: Response): boolean => {
  // Check for CSRF validation errors
  if (response.status === 403) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json().then((data) => {
        if (data.error?.includes('CSRF')) {
          // Refresh token and retry
          csrfProtection.refreshToken();
          return false;
        }
        return true;
      });
    }
  }
  
  return true;
};

// CSRF protection for file uploads
export const uploadFileWithCSRF = async (
  file: File,
  url: string,
  onProgress?: (progress: number) => void
): Promise<Response> => {
  const token = csrfProtection.getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('_csrf', token || '');

  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'X-CSRF-Token': xhr.getResponseHeader('X-CSRF-Token') || ''
          })
        });
        
        csrfMiddleware.handleRefresh(response);
        resolve(response);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('X-CSRF-Token', token || '');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(formData);
  });
};

export default csrfProtection;
