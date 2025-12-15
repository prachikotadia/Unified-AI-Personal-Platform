/**
 * Persistence Validator Utility
 * 
 * Validates that all required localStorage keys exist and contain valid data.
 * This utility helps ensure data persistence across all modules.
 */

export interface PersistenceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_STORAGE_KEYS = {
  FINANCE: 'finance-store',
  FITNESS: 'fitness-store',
  PROGRESS_PHOTOS: 'progress-photos-storage',
  EXERCISES: 'exercises-storage',
  TRAVEL: 'travel-store',
  CHAT: 'chat-storage',
  SOCIAL: 'social-storage',
  MARKETPLACE: 'marketplace-storage',
  AUTH: 'auth-storage',
} as const;

/**
 * Validates that a localStorage key exists and contains valid JSON
 */
function validateStorageKey(key: string): { exists: boolean; isValid: boolean; error?: string } {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return { exists: false, isValid: false, error: `Key ${key} does not exist in localStorage` };
    }

    const parsed = JSON.parse(item);
    if (!parsed || typeof parsed !== 'object') {
      return { exists: true, isValid: false, error: `Key ${key} contains invalid data structure` };
    }

    if (!parsed.state) {
      return { exists: true, isValid: false, error: `Key ${key} missing 'state' property` };
    }

    return { exists: true, isValid: true };
  } catch (error) {
    return {
      exists: true,
      isValid: false,
      error: `Failed to parse ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validates finance store structure
 */
function validateFinanceStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Finance store missing state property');
    return errors;
  }

  const requiredArrays = [
    'bankAccounts',
    'transactions',
    'budgets',
    'financialGoals',
    'debtTrackers',
    'investments',
    'forecasts',
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(state[key])) {
      errors.push(`Finance store: ${key} is not an array`);
    }
  }

  return errors;
}

/**
 * Validates fitness store structure
 */
function validateFitnessStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Fitness store missing state property');
    return errors;
  }

  const requiredArrays = [
    'workoutPlans',
    'workoutSessions',
    'nutritionEntries',
    'healthMetrics',
    'healthGoals',
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(state[key])) {
      errors.push(`Fitness store: ${key} is not an array`);
    }
  }

  return errors;
}

/**
 * Validates progress photos store structure
 */
function validateProgressPhotosStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Progress photos store missing state property');
    return errors;
  }

  if (!Array.isArray(state.photos)) {
    errors.push('Progress photos store: photos is not an array');
  }

  return errors;
}

/**
 * Validates exercises store structure
 */
function validateExercisesStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Exercises store missing state property');
    return errors;
  }

  if (!Array.isArray(state.exercises)) {
    errors.push('Exercises store: exercises is not an array');
  }

  if (!Array.isArray(state.recentExercises)) {
    errors.push('Exercises store: recentExercises is not an array');
  }

  return errors;
}

/**
 * Validates all required localStorage keys and their structures
 */
export function validateAllPersistence(): PersistenceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate finance store
  const financeValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.FINANCE);
  if (!financeValidation.exists) {
    warnings.push(`Finance store not found (this is normal on first load)`);
  } else if (!financeValidation.isValid) {
    errors.push(`Finance store: ${financeValidation.error}`);
  } else {
    try {
      const financeData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.FINANCE)!);
      const financeErrors = validateFinanceStore(financeData);
      errors.push(...financeErrors);
    } catch (error) {
      errors.push(`Failed to validate finance store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate fitness store
  const fitnessValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.FITNESS);
  if (!fitnessValidation.exists) {
    warnings.push(`Fitness store not found (this is normal on first load)`);
  } else if (!fitnessValidation.isValid) {
    errors.push(`Fitness store: ${fitnessValidation.error}`);
  } else {
    try {
      const fitnessData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.FITNESS)!);
      const fitnessErrors = validateFitnessStore(fitnessData);
      errors.push(...fitnessErrors);
    } catch (error) {
      errors.push(`Failed to validate fitness store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate progress photos store
  const progressValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.PROGRESS_PHOTOS);
  if (!progressValidation.exists) {
    warnings.push(`Progress photos store not found (this is normal on first load)`);
  } else if (!progressValidation.isValid) {
    errors.push(`Progress photos store: ${progressValidation.error}`);
  } else {
    try {
      const progressData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.PROGRESS_PHOTOS)!);
      const progressErrors = validateProgressPhotosStore(progressData);
      errors.push(...progressErrors);
    } catch (error) {
      errors.push(`Failed to validate progress photos store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate exercises store
  const exercisesValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.EXERCISES);
  if (!exercisesValidation.exists) {
    warnings.push(`Exercises store not found (this is normal on first load)`);
  } else if (!exercisesValidation.isValid) {
    errors.push(`Exercises store: ${exercisesValidation.error}`);
  } else {
    try {
      const exercisesData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.EXERCISES)!);
      const exercisesErrors = validateExercisesStore(exercisesData);
      errors.push(...exercisesErrors);
    } catch (error) {
      errors.push(`Failed to validate exercises store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate travel store
  const travelValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.TRAVEL);
  if (!travelValidation.exists) {
    warnings.push(`Travel store not found (this is normal on first load)`);
  } else if (!travelValidation.isValid) {
    errors.push(`Travel store: ${travelValidation.error}`);
  } else {
    try {
      const travelData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.TRAVEL)!);
      const travelErrors = validateTravelStore(travelData);
      errors.push(...travelErrors);
    } catch (error) {
      errors.push(`Failed to validate travel store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate chat store
  const chatValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.CHAT);
  if (!chatValidation.exists) {
    warnings.push(`Chat store not found (this is normal on first load)`);
  } else if (!chatValidation.isValid) {
    errors.push(`Chat store: ${chatValidation.error}`);
  } else {
    try {
      const chatData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.CHAT)!);
      const chatErrors = validateChatStore(chatData);
      errors.push(...chatErrors);
    } catch (error) {
      errors.push(`Failed to validate chat store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate social store
  const socialValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.SOCIAL);
  if (!socialValidation.exists) {
    warnings.push(`Social store not found (this is normal on first load)`);
  } else if (!socialValidation.isValid) {
    errors.push(`Social store: ${socialValidation.error}`);
  } else {
    try {
      const socialData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.SOCIAL)!);
      // Social store uses Sets, so we just check if state exists
      if (!socialData.state) {
        errors.push('Social store: missing state property');
      }
    } catch (error) {
      errors.push(`Failed to validate social store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate marketplace store
  const marketplaceValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.MARKETPLACE);
  if (!marketplaceValidation.exists) {
    warnings.push(`Marketplace store not found (this is normal on first load)`);
  } else if (!marketplaceValidation.isValid) {
    errors.push(`Marketplace store: ${marketplaceValidation.error}`);
  } else {
    try {
      const marketplaceData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.MARKETPLACE)!);
      const marketplaceErrors = validateMarketplaceStore(marketplaceData);
      errors.push(...marketplaceErrors);
    } catch (error) {
      errors.push(`Failed to validate marketplace store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate auth store
  const authValidation = validateStorageKey(REQUIRED_STORAGE_KEYS.AUTH);
  if (!authValidation.exists) {
    warnings.push(`Auth store not found (this is normal on first load)`);
  } else if (!authValidation.isValid) {
    errors.push(`Auth store: ${authValidation.error}`);
  } else {
    try {
      const authData = JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.AUTH)!);
      const authErrors = validateAuthStore(authData);
      errors.push(...authErrors);
    } catch (error) {
      errors.push(`Failed to validate auth store structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs persistence validation results to console (dev mode only)
 */
export function logPersistenceValidation() {
  if (import.meta.env.DEV) {
    const result = validateAllPersistence();
    
    if (result.isValid) {
      console.log('✅ [Persistence] All stores validated successfully');
      if (result.warnings.length > 0) {
        console.warn('⚠️ [Persistence] Warnings:', result.warnings);
      }
    } else {
      console.error('❌ [Persistence] Validation errors:', result.errors);
      if (result.warnings.length > 0) {
        console.warn('⚠️ [Persistence] Warnings:', result.warnings);
      }
    }
  }
}

/**
 * Validates travel store structure
 */
function validateTravelStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Travel store missing state property');
    return errors;
  }

  if (!Array.isArray(state.trips)) {
    errors.push('Travel store: trips is not an array');
  }

  if (!Array.isArray(state.priceAlerts)) {
    errors.push('Travel store: priceAlerts is not an array');
  }

  return errors;
}

