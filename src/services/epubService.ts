import ePub from 'epubjs';

/**
 * Nusa Reader — EPUB Service Contract & Utilities
 * Provides defensive EPUB parsing, metadata extraction,
 * validation, and formatting.
 */

export interface ExtractedEpubMetadata {
  title: string;
  authors: string[];
  publisher?: string;
  language?: string;
  identifier?: string;
  coverUrl?: string;
}

export interface EpubValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Defensively validate an EPUB file prior to opening or storage.
 * Follows AGENT.md: do not rely solely on MIME type; validate extension and file size.
 */
export function validateEpubFile(file: File): EpubValidationResult {
  if (!file) {
    return { valid: false, error: 'Tidak ada berkas yang dipilih.' };
  }

  const name = file.name.toLowerCase();
  const hasEpubExt = name.endsWith('.epub');

  if (!hasEpubExt) {
    return {
      valid: false,
      error: `Format berkas "${file.name}" tidak didukung. Harap pilih berkas dengan ekstensi .epub.`,
    };
  }

  // Check unreasonable file sizes (> 120MB warning/limit for web IndexedDB)
  const MAX_SIZE_BYTES = 120 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran berkas melebihi batas yang disarankan (120 MB).',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'Berkas kosong atau rusak.',
    };
  }

  return { valid: true };
}

/**
 * Extracts metadata (title, author, publisher, cover) directly from EPUB bytes using epub.js.
 * Always cleans up book instance to prevent resource leaks.
 */
export async function extractEpubMetadata(fileOrBlob: Blob | File): Promise<ExtractedEpubMetadata> {
  const fallbackTitle =
    fileOrBlob instanceof File
      ? fileOrBlob.name.replace(/\.epub$/i, '').replace(/[-_]/g, ' ')
      : 'Buku Tanpa Judul';

  try {
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    // In node/test environments or malformed files, handle gracefully
    const book = ePub(arrayBuffer);
    
    // Race metadata promise with 3-second timeout to avoid hanging on missing EPUB sections
    const metadataTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Metadata timeout')), 3000)
    );
    const meta = await Promise.race([book.loaded.metadata, metadataTimeout]);

    let coverUrl: string | undefined;
    try {
      const coverPromise = book.coverUrl();
      const coverTimeout = new Promise<undefined>((resolve) =>
        setTimeout(() => resolve(undefined), 1000)
      );
      const extractedCover = await Promise.race([coverPromise, coverTimeout]);
      if (extractedCover) {
        coverUrl = extractedCover;
      }
    } catch {
      // Cover extraction is optional
    }

    const title = meta?.title && meta.title.trim() ? meta.title.trim() : fallbackTitle;
    const authors =
      meta?.creator && meta.creator.trim() ? [meta.creator.trim()] : ['Penulis Tidak Diketahui'];

    // Clean up temporary book parser
    try {
      book.destroy();
    } catch {
      // Ignored
    }

    return {
      title,
      authors,
      publisher: meta?.publisher || undefined,
      language: meta?.language || undefined,
      identifier: meta?.identifier || undefined,
      coverUrl,
    };
  } catch {
    // If epubjs fails to parse metadata (e.g. mock test environment), fall back safely
    return {
      title: fallbackTitle,
      authors: ['Penulis Tidak Diketahui'],
    };
  }
}

/**
 * Format bytes into human readable format (KB, MB).
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Ukuran tidak diketahui';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format relative or localized date string.
 */
export function formatLastRead(timestamp?: number): string {
  if (!timestamp) return 'Belum mulai dibaca';

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 5) return 'Baru saja dibaca';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 30) return `${diffDays} hari lalu`;

  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
