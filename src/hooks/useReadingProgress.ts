import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReadingProgress } from '../types/book';
import { loadProgress, saveProgressDebounced, flushProgress } from '../services/progressService';

interface UseReadingProgressProps {
  bookId: string;
}

export function useReadingProgress({ bookId }: UseReadingProgressProps) {
  const [savedCfi, setSavedCfi] = useState<string | undefined>(undefined);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);
  const bookIdRef = useRef(bookId);
  useEffect(() => {
    bookIdRef.current = bookId;
  }, [bookId]);

  // Load initial progress on mount
  useEffect(() => {
    let isMounted = true;
    loadProgress(bookId).then((progress) => {
      if (isMounted) {
        if (progress?.cfi) {
          setSavedCfi(progress.cfi);
        }
        setIsProgressLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      // Flush any pending write before switching books or unmounting
      flushProgress(bookIdRef.current);
    };
  }, [bookId]);

  // Debounced update
  const recordProgress = useCallback(
    (cfi: string, percentage: number) => {
      const record: ReadingProgress = {
        bookId: bookIdRef.current,
        cfi,
        percentage,
        updatedAt: Date.now(),
      };
      saveProgressDebounced(record, 600);
    },
    []
  );

  return {
    savedCfi,
    isProgressLoaded,
    recordProgress,
  };
}
