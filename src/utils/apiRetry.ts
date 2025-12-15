/**
 * API Retry Utility
 * Provides automatic retry mechanism for failed API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('NetworkError') ||
        error?.message?.includes('ERR_') ||
        error?.name === 'AbortError') {
      return true;
    }
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    return false;
  },
  onRetry: () => {}, // No-op by default
};

/**
 * Retry an async function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if we've reached max retries
      if (attempt >= opts.maxRetries) {
        break;
      }
      
      // Check if we should retry this error
      if (!opts.retryCondition(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = opts.retryDelay * Math.pow(2, attempt);
      
      // Call onRetry callback
      opts.onRetry(attempt + 1, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Create a retry wrapper for fetch calls
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    retryOptions
  );
}

