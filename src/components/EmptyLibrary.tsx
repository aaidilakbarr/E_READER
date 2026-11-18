import React from 'react';
import { BookOpen, SearchX, Sparkles } from 'lucide-react';
import { ImportBookButton } from './ImportBookButton';
import './EmptyLibrary.css';

interface EmptyLibraryProps {
  isSearchEmpty?: boolean;
  searchQuery?: string;
  onResetSearch?: () => void;
  onFileSelect?: (file: File) => Promise<void>;
}

export const EmptyLibrary: React.FC<EmptyLibraryProps> = ({
  isSearchEmpty = false,
  searchQuery = '',
  onResetSearch,
  onFileSelect,
}) => {
  if (isSearchEmpty) {
    return (
      <div className="empty-state empty-state--search" data-testid="empty-search-state">
        <div className="empty-state__icon-wrapper">
          <SearchX size={36} className="empty-state__icon" />
        </div>
        <h3 className="empty-state__title">Tidak ada buku yang cocok</h3>
        <p className="empty-state__description">
          Tidak ditemukan buku dengan kata kunci &ldquo;<strong>{searchQuery}</strong>&rdquo;. Periksa ejaan atau hapus penyaring pencarian.
        </p>
        {onResetSearch && (
          <button
            type="button"
            className="empty-state__reset-btn"
            onClick={onResetSearch}
          >
            Tampilkan Semua Buku
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="empty-state empty-state--library" data-testid="empty-library-state">
      <div className="empty-state__illustration">
        <div className="empty-state__icon-orb">
          <BookOpen size={44} className="empty-state__icon-primary" />
        </div>
        <div className="empty-state__sparkle">
          <Sparkles size={16} />
        </div>
      </div>

      <h3 className="empty-state__title">Ruang Membaca Anda Masih Kosong</h3>
      <p className="empty-state__description">
        Mulai bangun koleksi bacaan digital Anda. Tambahkan berkas buku bertipe <code>.epub</code> untuk menikmati pengalaman membaca yang tenang, elegan, dan bebas distraksi.
      </p>

      {onFileSelect && (
        <div className="empty-state__actions">
          <ImportBookButton
            onFileSelect={onFileSelect}
            variant="empty"
            label="Pilih Berkas EPUB"
          />
        </div>
      )}

      <div className="empty-state__privacy-hint">
        <span className="empty-state__dot" />
        <span>Buku Anda tersimpan sepenuhnya di perangkat lokal Anda tanpa dikirim ke server.</span>
      </div>
    </div>
  );
};
