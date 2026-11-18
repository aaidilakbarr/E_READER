import React, { useEffect, useState } from 'react';
import { ShieldCheck, HardDrive, Info, X } from 'lucide-react';
import { getBookStorage } from '../services/storage/indexedDbStorage';
import { formatFileSize } from '../services/epubService';
import './StorageInfoModal.css';

interface StorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageInfoModal: React.FC<StorageInfoModalProps> = ({ isOpen, onClose }) => {
  const [estimate, setEstimate] = useState<{
    usageBytes: number;
    quotaBytes: number;
    percentageUsed: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storage = getBookStorage() as any;
      if (storage.getStorageEstimate) {
        storage.getStorageEstimate().then((res: any) => setEstimate(res));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation" data-testid="storage-modal-backdrop">
      <div
        className="storage-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="storage-dialog-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Tutup dialog informasi penyimpanan"
        >
          <X size={18} />
        </button>

        <div className="storage-dialog__icon-wrapper">
          <ShieldCheck size={28} className="storage-dialog__icon" />
        </div>

        <h3 id="storage-dialog-title" className="storage-dialog__title">
          Penyimpanan Lokal & Privasi
        </h3>

        <div className="storage-dialog__body">
          <p className="storage-dialog__description">
            Nusa Reader dirancang dengan prinsip <strong>Local-First</strong>. Seluruh berkas EPUB biner, catatan progres membaca, dan pengaturan tampilan tersimpan secara mandiri di penyimpanan <code>IndexedDB</code> peramban Anda.
          </p>

          {/* Storage Quota Card */}
          {estimate && (
            <div className="storage-card">
              <div className="storage-card__header">
                <div className="storage-card__title-group">
                  <HardDrive size={16} />
                  <span>Kapasitas Peramban</span>
                </div>
                <span className="storage-card__percent">{estimate.percentageUsed}% Terpakai</span>
              </div>

              <div className="storage-card__bar">
                <div
                  className="storage-card__fill"
                  style={{ width: `${Math.max(1, estimate.percentageUsed)}%` }}
                />
              </div>

              <div className="storage-card__footer">
                <span>{formatFileSize(estimate.usageBytes)} digunakan</span>
                <span>Batas kuota {formatFileSize(estimate.quotaBytes)}</span>
              </div>
            </div>
          )}

          <div className="storage-dialog__notice">
            <Info size={16} className="storage-dialog__notice-icon" />
            <p>
              <strong>Penting:</strong> Menghapus &ldquo;Data Situs / Cookies&rdquo; melalui pengaturan browser dapat menghapus koleksi buku lokal Anda.
            </p>
          </div>
        </div>

        <div className="storage-dialog__actions">
          <button
            type="button"
            className="modal-btn modal-btn--cancel"
            onClick={onClose}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
