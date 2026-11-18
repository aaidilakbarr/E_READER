import { getBookStorage } from './indexedDbStorage';
import type { BookStorage } from './storage.types';

/**
 * Storage factory allowing seamless swap between IndexedDB (web)
 * and Tauri native filesystem adapter (desktop) later.
 */
export function createStorage(): BookStorage {
  return getBookStorage();
}
