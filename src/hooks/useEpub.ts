import { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import type { Book, Rendition } from 'epubjs';
import type { ReaderPreferences } from '../types/book';
import type { LocationInfo, TocItem, UseEpubOptions, UseEpubReturn } from '../features/reader/reader.types';

const THEME_STYLES = {
  light: {
    body: {
      background: '#FBF9F5 !important',
      color: '#22211F !important',
      padding: '0 24px !important',
    },
    'p, span, div, li, h1, h2, h3, h4, h5, h6': {
      color: '#22211F !important',
    },
    a: {
      color: '#4A6953 !important',
      'text-decoration': 'underline !important',
    },
  },
  sepia: {
    body: {
      background: '#F4ECE1 !important',
      color: '#342C23 !important',
      padding: '0 24px !important',
    },
    'p, span, div, li, h1, h2, h3, h4, h5, h6': {
      color: '#342C23 !important',
    },
    a: {
      color: '#5A6D52 !important',
      'text-decoration': 'underline !important',
    },
  },
  dark: {
    body: {
      background: '#151514 !important',
      color: '#EBE7DD !important',
      padding: '0 24px !important',
    },
    'p, span, div, li, h1, h2, h3, h4, h5, h6': {
      color: '#EBE7DD !important',
    },
    a: {
      color: '#789980 !important',
      'text-decoration': 'underline !important',
    },
  },
};

const FONT_FAMILIES = {
  serif: "'Newsreader', 'Lora', Georgia, 'Times New Roman', serif",
  sans: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  literary: "'Newsreader', 'Lora', Georgia, serif",
};

export function useEpub({
  containerRef,
  bookFile,
  initialCfi,
  preferences,
  onLocationChange,
  onError,
}: UseEpubOptions): UseEpubReturn {
  const [isBookReady, setIsBookReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [bookAuthor, setBookAuthor] = useState<string | null>(null);

  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const preferencesRef = useRef<ReaderPreferences>(preferences);

  const onLocationChangeRef = useRef(onLocationChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
    onErrorRef.current = onError;
  }, [onLocationChange, onError]);

  // Cleanup existing instances defensively
  const cleanup = useCallback(() => {
    if (renditionRef.current) {
      try {
        renditionRef.current.destroy();
      } catch {
        // Ignored
      }
      renditionRef.current = null;
    }

    if (bookRef.current) {
      try {
        // Preserve mock hooks so in-flight Section.load() promises don't throw Cannot read properties of undefined (reading 'content')
        const dummyHook = {
          trigger: () => Promise.resolve(),
          register: () => {},
          deregister: () => {},
          clear: () => {},
        };
        const spine = bookRef.current.spine as any;
        if (spine) {
          spine.hooks = {
            serialize: dummyHook,
            content: dummyHook,
          };
          if (typeof spine.each === 'function') {
            spine.each((sec: any) => {
              if (sec) {
                sec.hooks = {
                  serialize: dummyHook,
                  content: dummyHook,
                };
              }
            });
          }
        }
        bookRef.current.destroy();
      } catch {
        // Ignored
      }
      bookRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Update theme and typography without reloading book
  const applyPreferences = useCallback((prefs: ReaderPreferences) => {
    const rendition = renditionRef.current;
    if (!rendition) return;

    try {
      rendition.themes.select(prefs.theme);
      rendition.themes.fontSize(`${prefs.fontSize}px`);
      rendition.themes.font(FONT_FAMILIES[prefs.fontFamily] || FONT_FAMILIES.serif);
      rendition.themes.override('line-height', `${prefs.lineHeight}`);
    } catch {
      // Ignored if rendition not ready
    }
  }, []);

  // Initialize and render EPUB
  useEffect(() => {
    let isCancelled = false;

    if (!containerRef.current || !bookFile) {
      setIsLoading(false);
      return;
    }

    cleanup();
    setIsLoading(true);
    setErrorMessage(null);

    const initBook = async () => {
      try {
        let bookInput: string | ArrayBuffer;

        if (bookFile instanceof Blob) {
          bookInput = await bookFile.arrayBuffer();
        } else {
          bookInput = bookFile;
        }

        if (isCancelled) return;

        const book = ePub(bookInput);
        bookRef.current = book;

        // Render to DOM container immediately
        if (!containerRef.current) return;

        const rendition = book.renderTo(containerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: preferencesRef.current.spread === 'single' ? 'none' : 'auto',
          allowScriptedContent: false, // Security: strictly isolate and disable scripts
        });
        renditionRef.current = rendition;

        // Register themes
        rendition.themes.register('light', THEME_STYLES.light);
        rendition.themes.register('sepia', THEME_STYLES.sepia);
        rendition.themes.register('dark', THEME_STYLES.dark);

        // Apply initial preferences
        applyPreferences(preferencesRef.current);

        // Fail-safe timeout for initial display
        const displayPromise = rendition.display(initialCfi || undefined);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Waktu tunggu pembacaan buku habis (15 detik).')), 15000)
        );

        await Promise.race([displayPromise, timeoutPromise]);
        if (isCancelled) return;

        setIsBookReady(true);
        setIsLoading(false);

        // Extract metadata asynchronously in background without blocking rendering
        book.loaded.metadata
          .then((meta) => {
            if (isCancelled || !meta) return;
            if (meta.title) setBookTitle(meta.title);
            if (meta.creator) setBookAuthor(meta.creator);
          })
          .catch(() => {});

        // Load TOC asynchronously in background
        book.loaded.navigation
          .then((nav) => {
            if (isCancelled || !nav?.toc) return;
            const mappedToc: TocItem[] = nav.toc.map((item, index) => ({
              id: item.id || `toc-${index}`,
              href: item.href,
              label: item.label ? item.label.trim() : `Bagian ${index + 1}`,
              subitems: item.subitems?.map((sub, sIdx) => ({
                id: sub.id || `sub-${index}-${sIdx}`,
                href: sub.href,
                label: sub.label ? sub.label.trim() : `Subbagian ${sIdx + 1}`,
              })),
            }));
            setToc(mappedToc);
          })
          .catch(() => {});

        // Listen for location changes
        rendition.on('relocated', (location: any) => {
          if (isCancelled || !location) return;

          const startCfi = location.start?.cfi || '';
          let percentage = 0;

          if (book.locations && book.locations.length()) {
            percentage = Math.round(book.locations.percentageFromCfi(startCfi) * 100);
          } else if (location.start?.percentage) {
            percentage = Math.round(location.start.percentage * 100);
          }

          const locInfo: LocationInfo = {
            cfi: startCfi,
            percentage: Math.min(100, Math.max(0, percentage)),
            atStart: location.atStart,
            atEnd: location.atEnd,
          };

          setCurrentLocation(locInfo);
          onLocationChangeRef.current?.(locInfo);
        });

        // Generate locations in background for accurate progress calculation
        book.opened
          .then(() => {
            if (isCancelled) return;
            book.locations
              .generate(1024)
              .then(() => {
                if (isCancelled || !renditionRef.current) return;
                const currentLoc = renditionRef.current.currentLocation() as any;
                if (currentLoc?.start?.cfi) {
                  const pct = Math.round(book.locations.percentageFromCfi(currentLoc.start.cfi) * 100);
                  setCurrentLocation((prev) => (prev ? { ...prev, percentage: pct } : null));
                }
              })
              .catch(() => {});
          })
          .catch(() => {});
      } catch (err: unknown) {
        if (isCancelled) return;
        const error = err instanceof Error ? err : new Error('Gagal merender berkas EPUB.');
        setErrorMessage(error.message);
        setIsLoading(false);
        onErrorRef.current?.(error);
      }
    };

    initBook();

    return () => {
      isCancelled = true;
      cleanup();
    };
  }, [bookFile, containerRef, initialCfi, cleanup, applyPreferences]);

  // Keep theme & typography updated when preferences prop changes
  useEffect(() => {
    if (isBookReady) {
      applyPreferences(preferences);
    }
  }, [preferences, isBookReady, applyPreferences]);

  const nextPage = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  }, []);

  const prevPage = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  }, []);

  const goToLocation = useCallback((cfiOrHref: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(cfiOrHref);
    }
  }, []);

  return {
    isBookReady,
    isLoading,
    errorMessage,
    toc,
    currentLocation,
    bookTitle,
    bookAuthor,
    nextPage,
    prevPage,
    goToLocation,
    applyPreferences,
  };
}
