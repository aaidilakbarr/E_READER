import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';
import type { BookRecord } from '../types/book';

const mockBook: BookRecord = {
  id: 'test-1',
  title: 'Bumi Manusia',
  authors: ['Pramoedya Ananta Toer'],
  importedAt: Date.now(),
  progressPercentage: 42,
};

describe('BookCard component', () => {
  it('renders title, author, and reading progress percentage', () => {
    const handleOpen = vi.fn();
    const handleDelete = vi.fn();

    render(
      <BookCard
        book={mockBook}
        onOpen={handleOpen}
        onRequestDelete={handleDelete}
      />
    );

    expect(screen.getAllByText('Bumi Manusia').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pramoedya Ananta Toer/i).length).toBeGreaterThan(0);
    expect(screen.getByText('42% dibaca')).toBeInTheDocument();
  });

  it('calls onOpen when the book card is clicked', () => {
    const handleOpen = vi.fn();
    const handleDelete = vi.fn();

    render(
      <BookCard
        book={mockBook}
        onOpen={handleOpen}
        onRequestDelete={handleDelete}
      />
    );

    const card = screen.getByTestId('book-card-test-1');
    fireEvent.click(card);

    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(handleOpen).toHaveBeenCalledWith(mockBook);
  });

  it('calls onRequestDelete when delete button is clicked without triggering onOpen', () => {
    const handleOpen = vi.fn();
    const handleDelete = vi.fn();

    render(
      <BookCard
        book={mockBook}
        onOpen={handleOpen}
        onRequestDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByTitle('Hapus buku dari perpustakaan');
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockBook);
    expect(handleOpen).not.toHaveBeenCalled();
  });
});
