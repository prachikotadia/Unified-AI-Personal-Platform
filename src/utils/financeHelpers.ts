import { useAuthStore } from '../store/auth';

/**
 * Check if the current user is in guest mode
 */
export const isGuestMode = (): boolean => {
  const { user } = useAuthStore.getState();
  return user?.preferences?.isGuest === true || user?.id?.startsWith('guest_') === true;
};

/**
 * Generate a unique ID for local-only items
 */
export const generateLocalId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Merge arrays by ID, keeping the most recent version
 */
export const mergeArraysById = <T extends { id: string }>(
  local: T[],
  remote: T[]
): T[] => {
  const merged = new Map<string, T>();
  
  // Add all local items
  local.forEach(item => merged.set(item.id, item));
  
  // Add/update with remote items (remote takes precedence if same ID)
  remote.forEach(item => merged.set(item.id, item));
  
  return Array.from(merged.values());
};

