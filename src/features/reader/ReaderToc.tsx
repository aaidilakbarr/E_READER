import React from 'react';
import { X, ChevronRight, Bookmark } from 'lucide-react';
import type { TocItem } from './reader.types';
import './ReaderToc.css';

interface ReaderTocProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  onSelectChapter: (href: string) => void;
  bookTitle?: string;
}

export const ReaderToc: React.FC<ReaderTocProps> = ({
  isOpen,
  onClose,
  toc,
  onSelectChapter,
  bookTitle,
}) => {
  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    onSelectChapter(href);
    onClose();
  };

  return (
    <div className="toc-backdrop" onClick={onClose} role="presentation" data-testid="toc-backdrop">
      <aside
        className="toc-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Daftar Isi Buku"
      >
        <header className="toc-header">
          <div className="toc-header__title-group">
            <h3 className="toc-title">Daftar Isi</h3>
            {bookTitle && <span className="toc-subtitle">{bookTitle}</span>}
          </div>
          <button
            type="button"
            className="toc-close-btn"
            onClick={onClose}
            aria-label="Tutup daftar isi"
          >
            <X size={18} />
          </button>
        </header>

        <div className="toc-content">
          {toc.length === 0 ? (
            <div className="toc-empty">
              <Bookmark size={24} className="toc-empty__icon" />
              <p>Daftar isi tidak tersedia pada berkas buku ini.</p>
            </div>
          ) : (
            <ul className="toc-list" role="list">
              {toc.map((item) => (
                <li key={item.id} className="toc-item">
                  <button
                    type="button"
                    className="toc-item__btn"
                    onClick={() => handleSelect(item.href)}
                  >
                    <span className="toc-item__label">{item.label}</span>
                    <ChevronRight size={14} className="toc-item__arrow" />
                  </button>

                  {item.subitems && item.subitems.length > 0 && (
                    <ul className="toc-sublist" role="list">
                      {item.subitems.map((sub) => (
                        <li key={sub.id} className="toc-subitem">
                          <button
                            type="button"
                            className="toc-subitem__btn"
                            onClick={() => handleSelect(sub.href)}
                          >
                            <span className="toc-subitem__label">{sub.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};
