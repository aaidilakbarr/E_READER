import type { BookRecord, ReadingProgress, ReaderPreferences } from '../../types/book';
import type { BookStorage } from './storage.types';
import { INITIAL_MOCK_BOOKS } from '../mockBooks';

const DB_NAME = 'nusa_reader_db';
const DB_VERSION = 1;

export const STORES = {
  BOOKS: 'books',
  PROGRESS: 'progress',
  PREFERENCES: 'preferences',
} as const;

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.6,
  contentWidth: 680,
  spread: 'auto',
};

export interface StorageEstimateInfo {
  usageBytes: number;
  quotaBytes: number;
  percentageUsed: number;
}

class IndexedDbBookStorage implements BookStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.BOOKS)) {
          const bookStore = db.createObjectStore(STORES.BOOKS, { keyPath: 'id' });
          bookStore.createIndex('title', 'title', { unique: false });
          bookStore.createIndex('importedAt', 'importedAt', { unique: false });
          bookStore.createIndex('lastOpenedAt', 'lastOpenedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'bookId' });
          progressStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
          db.createObjectStore(STORES.PREFERENCES, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Gagal membuka basis data Nusa Reader.'));
      };
    });

    return this.dbPromise;
  }

  async listBooks(): Promise<BookRecord[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.BOOKS, 'readonly');
        const store = tx.objectStore(STORES.BOOKS);
        const request = store.getAll();

        request.onsuccess = () => {
          const books = request.result as BookRecord[];
          // If fresh database, seed with initial mock books
          if (books.length === 0) {
            this.seedMockBooks().then((seeded) => resolve(seeded)).catch(() => resolve([]));
            return;
          }
          resolve(books);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      // In-memory fallback
      return [...INITIAL_MOCK_BOOKS];
    }
  }

  private async seedMockBooks(): Promise<BookRecord[]> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.BOOKS, 'readwrite');
      const store = tx.objectStore(STORES.BOOKS);
      for (const book of INITIAL_MOCK_BOOKS) {
        store.put(book);
      }
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve([...INITIAL_MOCK_BOOKS]);
        tx.onerror = () => resolve([...INITIAL_MOCK_BOOKS]);
      });
    } catch {
      return [...INITIAL_MOCK_BOOKS];
    }
  }

  async getBook(id: string): Promise<BookRecord | undefined> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.BOOKS, 'readonly');
        const store = tx.objectStore(STORES.BOOKS);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result as BookRecord | undefined);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return INITIAL_MOCK_BOOKS.find((b) => b.id === id);
    }
  }

  async saveBook(book: BookRecord): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.BOOKS, 'readwrite');
      const store = tx.objectStore(STORES.BOOKS);
      const request = store.put(book);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        const err = request.error;
        if (err && err.name === 'QuotaExceededError') {
          reject(new Error('Kapasitas penyimpanan lokal peramban telah penuh.'));
        } else {
          reject(err || new Error('Gagal menyimpan berkas buku.'));
        }
      };
    });
  }

  async deleteBook(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.BOOKS, STORES.PROGRESS], 'readwrite');
      const bookStore = tx.objectStore(STORES.BOOKS);
      const progressStore = tx.objectStore(STORES.PROGRESS);

      bookStore.delete(id);
      progressStore.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProgress(bookId: string): Promise<ReadingProgress | undefined> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PROGRESS, 'readonly');
        const store = tx.objectStore(STORES.PROGRESS);
        const request = store.get(bookId);

        request.onsuccess = () => resolve(request.result as ReadingProgress | undefined);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return undefined;
    }
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.PROGRESS, STORES.BOOKS], 'readwrite');
      const progressStore = tx.objectStore(STORES.PROGRESS);
      const bookStore = tx.objectStore(STORES.BOOKS);

      // 1. Save progress record
      progressStore.put(progress);

      // 2. Sync to book record to keep library view up to date
      const bookReq = bookStore.get(progress.bookId);
      bookReq.onsuccess = () => {
        const book = bookReq.result as BookRecord | undefined;
        if (book) {
          book.progressPercentage = progress.percentage;
          book.lastOpenedAt = progress.updatedAt;
          bookStore.put(book);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        const err = tx.error;
        if (err && err.name === 'QuotaExceededError') {
          reject(new Error('Kapasitas penyimpanan lokal peramban telah penuh.'));
        } else {
          reject(err || new Error('Gagal menyimpan posisi progres baca.'));
        }
      };
    });
  }

  async getPreferences(): Promise<ReaderPreferences> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.PREFERENCES, 'readonly');
        const store = tx.objectStore(STORES.PREFERENCES);
        const request = store.get('user_preferences');

        request.onsuccess = () => {
          if (request.result && request.result.preferences) {
            resolve({ ...DEFAULT_PREFERENCES, ...request.result.preferences });
          } else {
            resolve(DEFAULT_PREFERENCES);
          }
        };
        request.onerror = () => resolve(DEFAULT_PREFERENCES);
      });
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  async savePreferences(prefs: Partial<ReaderPreferences>): Promise<void> {
    try {
      const db = await this.getDb();
      const current = await this.getPreferences();
      const updated = { ...current, ...prefs };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PREFERENCES, 'readwrite');
        const store = tx.objectStore(STORES.PREFERENCES);
        const request = store.put({ id: 'user_preferences', preferences: updated });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Safe check for local storage quota usage.
   */
  async getStorageEstimate(): Promise<StorageEstimateInfo | null> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 1;
        return {
          usageBytes: usage,
          quotaBytes: quota,
          percentageUsed: Math.round((usage / quota) * 100),
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Singleton storage instance
let storageInstance: BookStorage | null = null;

export function getBookStorage(): BookStorage {
  if (!storageInstance) {
    storageInstance = new IndexedDbBookStorage();
  }
  return storageInstance;
}
