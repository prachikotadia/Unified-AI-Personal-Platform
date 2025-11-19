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
        console.error('Service Worker: Error caching static files', error);
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

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
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
            .catch((error) => {
              console.error('Service Worker: Cache storage failed', error);
            });
        }
        return response;
      })
      .catch((error) => {
        console.error('Service Worker: Network request failed', error);
        // Fallback to cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response, let the browser handle it
            throw error;
          })
          .catch(() => {
            // If everything fails, let the browser handle the error
            throw error;
          });
      })
  );
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // For AI insights, always try network first
    if (request.url.includes('/ai-insights/')) {
      const networkResponse = await fetch(request);
      return networkResponse;
    }
    
    // Try cache first for other API requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
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
    console.error('Service Worker: API request failed', error);
    
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
  // Skip chrome-extension URLs
  if (request.url.startsWith('chrome-extension://')) {
    return fetch(request);
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
    console.error('Service Worker: Static asset fetch failed', error);
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
    console.error('Service Worker: Navigation request failed', error);
    
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
        console.error('Service Worker: Background sync failed for', data.url, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error', error);
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

console.log('Service Worker: Loaded');
