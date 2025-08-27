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
  baseURL: 'http://localhost:8000/api',
  wsURL: 'ws://localhost:8000/ws',
  chatURL: 'http://localhost:8003',
  travelURL: 'http://localhost:8001',
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
    console.log('Backend not configured - using demo mode');
    return false;
  }
  
  try {
    const response = await fetch(`${apiConfig.baseURL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend not available:', error);
    return false;
  }
};

// Export individual URLs for convenience
export const API_BASE_URL = apiConfig.baseURL;
export const WS_BASE_URL = apiConfig.wsURL;
export const CHAT_API_URL = apiConfig.chatURL;
export const TRAVEL_API_URL = apiConfig.travelURL;
export const API_TIMEOUT = apiConfig.timeout;
