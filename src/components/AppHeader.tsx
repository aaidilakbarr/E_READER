import React, { useState } from 'react';
import { BookOpen, Sun, Moon, Coffee, ShieldCheck } from 'lucide-react';
import type { ReaderTheme, ActiveView } from '../types/book';
import { StorageInfoModal } from './StorageInfoModal';
import './AppHeader.css';

interface AppHeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  bookCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeView,
  onNavigate,
  theme,
  onThemeChange,
  bookCount,
}) => {
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-header__container">
          {/* Brand Identity */}
          <div
            className="app-header__brand"
            onClick={() => onNavigate('library')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('library')}
          >
            <div className="app-header__logo-mark">
              <BookOpen size={20} />
            </div>
            <div className="app-header__brand-text">
              <h1 className="app-header__title">Nusa Reader</h1>
              <span className="app-header__tagline">Perpustakaan EPUB Lokal</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="app-header__nav" aria-label="Navigasi Utama">
            <button
              type="button"
              className={`nav-tab ${activeView === 'library' ? 'nav-tab--active' : ''}`}
              onClick={() => onNavigate('library')}
              aria-current={activeView === 'library' ? 'page' : undefined}
            >
              <span>Koleksi Buku</span>
              {bookCount > 0 && <span className="nav-tab__count">{bookCount}</span>}
            </button>
          </nav>

          {/* Right Actions: Local Privacy Badge & Theme Switcher */}
          <div className="app-header__actions">
            <button
              type="button"
              className="privacy-badge privacy-badge--clickable"
              onClick={() => setIsStorageModalOpen(true)}
              title="Klik untuk melihat info penyimpanan lokal dan kapasitas peramban"
              aria-label="Informasi penyimpanan lokal"
              data-testid="storage-info-button"
            >
              <ShieldCheck size={14} className="privacy-badge__icon" />
              <span className="privacy-badge__text">Lokal & Pribadi</span>
            </button>

            <div className="theme-toggle" role="group" aria-label="Pilihan Tema Tampilan">
              <button
                type="button"
                className={`theme-btn ${theme === 'light' ? 'theme-btn--active' : ''}`}
                onClick={() => onThemeChange('light')}
                title="Tema Terang (Ivory)"
                aria-label="Ganti ke tema terang"
              >
                <Sun size={15} />
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'sepia' ? 'theme-btn--active' : ''}`}
                onClick={() => onThemeChange('sepia')}
                title="Tema Sepia (Krem Hangat)"
                aria-label="Ganti ke tema sepia"
              >
                <Coffee size={15} />
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'dark' ? 'theme-btn--active' : ''}`}
                onClick={() => onThemeChange('dark')}
                title="Tema Gelap (Malam)"
                aria-label="Ganti ke tema gelap"
              >
                <Moon size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Local Storage Info Modal */}
      <StorageInfoModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
      />
    </>
  );
};
