/**
 * Nusa Reader — Core Types and Data Models
 * Follows contracts defined in TECHSTACK.md and PRD.md
 */

export interface BookRecord {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  language?: string;
  identifier?: string;
  coverBlob?: Blob;
  coverUrl?: string; // Cacheable or object URL for display
  fileBlob?: Blob; // EPUB binary data
  fileSize?: number; // Bytes
  importedAt: number; // Unix timestamp ms
  lastOpenedAt?: number; // Unix timestamp ms
  progressPercentage?: number; // 0 to 100
  totalChapters?: number;
  currentChapterTitle?: string;
}

export interface ReadingProgress {
  bookId: string;
  cfi: string; // Canonical Fragment Identifier from epub.js
  percentage: number; // 0 - 100
  chapterTitle?: string;
  chapterIndex?: number;
  updatedAt: number;
}

export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderPreferences {
  theme: ReaderTheme;
  fontFamily: 'serif' | 'sans' | 'literary';
  fontSize: number; // 14 to 28 px
  lineHeight: number; // 1.3 to 2.2
  contentWidth: number; // 540 to 920 px
  spread: 'auto' | 'single' | 'double';
}

export type ActiveView = 'library' | 'reader' | 'settings';

export type LibraryFilter = 'all' | 'reading' | 'completed';

export type LibrarySort = 'recent' | 'title' | 'author' | 'progress';
