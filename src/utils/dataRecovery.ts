/**
 * Data Recovery Utilities
 * Enhanced handling for corrupted localStorage data
 */

interface RecoveryOptions {
  backupBeforeRecovery?: boolean;
  attemptRepair?: boolean;
  fallbackToDefaults?: boolean;
}

/**
 * Attempt to repair corrupted JSON data
 */
export function attemptDataRepair(corruptedData: string): any | null {
  try {
    // Try to fix common JSON issues
    let repaired = corruptedData
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Quote unquoted keys
    
    return JSON.parse(repaired);
  } catch {
    return null;
  }
}

/**
 * Create a backup of localStorage data
 */
export function createBackup(key: string): string | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const backupKey = `${key}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, data);
    
    // Keep only last 3 backups
    const backupKeys = Object.keys(localStorage)
      .filter(k => k.startsWith(`${key}_backup_`))
      .sort()
      .reverse();
    
    if (backupKeys.length > 3) {
      backupKeys.slice(3).forEach(k => localStorage.removeItem(k));
    }
    
    return backupKey;
  } catch (error) {
    console.error(`[Data Recovery] Failed to create backup for ${key}:`, error);
    return null;
  }
}

/**
 * Recover corrupted localStorage data
 */
export function recoverCorruptedData(
  key: string,
  options: RecoveryOptions = {}
): { success: boolean; recovered: any | null; backupKey?: string } {
  const {
    backupBeforeRecovery = true,
    attemptRepair = true,
    fallbackToDefaults = true,
  } = options;

  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      return { success: false, recovered: null };
    }

    // Try to parse normally first
    try {
      const parsed = JSON.parse(rawData);
      return { success: true, recovered: parsed };
    } catch (parseError) {
      // Data is corrupted
      console.warn(`[Data Recovery] Corrupted data detected for ${key}, attempting recovery...`);

      // Create backup if requested
      let backupKey: string | undefined;
      if (backupBeforeRecovery) {
        backupKey = createBackup(key) || undefined;
      }

      // Attempt repair
      if (attemptRepair) {
        const repaired = attemptDataRepair(rawData);
        if (repaired) {
          // Save repaired data
          try {
            localStorage.setItem(key, JSON.stringify(repaired));
            console.log(`[Data Recovery] Successfully repaired data for ${key}`);
            return { success: true, recovered: repaired, backupKey };
          } catch (saveError) {
            console.error(`[Data Recovery] Failed to save repaired data for ${key}:`, saveError);
          }
        }
      }

      // If repair failed and fallback is enabled, return null (store will use defaults)
      if (fallbackToDefaults) {
        console.warn(`[Data Recovery] Using default data for ${key}`);
        // Remove corrupted data
        localStorage.removeItem(key);
        return { success: false, recovered: null, backupKey };
      }

      return { success: false, recovered: null, backupKey };
    }
  } catch (error) {
    console.error(`[Data Recovery] Error during recovery for ${key}:`, error);
    return { success: false, recovered: null };
  }
}

/**
 * Validate data structure
 */
export function validateDataStructure(data: any, expectedStructure: {
  requiredFields?: string[];
  expectedTypes?: Record<string, string>;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] };
  }

  // Check required fields
  if (expectedStructure.requiredFields) {
    expectedStructure.requiredFields.forEach(field => {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }

  // Check types
  if (expectedStructure.expectedTypes) {
    Object.entries(expectedStructure.expectedTypes).forEach(([field, expectedType]) => {
      if (field in data) {
        const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
        if (actualType !== expectedType) {
          errors.push(`Field ${field} has wrong type: expected ${expectedType}, got ${actualType}`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Enhanced getItem with recovery
 */
export function getItemWithRecovery(
  key: string,
  options: RecoveryOptions = {}
): any | null {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) return null;

    try {
      return JSON.parse(rawData);
    } catch (parseError) {
      // Data is corrupted, attempt recovery
      const recovery = recoverCorruptedData(key, options);
      return recovery.recovered;
    }
  } catch (error) {
    console.error(`[Data Recovery] Error getting item ${key}:`, error);
    return null;
  }
}