/**
 * Validates chat store structure
 */
function validateChatStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Chat store missing state property');
    return errors;
  }

  if (!Array.isArray(state.rooms)) {
    errors.push('Chat store: rooms is not an array');
  }

  if (!state.messages || typeof state.messages !== 'object') {
    errors.push('Chat store: messages is not an object');
  }

  return errors;
}

/**
 * Validates marketplace store structure
 */
function validateMarketplaceStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Marketplace store missing state property');
    return errors;
  }

  const requiredArrays = ['cart', 'wishlist', 'compareList'];

  for (const key of requiredArrays) {
    if (!Array.isArray(state[key])) {
      errors.push(`Marketplace store: ${key} is not an array`);
    }
  }

  return errors;
}

/**
 * Validates auth store structure
 */
function validateAuthStore(data: any): string[] {
  const errors: string[] = [];
  const state = data?.state;

  if (!state) {
    errors.push('Auth store missing state property');
    return errors;
  }

  if (state.user && typeof state.user !== 'object') {
    errors.push('Auth store: user is not an object');
  }

  return errors;
}

/**
 * Gets the current state of all stores from localStorage (for debugging)
 */
export function getPersistenceState() {
  return {
    finance: localStorage.getItem(REQUIRED_STORAGE_KEYS.FINANCE) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.FINANCE)!) : null,
    fitness: localStorage.getItem(REQUIRED_STORAGE_KEYS.FITNESS) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.FITNESS)!) : null,
    progressPhotos: localStorage.getItem(REQUIRED_STORAGE_KEYS.PROGRESS_PHOTOS) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.PROGRESS_PHOTOS)!) : null,
    exercises: localStorage.getItem(REQUIRED_STORAGE_KEYS.EXERCISES) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.EXERCISES)!) : null,
    travel: localStorage.getItem(REQUIRED_STORAGE_KEYS.TRAVEL) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.TRAVEL)!) : null,
    chat: localStorage.getItem(REQUIRED_STORAGE_KEYS.CHAT) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.CHAT)!) : null,
    social: localStorage.getItem(REQUIRED_STORAGE_KEYS.SOCIAL) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.SOCIAL)!) : null,
    marketplace: localStorage.getItem(REQUIRED_STORAGE_KEYS.MARKETPLACE) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.MARKETPLACE)!) : null,
    auth: localStorage.getItem(REQUIRED_STORAGE_KEYS.AUTH) ? JSON.parse(localStorage.getItem(REQUIRED_STORAGE_KEYS.AUTH)!) : null,
  };
}

