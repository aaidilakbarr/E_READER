import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyLibrary } from './EmptyLibrary';

describe('EmptyLibrary component', () => {
  it('renders welcoming empty library state when no books exist', () => {
    const handleFileSelect = vi.fn();
    render(<EmptyLibrary onFileSelect={handleFileSelect} />);

    expect(screen.getByTestId('empty-library-state')).toBeInTheDocument();
    expect(screen.getByText('Ruang Membaca Anda Masih Kosong')).toBeInTheDocument();
    expect(screen.getByText(/tersimpan sepenuhnya di perangkat lokal/i)).toBeInTheDocument();
  });

  it('renders search empty state when searching with no matches', () => {
    const handleReset = vi.fn();
    render(
      <EmptyLibrary
        isSearchEmpty
        searchQuery="NonExistentBook"
        onResetSearch={handleReset}
      />
    );

    expect(screen.getByTestId('empty-search-state')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada buku yang cocok')).toBeInTheDocument();
    expect(screen.getByText('NonExistentBook')).toBeInTheDocument();

    const resetBtn = screen.getByText('Tampilkan Semua Buku');
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
