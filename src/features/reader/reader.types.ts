import type { ReaderPreferences } from '../../types/book';

export interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

export interface LocationInfo {
  cfi: string;
  percentage: number; // 0 - 100
  chapterTitle?: string;
  atStart?: boolean;
  atEnd?: boolean;
}

export interface UseEpubOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  bookFile?: Blob | string;
  initialCfi?: string;
  reloadKey?: number;
  preferences: ReaderPreferences;
  onLocationChange?: (location: LocationInfo) => void;
  onError?: (error: Error) => void;
}

export interface UseEpubReturn {
  isBookReady: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  toc: TocItem[];
  currentLocation: LocationInfo | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  nextPage: () => void;
  prevPage: () => void;
  goToLocation: (cfiOrHref: string) => void;
  applyPreferences: (preferences: ReaderPreferences) => void;
}
