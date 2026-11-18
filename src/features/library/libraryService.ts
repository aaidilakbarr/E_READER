import type { BookRecord, LibraryFilter, LibrarySort } from '../../types/book';
import { createStorage } from '../../services/storage/storageFactory';
import { validateEpubFile, extractEpubMetadata } from '../../services/epubService';

const storage = createStorage();

export async function fetchLibraryBooks(): Promise<BookRecord[]> {
  return storage.listBooks();
}

export function filterAndSortBooks(
  books: BookRecord[],
  searchQuery: string,
  filter: LibraryFilter,
  sort: LibrarySort
): BookRecord[] {
  let result = [...books];

  // 1. Text search by title or author
  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((book) => {
      const matchTitle = book.title.toLowerCase().includes(query);
      const matchAuthor = book.authors.some((author) => author.toLowerCase().includes(query));
      const matchPublisher = book.publisher?.toLowerCase().includes(query);
      return matchTitle || matchAuthor || matchPublisher;
    });
  }

  // 2. Filter by status
  if (filter === 'reading') {
    result = result.filter(
      (book) => (book.progressPercentage || 0) > 0 && (book.progressPercentage || 0) < 100
    );
  } else if (filter === 'completed') {
    result = result.filter((book) => (book.progressPercentage || 0) >= 100);
  }

  // 3. Sort
  result.sort((a, b) => {
    switch (sort) {
      case 'recent': {
        const timeA = a.lastOpenedAt || a.importedAt;
        const timeB = b.lastOpenedAt || b.importedAt;
        return timeB - timeA;
      }
      case 'title':
        return a.title.localeCompare(b.title, 'id');
      case 'author': {
        const authorA = a.authors[0] || '';
        const authorB = b.authors[0] || '';
        return authorA.localeCompare(authorB, 'id');
      }
      case 'progress':
        return (b.progressPercentage || 0) - (a.progressPercentage || 0);
      default:
        return 0;
    }
  });

  return result;
}

/**
 * Imports an EPUB file into the library with metadata extraction.
 */
export async function importEpubFile(file: File): Promise<BookRecord> {
  const validation = validateEpubFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Berkas EPUB tidak valid.');
  }

  const existingBooks = await storage.listBooks();

  // Extract metadata (title, author, publisher, cover) using epubjs
  const extracted = await extractEpubMetadata(file);
  const fallbackTitle = file.name.replace(/\.epub$/i, '').replace(/[-_]/g, ' ');
  const finalTitle = extracted.title || fallbackTitle;

  // Check duplicate rule (case-insensitive title match)
  const isDuplicate = existingBooks.some(
    (b) => b.title.trim().toLowerCase() === finalTitle.trim().toLowerCase()
  );

  if (isDuplicate) {
    throw new Error(`Buku "${finalTitle}" sudah ada di perpustakaan Anda.`);
  }

  // Clone file bytes into an independent Blob so IndexedDB doesn't rely on a mutable OS File handle
  const fileBytes = await file.arrayBuffer();
  const storedBlob = new Blob([fileBytes], {
    type: file.type || 'application/epub+zip',
  });

  const newBook: BookRecord = {
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: finalTitle,
    authors: extracted.authors,
    publisher: extracted.publisher,
    language: extracted.language,
    identifier: extracted.identifier,
    coverUrl: extracted.coverUrl,
    fileBlob: storedBlob,
    fileSize: file.size,
    importedAt: Date.now(),
    lastOpenedAt: undefined,
    progressPercentage: 0,
    totalChapters: 0,
  };

  await storage.saveBook(newBook);
  return newBook;
}

export async function removeBookFromLibrary(id: string): Promise<void> {
  await storage.deleteBook(id);
}
