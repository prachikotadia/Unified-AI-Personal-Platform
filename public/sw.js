const CACHE_NAME = 'omnilife-v1.0.0';
const STATIC_CACHE = 'omnilife-static-v1.0.0';
const DYNAMIC_CACHE = 'omnilife-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/marketplace/products',
  '/api/marketplace/categories',
  '/api/marketplace/ai/recommendations',
  '/api/marketplace/price-alerts',
  '/api/marketplace/recently-viewed'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        // Silently fail - not critical for app functionality
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: MUST BE FIRST CHECK - Never intercept WebSocket connections
  // Service workers MUST NOT intercept WebSocket (Vite HMR uses WebSocket)
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return; // Let browser handle WebSocket connections directly - DO NOT INTERCEPT
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Vite HMR and dev server requests
  if (url.pathname.includes('/__vite') || 
      url.pathname.includes('/node_modules') ||
      url.pathname.includes('/@vite') ||
      url.pathname.includes('/@react') ||
      url.pathname.includes('/@id') ||
      url.search.includes('t=') || // Vite HMR token
      url.search.includes('token=') || // Vite HMR token
      (url.hostname === 'localhost' && url.port === '3000' && url.pathname === '/')) {
    return; // Let browser handle these requests
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests - only for specific routes that need caching
  if (request.mode === 'navigate') {
    const url = new URL(request.url);
    // Only handle navigation for main app routes, let others pass through
    if (url.pathname.startsWith('/fitness') || 
        url.pathname.startsWith('/finance') || 
        url.pathname.startsWith('/marketplace') ||
        url.pathname.startsWith('/travel') ||
        url.pathname.startsWith('/chat') ||
        url.pathname === '/') {
      event.respondWith(handleNavigation(request));
      return;
    }
  }

  // Skip external API requests that might fail
  if (url.hostname !== self.location.hostname && 
      !url.hostname.includes('localhost') && 
      !url.hostname.includes('127.0.0.1')) {
    return; // Let browser handle external requests
  }

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            })
            .catch(() => {
              // Silently fail cache storage - not critical
            });
        }
        return response;
      })
      .catch((error) => {
        // Silently handle network failures - service worker will fallback to cache
        // Don't log errors for expected failures (offline, CORS, etc.)
        
        // Fallback to cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response and it's an API request, return offline response
            if (url.pathname.startsWith('/api/')) {
              return new Response(
                JSON.stringify({ 
                  error: 'Network error', 
                  message: 'You are offline. Please check your connection.' 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            // For other requests, let the browser handle it
            return fetch(request).catch(() => {
              // Final fallback - return a basic response
              return new Response('', { status: 503 });
            });
          });
      })
  );
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Skip requests to external APIs that might fail
  if (url.hostname !== self.location.hostname && 
      !url.hostname.includes('localhost') && 
      !url.hostname.includes('127.0.0.1')) {
    // Let browser handle external API requests
    try {
      return await fetch(request);
    } catch (error) {
      // Return offline response for external API failures
      return new Response(
        JSON.stringify({ 
          error: 'Network error', 
          message: 'Unable to reach external service. Please check your connection.' 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  try {
    // For AI insights, always try network first
    if (request.url.includes('/ai-insights/')) {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (error) {
        // Fallback to cache for AI insights
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    }
    
    // Try cache first for other API requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached response but also try to update in background
      fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
      }).catch(() => {
        // Silently fail background update
      });
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful API responses (except AI insights)
    if (networkResponse.status === 200 && !request.url.includes('/ai-insights/')) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    // Silently handle API failures - service worker will fallback to cache
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({ 
        error: 'Network error', 
        message: 'You are offline. Please check your connection.' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  // Skip chrome-extension URLs and Vite HMR
  if (request.url.startsWith('chrome-extension://') ||
      request.url.includes('/__vite') ||
      request.url.includes('/node_modules')) {
    return fetch(request).catch(() => {
      return new Response('', { status: 404 });
    });
  }
  
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // Silently handle static asset failures
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // Silently handle navigation failures - service worker will fallback to cache
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try to return offline page
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }

    // Return a proper offline response if no cached content is available
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-message { color: #666; }
          </style>
        </head>
        <body>
          <h1>You're Offline</h1>
          <p class="offline-message">Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </body>
      </html>
      `,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Sync offline data when connection is restored
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineData(data.id);
      } catch (error) {
        // Silently handle background sync failures
      }
    }
  } catch (error) {
    // Silently handle background sync errors
  }
}

// Store offline data
async function storeOfflineData(data) {
  const db = await openDB();
  const transaction = db.transaction(['offlineData'], 'readwrite');
  const store = transaction.objectStore('offlineData');
  await store.add({
    id: Date.now().toString(),
    timestamp: Date.now(),
    ...data
  });
}

// Get offline data
async function getOfflineData() {
  const db = await openDB();
  const transaction = db.transaction(['offlineData'], 'readonly');
  const store = transaction.objectStore('offlineData');
  return await store.getAll();
}

// Remove offline data
async function removeOfflineData(id) {
  const db = await openDB();
  const transaction = db.transaction(['offlineData'], 'readwrite');
  const store = transaction.objectStore('offlineData');
  await store.delete(id);
}

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OmniLifeOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create offline data store
      if (!db.objectStoreNames.contains('offlineData')) {
        const store = db.createObjectStore('offlineData', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from OmniLife',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('OmniLife', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// COMPLETELY suppress ALL expected errors in service worker
// This prevents console spam from expected network failures
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to completely suppress expected errors
console.error = function(...args) {
  const message = args[0]?.toString() || '';
  const errorMessage = args[0]?.message?.toString() || '';
  const fullMessage = message + ' ' + errorMessage;
  
  // Suppress ALL service worker fetch errors
  if (fullMessage.includes('Service Worker: Network request failed') ||
      fullMessage.includes('Failed to fetch') ||
      fullMessage.includes('TypeError: Failed to fetch') ||
      fullMessage.includes('NetworkError') ||
      fullMessage.includes('ERR_FAILED')) {
    return; // Completely suppress - don't log at all
  }
  
  // Only log if it's not an expected error
  originalError.apply(console, args);
};

// Override console.warn to suppress expected warnings
console.warn = function(...args) {
  const message = args[0]?.toString() || '';
  
  // Suppress service worker warnings
  if (message.includes('Service Worker') && 
      (message.includes('fetch') || message.includes('network'))) {
    return; // Suppress
  }
  
  originalWarn.apply(console, args);
};

console.log('Service Worker: Loaded');
