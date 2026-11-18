import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReaderToc } from './ReaderToc';
import type { TocItem } from './reader.types';

const mockToc: TocItem[] = [
  { id: '1', href: 'chapter1.xhtml', label: 'Bab 1: Titik Awal di Wonokromo' },
  {
    id: '2',
    href: 'chapter2.xhtml',
    label: 'Bab 2: Di Bawah Pesona Annelies',
    subitems: [
      { id: '2-1', href: 'chapter2.xhtml#sub1', label: 'Bagian A: Pertemuan Pertama' },
    ],
  },
];

describe('ReaderToc Component', () => {
  it('renders table of contents with chapters and subitems when open', () => {
    const handleClose = vi.fn();
    const handleSelect = vi.fn();

    render(
      <ReaderToc
        isOpen={true}
        onClose={handleClose}
        toc={mockToc}
        onSelectChapter={handleSelect}
        bookTitle="Bumi Manusia"
      />
    );

    expect(screen.getByText('Daftar Isi')).toBeInTheDocument();
    expect(screen.getByText('Bumi Manusia')).toBeInTheDocument();
    expect(screen.getByText('Bab 1: Titik Awal di Wonokromo')).toBeInTheDocument();
    expect(screen.getByText('Bab 2: Di Bawah Pesona Annelies')).toBeInTheDocument();
    expect(screen.getByText('Bagian A: Pertemuan Pertama')).toBeInTheDocument();
  });

  it('calls onSelectChapter and onClose when a chapter is clicked', () => {
    const handleClose = vi.fn();
    const handleSelect = vi.fn();

    render(
      <ReaderToc
        isOpen={true}
        onClose={handleClose}
        toc={mockToc}
        onSelectChapter={handleSelect}
      />
    );

    const chapterBtn = screen.getByText('Bab 1: Titik Awal di Wonokromo');
    fireEvent.click(chapterBtn);

    expect(handleSelect).toHaveBeenCalledWith('chapter1.xhtml');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders empty message when toc is empty', () => {
    render(
      <ReaderToc
        isOpen={true}
        onClose={vi.fn()}
        toc={[]}
        onSelectChapter={vi.fn()}
      />
    );

    expect(screen.getByText('Daftar isi tidak tersedia pada berkas buku ini.')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ReaderToc
        isOpen={false}
        onClose={vi.fn()}
        toc={mockToc}
        onSelectChapter={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
