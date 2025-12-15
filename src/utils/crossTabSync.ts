/**
 * Cross-Tab Synchronization for localStorage
 * Syncs state changes across multiple browser tabs
 */

type StorageListener = (key: string, newValue: string | null, oldValue: string | null) => void;

class CrossTabSync {
  private listeners: Map<string, Set<StorageListener>> = new Map();
  private isInitialized = false;

  /**
   * Initialize cross-tab synchronization
   */
  init() {
    if (this.isInitialized) return;
    
    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    // Listen for custom storage events (for same-tab changes)
    window.addEventListener('localStorageChange', this.handleCustomStorageEvent.bind(this));
    
    this.isInitialized = true;
  }

  /**
   * Handle storage events from other tabs
   */
  private handleStorageEvent(event: StorageEvent) {
    if (event.key && event.newValue !== event.oldValue) {
      this.notifyListeners(event.key, event.newValue, event.oldValue);
    }
  }

  /**
   * Handle custom storage events (for same-tab changes)
   */
  private handleCustomStorageEvent(event: Event) {
    const customEvent = event as CustomEvent<{
      key: string;
      newValue: string | null;
      oldValue: string | null;
    }>;
    
    if (customEvent.detail) {
      this.notifyListeners(
        customEvent.detail.key,
        customEvent.detail.newValue,
        customEvent.detail.oldValue
      );
    }
  }

  /**
   * Notify all listeners for a key
   */
  private notifyListeners(key: string, newValue: string | null, oldValue: string | null) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(key, newValue, oldValue);
        } catch (error) {
          console.error(`[CrossTabSync] Error in listener for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to changes for a specific localStorage key
   */
  subscribe(key: string, listener: StorageListener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Broadcast a change to other tabs
   */
  broadcast(key: string, newValue: string | null, oldValue: string | null) {
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(
      new CustomEvent('localStorageChange', {
        detail: { key, newValue, oldValue },
      })
    );
  }

  /**
   * Cleanup
   */
  destroy() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    window.removeEventListener('localStorageChange', this.handleCustomStorageEvent.bind(this));
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const crossTabSync = new CrossTabSync();

/**
 * Enhanced localStorage.setItem with cross-tab sync
 */
export function setItemWithSync(key: string, value: string) {
  const oldValue = localStorage.getItem(key);
  localStorage.setItem(key, value);
  crossTabSync.broadcast(key, value, oldValue);
}

/**
 * Initialize cross-tab sync on app load
 */
export function initCrossTabSync() {
  crossTabSync.init();
}

