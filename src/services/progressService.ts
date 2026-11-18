import type { ReadingProgress } from '../types/book';
import { createStorage } from './storage/storageFactory';

const storage = createStorage();

// In-memory debounce map for progress writes
const pendingProgress = new Map<string, ReadingProgress>();
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Debounced progress saver.
 * Prevents frequent disk/IDB writes when the reader rapidly clicks next/prev.
 * Follows AGENT.md: "Debounce frequent progress writes."
 */
export function saveProgressDebounced(
  progress: ReadingProgress,
  delayMs: number = 500
): Promise<void> {
  const { bookId } = progress;
  pendingProgress.set(bookId, progress);

  // Clear existing timer for this book
  if (debounceTimers.has(bookId)) {
    clearTimeout(debounceTimers.get(bookId));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      debounceTimers.delete(bookId);
      const toSave = pendingProgress.get(bookId);
      if (!toSave) {
        resolve();
        return;
      }

      try {
        await storage.saveProgress(toSave);
        pendingProgress.delete(bookId);
        resolve();
      } catch (error) {
        reject(error);
      }
    }, delayMs);

    debounceTimers.set(bookId, timer);
  });
}

/**
 * Immediately flushes any pending progress write for a given book (or all books).
 * Essential before reader unmounts.
 */
export async function flushProgress(bookId?: string): Promise<void> {
  if (bookId) {
    if (debounceTimers.has(bookId)) {
      clearTimeout(debounceTimers.get(bookId));
      debounceTimers.delete(bookId);
    }
    const toSave = pendingProgress.get(bookId);
    if (toSave) {
      pendingProgress.delete(bookId);
      await storage.saveProgress(toSave);
    }
  } else {
    // Flush all
    for (const [id, timer] of debounceTimers.entries()) {
      clearTimeout(timer);
      debounceTimers.delete(id);
    }
    const entries = Array.from(pendingProgress.entries());
    pendingProgress.clear();
    for (const [, prog] of entries) {
      await storage.saveProgress(prog);
    }
  }
}

/**
 * Load saved progress for a book.
 */
export async function loadProgress(bookId: string): Promise<ReadingProgress | undefined> {
  // Check pending in-memory first
  if (pendingProgress.has(bookId)) {
    return pendingProgress.get(bookId);
  }
  return storage.getProgress(bookId);
}
