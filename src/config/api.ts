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
  baseURL: 'https://your-backend-domain.com/api', // Replace with your actual backend URL
  wsURL: 'wss://your-backend-domain.com/ws', // Replace with your actual WebSocket URL
  chatURL: 'https://your-chat-service.com', // Replace with your actual chat service URL
  travelURL: 'https://your-travel-service.com', // Replace with your actual travel service URL
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
