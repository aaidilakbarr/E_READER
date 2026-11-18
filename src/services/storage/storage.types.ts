import type { BookRecord, ReadingProgress, ReaderPreferences } from '../../types/book';

/**
 * Interface contract for platform-independent storage.
 * In Milestone 1-3 this maps to IndexedDB on Web.
 * Later on desktop, it maps to Tauri storage adapter.
 */
export interface BookStorage {
  listBooks(): Promise<BookRecord[]>;
  getBook(id: string): Promise<BookRecord | undefined>;
  saveBook(book: BookRecord): Promise<void>;
  deleteBook(id: string): Promise<void>;
  getProgress(bookId: string): Promise<ReadingProgress | undefined>;
  saveProgress(progress: ReadingProgress): Promise<void>;
  getPreferences(): Promise<ReaderPreferences>;
  savePreferences(prefs: Partial<ReaderPreferences>): Promise<void>;
}
