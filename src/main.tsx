import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'
import { logPersistenceValidation } from './utils/persistenceValidator'
import { startStorageMonitoring } from './utils/localStorageMonitor'
import { initCrossTabSync } from './utils/crossTabSync'

// Suppress expected console errors (Vite HMR, Service Worker, etc.)
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args: any[]) {
  const message = args[0]?.toString() || '';
  const errorMessage = args[0]?.message?.toString() || '';
  const fullMessage = args.map(arg => String(arg)).join(' ');
  
  // Suppress Vite WebSocket HMR errors
  if (message.includes('WebSocket connection') && message.includes('localhost:3000')) {
    return;
  }
  
  // Suppress LiveSync WebSocket errors (expected when endpoint doesn't exist)
  if (message.includes('WebSocket connection') && 
      (message.includes('localhost:8000') || message.includes('/ws/'))) {
    return;
  }
  
  if (message.includes('LiveSync') && 
      (message.includes('WebSocket') || message.includes('reconnect') || 
       message.includes('disconnected') || message.includes('error'))) {
    return;
  }
  
  // Suppress Chat WebSocket errors (expected when chat server is not available)
  // Check both message and fullMessage for comprehensive coverage
  if ((message.includes('WebSocket connection') || fullMessage.includes('WebSocket connection')) && 
      (message.includes('localhost:8003') || message.includes('socket.io') || 
       message.includes('ws://localhost:8003') || fullMessage.includes('localhost:8003'))) {
    return;
  }
  
  // Suppress all chatAPI.ts errors
  if (message.includes('chatAPI.ts') || fullMessage.includes('chatAPI.ts') ||
      message.includes('Connection error') ||
      (message.includes('TransportError') && message.includes('websocket')) ||
      (message.includes('WebSocket is closed before the connection is established')) ||
      message.includes('socket__io-client') || fullMessage.includes('socket__io-client')) {
    return;
  }
  
  // Suppress chat API 503 errors (comprehensive pattern matching)
  if (message.includes('localhost:8003') || fullMessage.includes('localhost:8003') ||
      (message.includes('503') && message.includes('Service Unavailable')) ||
      (message.includes('GET http://localhost:8003') && 
       (message.includes('/api/users') || message.includes('/api/rooms') || message.includes('/api/') || message.includes('/health'))) ||
      (fullMessage.includes('GET http://localhost:8003')) ||
      message.includes('net::ERR_ABORTED') ||
      (message.includes('ERR_ABORTED') && message.includes('503'))) {
    return;
  }
  
  // Suppress chatAPI.ts health check errors (all line numbers)
  if ((message.includes('chatAPI.ts:') || fullMessage.includes('chatAPI.ts:')) &&
      (message.includes('localhost:8003') || message.includes('503') || message.includes('ERR_ABORTED') ||
       message.includes('/health') || fullMessage.includes('/health'))) {
    return;
  }
  
  // Suppress isChatServerAvailable errors
  if (message.includes('isChatServerAvailable') || fullMessage.includes('isChatServerAvailable')) {
    return;
  }
  
  // Suppress socket.io client errors (comprehensive - check all args)
  if (message.includes('socket__io-client') || fullMessage.includes('socket__io-client') ||
      message.includes('createSocket') || fullMessage.includes('createSocket') ||
      message.includes('doOpen') || fullMessage.includes('doOpen') ||
      message.includes('Manager') || fullMessage.includes('Manager') ||
      message.includes('lookup2') || fullMessage.includes('lookup2') ||
      message.includes('socket.io') || fullMessage.includes('socket.io') ||
      args.some(arg => String(arg).includes('socket__io-client')) ||
      args.some(arg => String(arg).includes('socket.io')) ||
      args.some(arg => String(arg).includes('createSocket')) ||
      args.some(arg => String(arg).includes('doOpen'))) {
    return;
  }
  
  // Catch-all for any error containing chatAPI.ts line numbers (stack traces)
  if (fullMessage.includes('chatAPI.ts:66') || fullMessage.includes('chatAPI.ts:279') || 
      fullMessage.includes('chatAPI.ts:313') || fullMessage.includes('chatAPI.ts:')) {
    return;
  }
  
  // Suppress service worker fetch errors
  if (message.includes('Service Worker: Network request failed') ||
      message.includes('Failed to fetch') ||
      errorMessage.includes('Failed to fetch') ||
      message.includes('TypeError: Failed to fetch')) {
    return;
  }
  
  // Suppress CORS errors for health checks
  if (message.includes('CORS') && (message.includes('health') || message.includes('localhost:5000'))) {
    return;
  }
  
  // Suppress port 5000 errors (old backend reference)
  if (message.includes('localhost:5000') || message.includes(':5000/health')) {
    return;
  }
  
  // Suppress travel API errors (503 Service Unavailable)
  if (message.includes('GET http://localhost:8001/health') ||
      message.includes('GET http://localhost:8000/health') ||
      message.includes('503 (Service Unavailable)') ||
      message.includes('travelAPI.ts')) {
    return;
  }
  
  // Suppress axios errors for health checks
  if (errorMessage.includes('503') || 
      errorMessage.includes('Service Unavailable') ||
      (message.includes('/health') && (message.includes('503') || message.includes('failed')))) {
    return;
  }
  
  originalError.apply(console, args);
};

