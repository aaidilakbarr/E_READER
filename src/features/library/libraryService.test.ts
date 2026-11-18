import { describe, it, expect } from 'vitest';
import { filterAndSortBooks } from './libraryService';
import type { BookRecord } from '../../types/book';

const sampleBooks: BookRecord[] = [
  {
    id: 'b1',
    title: 'Bumi Manusia',
    authors: ['Pramoedya Ananta Toer'],
    importedAt: 1000,
    lastOpenedAt: 5000,
    progressPercentage: 45,
  },
  {
    id: 'b2',
    title: 'Laskar Pelangi',
    authors: ['Andrea Hirata'],
    importedAt: 2000,
    lastOpenedAt: 2000,
    progressPercentage: 100,
  },
  {
    id: 'b3',
    title: 'Gadis Kretek',
    authors: ['Ratih Kumala'],
    importedAt: 3000,
    progressPercentage: 0,
  },
];

describe('libraryService - filterAndSortBooks', () => {
  it('filters books by title search query', () => {
    const result = filterAndSortBooks(sampleBooks, 'Bumi', 'all', 'recent');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Bumi Manusia');
  });

  it('filters books by author search query', () => {
    const result = filterAndSortBooks(sampleBooks, 'Andrea', 'all', 'recent');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Laskar Pelangi');
  });

  it('filters reading status "reading"', () => {
    const result = filterAndSortBooks(sampleBooks, '', 'reading', 'recent');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Bumi Manusia');
  });

  it('filters reading status "completed"', () => {
    const result = filterAndSortBooks(sampleBooks, '', 'completed', 'recent');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Laskar Pelangi');
  });

  it('sorts books alphabetically by title', () => {
    const result = filterAndSortBooks(sampleBooks, '', 'all', 'title');
    expect(result.map((b) => b.title)).toEqual([
      'Bumi Manusia',
      'Gadis Kretek',
      'Laskar Pelangi',
    ]);
  });

  it('sorts books by highest reading progress', () => {
    const result = filterAndSortBooks(sampleBooks, '', 'all', 'progress');
    expect(result[0].title).toBe('Laskar Pelangi');
    expect(result[1].title).toBe('Bumi Manusia');
    expect(result[2].title).toBe('Gadis Kretek');
  });
});
