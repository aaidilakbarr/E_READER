import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { BookRecord } from '../types/book';
import './DeleteBookModal.css';

interface DeleteBookModalProps {
  book: BookRecord | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  book,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !book) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      role="presentation"
      data-testid="delete-modal-backdrop"
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onCancel}
          aria-label="Tutup dialog"
        >
          <X size={18} />
        </button>

        <div className="modal-dialog__icon-wrapper">
          <AlertTriangle size={28} className="modal-dialog__icon" />
        </div>

        <h3 id="delete-dialog-title" className="modal-dialog__title">
          Hapus Buku dari Perpustakaan?
        </h3>

        <div id="delete-dialog-desc" className="modal-dialog__content">
          <p className="modal-dialog__book-info">
            <strong>&ldquo;{book.title}&rdquo;</strong>
            <span className="modal-dialog__author">
              oleh {book.authors.join(', ') || 'Penulis Tidak Diketahui'}
            </span>
          </p>
          <p className="modal-dialog__warning">
            Tindakan ini akan menghapus berkas buku dan seluruh catatan progres membaca dari penyimpanan lokal perangkat ini. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="modal-dialog__actions">
          <button
            type="button"
            className="modal-btn modal-btn--cancel"
            onClick={onCancel}
            autoFocus
          >
            Batal
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--danger"
            onClick={onConfirm}
            data-testid="confirm-delete-button"
          >
            Hapus Buku
          </button>
        </div>
      </div>
    </div>
  );
};
