import React, { useEffect, useState } from 'react';
import { useToastHelpers } from './Toast';

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAServiceWorker: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { info, success, warning } = useToastHelpers();

  useEffect(() => {
    // Register service worker
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Silently register - don't log to console
          setRegistration(reg);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && typeof navigator !== 'undefined' && navigator.serviceWorker.controller) {
                  info('App Update Available', 'A new version is available. Refresh to update.');
                }
              });
            }
          });
        })
        .catch((error) => {
          // Silently handle registration failures
        });
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      success('Connection Restored', 'You are back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      warning('Connection Lost', 'You are currently offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPromptEvent);
      info('Install OmniLife', 'Install OmniLife for a better experience!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      success('App Installed', 'OmniLife has been installed successfully!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [info, success, warning]);

  // Handle install prompt
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        success('Installation Started', 'OmniLife is being installed...');
      } else {
        info('Installation Cancelled', 'You can install OmniLife later from your browser menu.');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      warning('Installation Failed', 'Unable to install the app. Please try again.');
    }
  };

  // Handle service worker update
  const handleUpdateClick = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      warning('Notifications Not Supported', 'Your browser does not support notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      success('Notifications Enabled', 'You will receive notifications from OmniLife.');
      return;
    }

    if (Notification.permission === 'denied') {
      warning('Notifications Blocked', 'Please enable notifications in your browser settings.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        success('Notifications Enabled', 'You will receive notifications from OmniLife.');
      } else {
        info('Notifications Disabled', 'You can enable notifications later in settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      warning('Permission Error', 'Unable to request notification permission.');
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!registration) {
      warning('Service Worker Not Ready', 'Please wait for the service worker to load.');
      return;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });

      console.log('Push notification subscription:', subscription);
      success('Push Notifications Enabled', 'You will receive push notifications.');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      warning('Subscription Failed', 'Unable to subscribe to push notifications.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {/* Install Prompt */}
      {installPrompt && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>Install App</span>
        </button>
      )}

      {/* Update Available */}
      {registration && registration.waiting && (
        <button
          onClick={handleUpdateClick}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>Update Available</span>
        </button>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Offline</span>
        </div>
      )}

      {/* Notification Permission */}
      {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>Enable Notifications</span>
        </button>
      )}
    </div>
  );
};

// PWA utilities
export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isInstalled,
    isPWA: isInstalled || window.matchMedia('(display-mode: standalone)').matches,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  };
};

// PWA installation hook
export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      setInstallPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    install
  };
};

export default PWAServiceWorker;
