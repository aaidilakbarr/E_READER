import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Type,
  ChevronLeft,
  ChevronRight,
  ListTree,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { BookRecord, ReaderPreferences } from '../../types/book';
import { DEFAULT_PREFERENCES } from '../../services/storage/indexedDbStorage';
import { useEpub } from '../../hooks/useEpub';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EpubViewer } from './EpubViewer';
import { ReaderToc } from './ReaderToc';
import './ReaderPage.css';

interface ReaderPageProps {
  book: BookRecord;
  onBackToLibrary: () => void;
  onUpdateProgress?: (bookId: string, percentage: number, cfi: string) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  book,
  onBackToLibrary,
  onUpdateProgress,
}) => {
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [showSettings, setShowSettings] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookSource, setBookSource] = useState<Blob | string | undefined>(book.fileBlob);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // If book has no fileBlob (e.g. seeded sample book), fetch bundled sample.epub
  useEffect(() => {
    let isMounted = true;
    if (!book.fileBlob) {
      fetch('/sample.epub')
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (isMounted && blob) {
            setBookSource(blob);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [book.fileBlob]);

  const { savedCfi, isProgressLoaded, recordProgress } = useReadingProgress({
    bookId: book.id,
  });

  // Handle location update from epubjs
  const handleLocationChange = useCallback(
    (loc: { cfi: string; percentage: number }) => {
      recordProgress(loc.cfi, loc.percentage);
      onUpdateProgress?.(book.id, loc.percentage, loc.cfi);
    },
    [book.id, recordProgress, onUpdateProgress]
  );

  // Hook into epubjs engine
  const epub = useEpub({
    containerRef,
    bookFile: isProgressLoaded ? bookSource : undefined,
    initialCfi: savedCfi,
    preferences,
    onLocationChange: handleLocationChange,
  });

  // Handle Escape key to return to library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTocOpen) {
          setIsTocOpen(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else {
          onBackToLibrary();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTocOpen, showSettings, onBackToLibrary]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const increaseFontSize = () => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.min(28, prev.fontSize + 2),
    }));
  };

  const decreaseFontSize = () => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.max(14, prev.fontSize - 2),
    }));
  };

  const currentChapter =
    epub.toc.find((t) => t.href && epub.currentLocation?.cfi?.includes(t.href))?.label ||
    book.currentChapterTitle ||
    'Bagian Membaca';

  const progressPercentage = epub.currentLocation
    ? epub.currentLocation.percentage
    : book.progressPercentage || 0;

  return (
    <div className="reader-view" data-theme={preferences.theme} data-testid="reader-page">
      {/* Reader Top Toolbar */}
      <header className="reader-toolbar">
        <div className="reader-toolbar__left">
          <button
            type="button"
            className="reader-tool-btn"
            onClick={onBackToLibrary}
            title="Kembali ke Perpustakaan (Esc)"
            aria-label="Kembali ke Perpustakaan"
            data-testid="back-to-library"
          >
            <ArrowLeft size={18} />
            <span className="reader-tool-btn__text">Perpustakaan</span>
          </button>
        </div>

        <div className="reader-toolbar__center">
          <h2 className="reader-toolbar__title" title={epub.bookTitle || book.title}>
            {epub.bookTitle || book.title}
          </h2>
          <span className="reader-toolbar__subtitle">
            {epub.bookAuthor || book.authors.join(', ') || 'Nusa Reader'}
          </span>
        </div>

        <div className="reader-toolbar__right">
          <button
            type="button"
            className={`reader-tool-btn ${isTocOpen ? 'reader-tool-btn--active' : ''}`}
            onClick={() => setIsTocOpen(!isTocOpen)}
            title="Daftar Isi Buku"
            aria-label="Buka Daftar Isi"
            data-testid="toc-toggle-button"
          >
            <ListTree size={18} />
            <span className="reader-tool-btn__label">Daftar Isi</span>
          </button>

          <button
            type="button"
            className={`reader-tool-btn ${showSettings ? 'reader-tool-btn--active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Sesuaikan Tipografi & Tampilan"
            aria-label="Pengaturan Baca"
            data-testid="settings-toggle-button"
          >
            <Type size={18} />
          </button>

          <button
            type="button"
            className="reader-tool-btn reader-tool-btn--icon-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            aria-label="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Settings Flyout Panel */}
      {showSettings && (
        <div className="reader-settings-panel" role="region" aria-label="Pengaturan Tipografi">
          <div className="settings-row">
            <span className="settings-label">Ukuran Huruf</span>
            <div className="settings-stepper">
              <button
                type="button"
                className="stepper-btn"
                onClick={decreaseFontSize}
                disabled={preferences.fontSize <= 14}
                aria-label="Perkecil huruf"
              >
                A-
              </button>
              <span className="stepper-value">{preferences.fontSize}px</span>
              <button
                type="button"
                className="stepper-btn"
                onClick={increaseFontSize}
                disabled={preferences.fontSize >= 28}
                aria-label="Perbesar huruf"
              >
                A+
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">Jenis Huruf</span>
            <div className="settings-button-group">
              <button
                type="button"
                className={`group-choice ${preferences.fontFamily === 'serif' ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, fontFamily: 'serif' })}
              >
                Serif
              </button>
              <button
                type="button"
                className={`group-choice ${preferences.fontFamily === 'sans' ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, fontFamily: 'sans' })}
              >
                Sans
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">Lebar Tampilan</span>
            <div className="settings-button-group">
              <button
                type="button"
                className={`group-choice ${preferences.contentWidth === 580 ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, contentWidth: 580 })}
              >
                Ringkas
              </button>
              <button
                type="button"
                className={`group-choice ${preferences.contentWidth === 720 ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, contentWidth: 720 })}
              >
                Standar
              </button>
              <button
                type="button"
                className={`group-choice ${preferences.contentWidth === 880 ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, contentWidth: 880 })}
              >
                Lebar
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-label">Tema Membaca</span>
            <div className="settings-button-group">
              <button
                type="button"
                className={`group-choice ${preferences.theme === 'light' ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
              >
                Terang
              </button>
              <button
                type="button"
                className={`group-choice ${preferences.theme === 'sepia' ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'sepia' })}
              >
                Sepia
              </button>
              <button
                type="button"
                className={`group-choice ${preferences.theme === 'dark' ? 'group-choice--active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
              >
                Gelap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      <ReaderToc
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        toc={epub.toc}
        onSelectChapter={epub.goToLocation}
        bookTitle={epub.bookTitle || book.title}
      />

      {/* Reading Surface & Navigation Arrows */}
      <main className="reader-stage">
        {/* Previous page arrow */}
        <button
          type="button"
          className="reader-nav-arrow reader-nav-arrow--left"
          onClick={epub.prevPage}
          title="Halaman Sebelumnya (← atau PageUp)"
          aria-label="Halaman Sebelumnya"
          disabled={epub.currentLocation?.atStart}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Dedicated Reader Container with epub.js */}
        <EpubViewer
          epub={epub}
          containerRef={containerRef}
          maxWidth={preferences.contentWidth}
        />

        {/* Next page arrow */}
        <button
          type="button"
          className="reader-nav-arrow reader-nav-arrow--right"
          onClick={epub.nextPage}
          title="Halaman Berikutnya (→ atau Spasi atau PageDown)"
          aria-label="Halaman Berikutnya"
          disabled={epub.currentLocation?.atEnd}
        >
          <ChevronRight size={28} />
        </button>
      </main>

      {/* Reader Bottom Navigation Bar */}
      <footer className="reader-footer">
        <div className="reader-footer__progress">
          <div className="reader-footer__bar">
            <div
              className="reader-footer__fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="reader-footer__text">
            {progressPercentage}% selesai • {currentChapter}
          </span>
        </div>
      </footer>
    </div>
  );
};
