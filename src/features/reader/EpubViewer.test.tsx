import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EpubViewer } from './EpubViewer';
import type { UseEpubReturn } from './reader.types';

const createMockEpub = (overrides?: Partial<UseEpubReturn>): UseEpubReturn => ({
  isBookReady: false,
  isLoading: false,
  errorMessage: null,
  toc: [],
  currentLocation: null,
  bookTitle: 'Test Book',
  bookAuthor: 'Test Author',
  nextPage: vi.fn(),
  prevPage: vi.fn(),
  goToLocation: vi.fn(),
  applyPreferences: vi.fn(),
  ...overrides,
});

describe('EpubViewer Component', () => {
  it('renders loading overlay when isLoading is true', () => {
    const mockEpub = createMockEpub({ isLoading: true });
    const ref = React.createRef<HTMLDivElement>();

    render(<EpubViewer epub={mockEpub} containerRef={ref} />);

    expect(screen.getByText('Mempersiapkan buku digital...')).toBeInTheDocument();
  });

  it('renders error overlay with retry button when errorMessage is provided', () => {
    const handleRetry = vi.fn();
    const mockEpub = createMockEpub({ errorMessage: 'Berkas rusak atau terenkripsi DRM.' });
    const ref = React.createRef<HTMLDivElement>();

    render(<EpubViewer epub={mockEpub} containerRef={ref} onRetry={handleRetry} />);

    expect(screen.getByText('Tidak Dapat Membuka Berkas EPUB')).toBeInTheDocument();
    expect(screen.getByText('Berkas rusak atau terenkripsi DRM.')).toBeInTheDocument();

    const retryBtn = screen.getByText('Coba Muat Ulang');
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('invokes nextPage and prevPage on ArrowRight and ArrowLeft keyboard presses', () => {
    const mockNext = vi.fn();
    const mockPrev = vi.fn();
    const mockEpub = createMockEpub({ isBookReady: true, nextPage: mockNext, prevPage: mockPrev });
    const ref = React.createRef<HTMLDivElement>();

    render(<EpubViewer epub={mockEpub} containerRef={ref} />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockNext).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockPrev).toHaveBeenCalledTimes(1);
  });
});
