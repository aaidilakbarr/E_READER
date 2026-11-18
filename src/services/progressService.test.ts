import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveProgressDebounced, flushProgress, loadProgress } from './progressService';

// Mock storage
vi.mock('./storage/storageFactory', () => {
  const store = new Map<string, any>();
  return {
    createStorage: () => ({
      saveProgress: vi.fn(async (prog) => {
        store.set(prog.bookId, prog);
      }),
      getProgress: vi.fn(async (bookId) => store.get(bookId)),
    }),
  };
});

describe('progressService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await flushProgress();
    vi.useRealTimers();
  });

  it('debounces progress save and persists latest value after delay', async () => {
    saveProgressDebounced({
      bookId: 'b-1',
      cfi: 'epubcfi(/6/2[chap1]!/4/10)',
      percentage: 20,
      updatedAt: 1000,
    }, 300);

    // Rapid successive update before 300ms
    saveProgressDebounced({
      bookId: 'b-1',
      cfi: 'epubcfi(/6/2[chap1]!/4/20)',
      percentage: 25,
      updatedAt: 1100,
    }, 300);

    // Fast-forward time
    vi.advanceTimersByTime(350);

    const loaded = await loadProgress('b-1');
    expect(loaded).toBeDefined();
    expect(loaded?.percentage).toBe(25);
    expect(loaded?.cfi).toBe('epubcfi(/6/2[chap1]!/4/20)');
  });

  it('immediately persists pending progress when flushProgress is called', async () => {
    saveProgressDebounced({
      bookId: 'b-2',
      cfi: 'epubcfi(/6/4[chap2]!/4/2)',
      percentage: 50,
      updatedAt: 2000,
    }, 1000);

    // Flush immediately without waiting 1000ms
    await flushProgress('b-2');

    const loaded = await loadProgress('b-2');
    expect(loaded?.percentage).toBe(50);
  });
});
