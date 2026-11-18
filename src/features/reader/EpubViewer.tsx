import React, { useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { UseEpubReturn } from './reader.types';
import './EpubViewer.css';

interface EpubViewerProps {
  epub: UseEpubReturn;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRetry?: () => void;
  maxWidth?: number;
}

export const EpubViewer: React.FC<EpubViewerProps> = ({
  epub,
  containerRef,
  onRetry,
  maxWidth = 720,
}) => {
  const { isBookReady, isLoading, errorMessage, nextPage, prevPage } = epub;
  const keyboardWrapperRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation hotkeys (Left/Right arrow, PageUp/PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPage, prevPage]);

  return (
    <div
      ref={keyboardWrapperRef}
      className="epub-viewer-wrapper"
      data-testid="epub-viewer"
    >
      {/* Loading State Overlay */}
      {isLoading && (
        <div className="epub-viewer__loading" aria-live="polite">
          <Loader2 size={32} className="epub-viewer__spinner" />
          <p className="epub-viewer__loading-text">Mempersiapkan buku digital...</p>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="epub-viewer__error" role="alert">
          <AlertCircle size={36} className="epub-viewer__error-icon" />
          <h3>Tidak Dapat Membuka Berkas EPUB</h3>
          <p>{errorMessage}</p>
          {onRetry && (
            <button
              type="button"
              className="epub-viewer__retry-btn"
              onClick={onRetry}
            >
              <RefreshCw size={14} /> Coba Muat Ulang
            </button>
          )}
        </div>
      )}

      {/* Dedicated EPUB Rendering Container */}
      <div
        id="epub-reader-mount"
        ref={containerRef}
        className={`epub-viewer__stage ${isBookReady ? 'epub-viewer__stage--ready' : ''}`}
        style={{ maxWidth: `${maxWidth}px` }}
      />
    </div>
  );
};
