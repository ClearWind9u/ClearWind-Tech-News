import { STORAGE_KEYS } from './constants';

export function getSafeLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[Storage Warning] Failed to parse item for key "${key}":`, error);
    return defaultValue;
  }
}

export function setSafeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Storage Warning] Failed to save item for key "${key}":`, error);
  }
}

export function removeSafeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage Warning] Failed to remove item for key "${key}":`, error);
  }
}
