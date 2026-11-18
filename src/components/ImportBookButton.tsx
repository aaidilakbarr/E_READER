import React, { useRef, useState } from 'react';
import { Plus, UploadCloud, Loader2 } from 'lucide-react';
import './ImportBookButton.css';

interface ImportBookButtonProps {
  onFileSelect: (file: File) => Promise<void>;
  variant?: 'primary' | 'secondary' | 'empty';
  label?: string;
}

export const ImportBookButton: React.FC<ImportBookButtonProps> = ({
  onFileSelect,
  variant = 'primary',
  label = 'Tambah Buku EPUB',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      await onFileSelect(file);
    } finally {
      setIsLoading(false);
      // Reset input value so re-selecting the same file name triggers change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub,application/epub+zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Pilih berkas EPUB untuk diimpor"
        data-testid="epub-file-input"
      />
      <button
        type="button"
        className={`import-btn import-btn--${variant}`}
        onClick={handleClick}
        disabled={isLoading}
        title="Pilih berkas .epub dari perangkat Anda"
        aria-label={label}
      >
        {isLoading ? (
          <Loader2 className="import-btn__icon import-btn__icon--spin" size={18} />
        ) : variant === 'empty' ? (
          <UploadCloud className="import-btn__icon" size={20} />
        ) : (
          <Plus className="import-btn__icon" size={18} />
        )}
        <span className="import-btn__label">{isLoading ? 'Memuat berkas...' : label}</span>
      </button>
    </>
  );
};
