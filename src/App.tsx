import React, { useState, useEffect } from 'react';
import type { ActiveView, BookRecord, ReaderTheme } from './types/book';
import { AppHeader } from './components/AppHeader';
import { LibraryPage } from './features/library/LibraryPage';
import { ReaderPage } from './features/reader/ReaderPage';
import { getBookStorage } from './services/storage/indexedDbStorage';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('library');
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [bookCount, setBookCount] = useState<number>(0);

  // Initialize theme from storage/system
  useEffect(() => {
    const initTheme = async () => {
      try {
        const storage = getBookStorage();
        const prefs = await storage.getPreferences();
        if (prefs && prefs.theme) {
          setTheme(prefs.theme);
        }
      } catch {
        // Fallback default light theme
      }
    };
    initTheme();
  }, []);

  // Update HTML data-theme attribute whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = async (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    try {
      const storage = getBookStorage();
      await storage.savePreferences({ theme: newTheme });
    } catch {
      // Ignored
    }
  };

  const handleOpenBook = (book: BookRecord) => {
    setSelectedBook(book);
    setActiveView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setActiveView('library');
    setSelectedBook(null);
  };

  const handleUpdateProgress = async (bookId: string, percentage: number, cfi: string) => {
    try {
      const storage = getBookStorage();
      await storage.saveProgress({
        bookId,
        cfi,
        percentage,
        updatedAt: Date.now(),
      });
      setSelectedBook((prev) =>
        prev && prev.id === bookId
          ? { ...prev, progressPercentage: percentage, lastOpenedAt: Date.now() }
          : prev
      );
    } catch {
      // Ignored
    }
  };

  return (
    <div className="nusa-app" data-theme={theme}>
      {activeView === 'library' ? (
        <>
          <AppHeader
            activeView={activeView}
            onNavigate={(view) => setActiveView(view)}
            theme={theme}
            onThemeChange={handleThemeChange}
            bookCount={bookCount}
          />
          <LibraryPage
            onOpenBook={handleOpenBook}
            onBookCountChange={setBookCount}
          />
        </>
      ) : (
        selectedBook && (
          <ReaderPage
            book={selectedBook}
            onBackToLibrary={handleBackToLibrary}
            onUpdateProgress={handleUpdateProgress}
          />
        )
      )}
    </div>
  );
};

export default App;
