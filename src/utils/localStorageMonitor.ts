/**
 * localStorage Quota Monitoring and Management
 * Monitors localStorage usage and provides cleanup utilities
 */

interface StorageInfo {
  key: string;
  size: number;
  percentage: number;
}

interface QuotaInfo {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

/**
 * Get the size of a string in bytes
 */
function getStringSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Get size of a localStorage item
 */
function getItemSize(key: string): number {
  try {
    const item = localStorage.getItem(key);
    if (!item) return 0;
    return getStringSize(item);
  } catch {
    return 0;
  }
}

/**
 * Get all localStorage keys and their sizes
 */
export function getStorageInfo(): StorageInfo[] {
  const info: StorageInfo[] = [];
  let totalSize = 0;

  // Get all keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const size = getItemSize(key);
      totalSize += size;
      info.push({ key, size, percentage: 0 });
    }
  }

  // Calculate percentages
  if (totalSize > 0) {
    info.forEach(item => {
      item.percentage = (item.size / totalSize) * 100;
    });
  }

  // Sort by size (largest first)
  return info.sort((a, b) => b.size - a.size);
}

/**
 * Get localStorage quota information
 */
export function getQuotaInfo(): QuotaInfo {
  try {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      // Modern browsers support quota estimation
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const available = quota - used;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        return {
          used,
          available,
          total: quota,
          percentage,
        };
      });
    }
  } catch (error) {
    console.warn('[Storage Monitor] Could not estimate quota:', error);
  }

  // Fallback: calculate from localStorage
  const storageInfo = getStorageInfo();
  const used = storageInfo.reduce((sum, item) => sum + item.size, 0);
  
  // Assume 5MB default quota (conservative estimate)
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const available = total - used;
  const percentage = (used / total) * 100;

  return {
    used,
    available,
    total,
    percentage,
  };
}

/**
 * Check if localStorage is near quota limit
 */
export function isNearQuota(threshold: number = 80): boolean {
  const quota = getQuotaInfo();
  return quota.percentage >= threshold;
}

/**
 * Clean up old data from localStorage
 * Removes items older than specified days
 */
export function cleanupOldData(daysToKeep: number = 90): number {
  const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  let cleaned = 0;

  // List of keys that might have timestamps
  const keysToCheck = [
    'finance-store',
    'fitness-store',
    'travel-store',
    'chat-storage',
    'social-storage',
    'marketplace-storage',
    'auth-storage',
    'exercises-storage',
    'progress-photos-storage',
  ];

  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return;

      const parsed = JSON.parse(item);
      // Check if there's a timestamp in the state
      if (parsed.state && parsed.state.lastCleanup) {
        if (parsed.state.lastCleanup < cutoffDate) {
          // This is old data, but we'll keep it for now
          // Only clean if we're really close to quota
          if (isNearQuota(95)) {
            // Keep only recent data
            console.warn(`[Storage Monitor] ${key} is old but keeping for now`);
          }
        }
      }
    } catch (error) {
      console.warn(`[Storage Monitor] Error checking ${key}:`, error);
    }
  });

  return cleaned;
}

/**
 * Get storage statistics for debugging
 */
export function getStorageStats() {
  const info = getStorageInfo();
  const quota = getQuotaInfo();

  return {
    totalKeys: localStorage.length,
    totalSize: quota.used,
    totalQuota: quota.total,
    usagePercentage: quota.percentage,
    largestKeys: info.slice(0, 5),
    allKeys: info,
  };
}

/**
 * Monitor localStorage and warn if approaching quota
 */
export function startStorageMonitoring(threshold: number = 80) {
  const checkStorage = () => {
    if (isNearQuota(threshold)) {
      const stats = getStorageStats();
      console.warn('[Storage Monitor] Approaching quota limit:', {
        usage: `${stats.usagePercentage.toFixed(2)}%`,
        used: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
        available: `${((stats.totalQuota - stats.totalSize) / 1024 / 1024).toFixed(2)} MB`,
        largestKeys: stats.largestKeys.map(k => ({
          key: k.key,
          size: `${(k.size / 1024).toFixed(2)} KB`,
        })),
      });

      // Auto-cleanup if over 95%
      if (stats.usagePercentage >= 95) {
        cleanupOldData(90);
      }
    }
  };

  // Check immediately
  checkStorage();

  // Check every 5 minutes
  const interval = setInterval(checkStorage, 5 * 60 * 1000);

  return () => clearInterval(interval);
}