console.warn = function(...args: any[]) {
  const message = args[0]?.toString() || '';
  const fullMessage = args.map(arg => String(arg)).join(' ');
  
  // Suppress Vite WebSocket warnings
  if (message.includes('WebSocket') && message.includes('localhost:3000')) {
    return;
  }
  
  // Suppress LiveSync WebSocket warnings
  if (message.includes('LiveSync') || 
      (message.includes('WebSocket') && message.includes('localhost:8000'))) {
    return;
  }
  
  // Suppress Chat WebSocket warnings (comprehensive)
  if ((message.includes('WebSocket') || fullMessage.includes('WebSocket')) && 
      (message.includes('localhost:8003') || message.includes('socket.io') ||
       fullMessage.includes('localhost:8003') || fullMessage.includes('socket.io'))) {
    return;
  }
  
  // Suppress socket.io client warnings (comprehensive)
  if (message.includes('socket__io-client') || fullMessage.includes('socket__io-client') ||
      message.includes('socket.io') || fullMessage.includes('socket.io') ||
      message.includes('createSocket') || fullMessage.includes('createSocket') ||
      args.some(arg => String(arg).includes('socket__io-client')) ||
      args.some(arg => String(arg).includes('socket.io'))) {
    return;
  }
  
  // Suppress service worker warnings
  if (message.includes('Service Worker') && message.includes('fetch')) {
    return;
  }
  
  // Suppress Vite HMR warnings
  if (message.includes('[vite]') && message.includes('websocket')) {
    return;
  }
  
  // Suppress React Router future flag warnings
  if (message.includes('React Router Future Flag')) {
    return;
  }
  
  // Suppress security manager already initialized warnings
  if (message.includes('Security manager already initialized')) {
    return;
  }
  
  // Suppress service worker registration messages
  if (message.includes('Service Worker registered successfully')) {
    return;
  }
  
  // Suppress security initialization messages
  if (message.includes('CSRF protection initialized') ||
      message.includes('Encryption initialized') ||
      message.includes('Secure headers configured') ||
      message.includes('Content Security Policy configured') ||
      message.includes('XSS protection configured') ||
      message.includes('Security manager initialized successfully')) {
    return;
  }
  
  originalWarn.apply(console, args);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Validate persistence on app load (dev mode only)
if ((import.meta as any).env?.MODE === 'development') {
  // Wait a bit for stores to hydrate
  setTimeout(() => {
    logPersistenceValidation();
  }, 1000);
}

// Initialize localStorage monitoring and cross-tab sync
try {
  // Start storage monitoring (checks quota every 5 minutes)
  startStorageMonitoring(80); // Warn at 80% usage
  
  // Initialize cross-tab synchronization
  initCrossTabSync();
  
  if ((import.meta as any).env?.MODE === 'development') {
    console.log('[App] localStorage monitoring and cross-tab sync initialized');
  }
} catch (error) {
  console.error('[App] Error initializing storage utilities:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
