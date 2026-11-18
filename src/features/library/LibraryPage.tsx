import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, LayoutGrid, List, ArrowDownUp, BookOpen, Sparkles } from 'lucide-react';
import type { BookRecord, LibraryFilter, LibrarySort } from '../../types/book';
import {
  fetchLibraryBooks,
  filterAndSortBooks,
  importEpubFile,
  removeBookFromLibrary,
} from './libraryService';
import { BookCard } from '../../components/BookCard';
import { ImportBookButton } from '../../components/ImportBookButton';
import { EmptyLibrary } from '../../components/EmptyLibrary';
import { DeleteBookModal } from '../../components/DeleteBookModal';
import { SkeletonGrid } from '../../components/SkeletonGrid';
import { ErrorBanner } from '../../components/ErrorBanner';
import './LibraryPage.css';

interface LibraryPageProps {
  onOpenBook: (book: BookRecord) => void;
  onBookCountChange?: (count: number) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onOpenBook,
  onBookCountChange,
}) => {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Deletion modal state
  const [bookToDelete, setBookToDelete] = useState<BookRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Drag and Drop state
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Load books from storage
  useEffect(() => {
    let isMounted = true;
    fetchLibraryBooks()
      .then((loaded) => {
        if (isMounted) {
          setBooks(loaded);
          onBookCountChange?.(loaded.length);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat daftar buku.';
          setErrorMessage(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onBookCountChange]);

  // Handle EPUB Import
  const handleImportFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      try {
        const newBook = await importEpubFile(file);
        setBooks((prev) => [newBook, ...prev]);
        onBookCountChange?.(books.length + 1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengimpor berkas EPUB.';
        setErrorMessage(msg);
      }
    },
    [books.length, onBookCountChange]
  );

  // Delete Book handling
  const handleRequestDelete = (book: BookRecord) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      await removeBookFromLibrary(bookToDelete.id);
      const updated = books.filter((b) => b.id !== bookToDelete.id);
      setBooks(updated);
      onBookCountChange?.(updated.length);
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus buku.';
      setErrorMessage(msg);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  // Filtered and Sorted list
  const filteredBooks = useMemo(() => {
    return filterAndSortBooks(books, searchQuery, filter, sort);
  }, [books, searchQuery, filter, sort]);

  // Drag and drop handlers on window
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only set to false if leaving window
      if (!e.relatedTarget) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const file = droppedFiles[0];
        await handleImportFile(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleImportFile]);

  return (
    <main className="library-page" data-testid="library-page">
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="library-dropzone-overlay">
          <div className="library-dropzone-content">
            <BookOpen size={48} className="dropzone-icon" />
            <h3>Lepaskan Berkas EPUB di Sini</h3>
            <p>Buku akan langsung ditambahkan ke perpustakaan lokal Anda.</p>
          </div>
        </div>
      )}

      <div className="library-container">
        {/* Error notification banner if any */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* Page Hero & Header */}
        <header className="library-hero">
          <div className="library-hero__text">
            <div className="library-hero__badge">
              <Sparkles size={13} />
              <span>Perpustakaan Pribadi</span>
            </div>
            <h2 className="library-hero__title">Koleksi Buku Anda</h2>
            <p className="library-hero__subtitle">
              Ruang bacaan digital yang tenang. Buka, baca, dan lanjutkan perjalanan literasi Anda tanpa gangguan.
            </p>
          </div>

          <div className="library-hero__actions">
            <ImportBookButton onFileSelect={handleImportFile} variant="primary" />
          </div>
        </header>

        {/* Search, Filter & Controls Bar */}
        <section className="library-controls" aria-label="Pencarian dan Penyaringan">
          <div className="library-controls__search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari judul buku, penulis, atau penerbit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari buku"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Hapus pencarian"
                aria-label="Hapus kata kunci pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="library-controls__filters">
            {/* Filter chips */}
            <div className="filter-chips" role="group" aria-label="Filter status bacaan">
              <button
                type="button"
                className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Semua ({books.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'reading' ? 'filter-chip--active' : ''}`}
                onClick={() => setFilter('reading')}
              >
                Sedang Dibaca
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'completed' ? 'filter-chip--active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Selesai
              </button>
            </div>

            <div className="library-controls__right">
              {/* Sort dropdown */}
              <div className="sort-dropdown">
                <ArrowDownUp size={14} className="sort-icon" />
                <select
                  className="sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as LibrarySort)}
                  aria-label="Urutkan buku"
                >
                  <option value="recent">Terakhir Dibaca</option>
                  <option value="title">Judul (A — Z)</option>
                  <option value="author">Penulis (A — Z)</option>
                  <option value="progress">Progres Terbanyak</option>
                </select>
              </div>

              {/* View toggle (Grid / List) */}
              <div className="view-toggle" role="group" aria-label="Mode tampilan">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Tampilan Grid"
                  aria-label="Ganti ke tampilan grid"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Tampilan Daftar"
                  aria-label="Ganti ke tampilan daftar"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section: Skeletons, Empty States, or Books */}
        <section className="library-content" aria-label="Daftar Buku">
          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : books.length === 0 ? (
            <EmptyLibrary onFileSelect={handleImportFile} />
          ) : filteredBooks.length === 0 ? (
            <EmptyLibrary
              isSearchEmpty
              searchQuery={searchQuery}
              onResetSearch={() => {
                setSearchQuery('');
                setFilter('all');
              }}
            />
          ) : (
            <div
              className={viewMode === 'grid' ? 'library-grid' : 'library-list'}
              data-testid="books-container"
            >
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onOpen={onOpenBook}
                  onRequestDelete={handleRequestDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteBookModal
        book={bookToDelete}
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
};
