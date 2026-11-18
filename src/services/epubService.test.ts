import { describe, it, expect } from 'vitest';
import { validateEpubFile, formatFileSize, formatLastRead } from './epubService';

describe('epubService', () => {
  describe('validateEpubFile', () => {
    it('accepts a valid .epub file', () => {
      const file = new File(['dummy epub content'], 'moby-dick.epub', {
        type: 'application/epub+zip',
      });
      const result = validateEpubFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects a non-epub file', () => {
      const file = new File(['dummy pdf content'], 'report.pdf', {
        type: 'application/pdf',
      });
      const result = validateEpubFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('tidak didukung');
    });

    it('rejects an empty file (0 bytes)', () => {
      const file = new File([], 'empty.epub', {
        type: 'application/epub+zip',
      });
      const result = validateEpubFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('kosong');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes, kilobytes, and megabytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });

    it('handles undefined or 0 gracefully', () => {
      expect(formatFileSize(undefined)).toBe('Ukuran tidak diketahui');
      expect(formatFileSize(0)).toBe('Ukuran tidak diketahui');
    });
  });

  describe('formatLastRead', () => {
    it('returns "Belum mulai dibaca" when undefined', () => {
      expect(formatLastRead(undefined)).toBe('Belum mulai dibaca');
    });

    it('returns "Baru saja dibaca" for recent timestamp', () => {
      const now = Date.now();
      expect(formatLastRead(now - 1000 * 60)).toBe('Baru saja dibaca');
    });
  });
});
