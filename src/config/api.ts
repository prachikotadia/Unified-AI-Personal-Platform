// API Configuration for different environments
interface APIConfig {
  baseURL: string;
  wsURL: string;
  chatURL: string;
  travelURL: string;
  timeout: number;
}

// Development configuration
const devConfig: APIConfig = {
  baseURL: 'http://localhost:8000',  // FastAPI backend runs on port 8000
  wsURL: 'ws://localhost:8000/ws',
  chatURL: 'http://localhost:8003',
  travelURL: 'http://localhost:8004',
  timeout: 10000,
};

// Production configuration - UPDATE THESE URLs WITH YOUR ACTUAL DEPLOYED BACKEND URLs
const prodConfig: APIConfig = {
  baseURL: 'https://omnilife-backend.onrender.com', // Replace with your actual backend URL
  wsURL: 'wss://omnilife-backend.onrender.com/ws', // Replace with your actual WebSocket URL
  chatURL: 'https://omnilife-chat.onrender.com', // Replace with your actual chat service URL
  travelURL: 'https://omnilife-travel.onrender.com', // Replace with your actual travel service URL
  timeout: 15000,
};

// Determine environment
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

// Export the appropriate configuration
export const apiConfig: APIConfig = isProduction ? prodConfig : devConfig;

// Helper function to get WebSocket URL for specific service
export const getWebSocketURL = (service: 'fitness' | 'finance' | 'chat' = 'fitness'): string => {
  return `${apiConfig.wsURL}/${service}`;
};

// Helper function to check if backend is available
export const isBackendAvailable = async (): Promise<boolean> => {
  // In production, if we're using placeholder URLs, assume backend is not available
  if (isProduction && (apiConfig.baseURL.includes('your-backend-domain.com') || apiConfig.baseURL.includes('omnilife-backend.onrender.com'))) {
    return false;
  }
  
  try {
    // Use AbortController for timeout (fetch doesn't support timeout option directly)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`${apiConfig.baseURL}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error: any) {
    // Silently handle all errors - these are expected when backend is not running
    // Don't log errors to console to reduce noise
    return false;
  }
};

// Export individual URLs for convenience
export const API_BASE_URL = apiConfig.baseURL;
export const WS_BASE_URL = apiConfig.wsURL;
export const CHAT_API_URL = apiConfig.chatURL;
export const TRAVEL_API_URL = apiConfig.travelURL;
export const API_TIMEOUT = apiConfig.timeout;
