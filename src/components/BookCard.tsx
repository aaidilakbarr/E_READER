import React, { useState } from 'react';
import { BookOpen, Trash2, CheckCircle2 } from 'lucide-react';
import type { BookRecord } from '../types/book';
import { formatLastRead } from '../services/epubService';
import './BookCard.css';

// Curated book cover background palettes for books without an embedded cover image
const COVER_PALETTES = [
  { bg: '#3D5344', text: '#FAF5EE', accent: '#A3BAA9', label: 'Sage Forest' },
  { bg: '#583D37', text: '#FDF7EE', accent: '#D5A79E', label: 'Warm Terracotta' },
  { bg: '#2B394A', text: '#F4F7FB', accent: '#9EBAD5', label: 'Midnight Slate' },
  { bg: '#4A4339', text: '#FAF6EE', accent: '#D1C2A5', label: 'Earthy Umber' },
  { bg: '#52404E', text: '#FAF4F9', accent: '#CAA7C4', label: 'Dusty Plum' },
  { bg: '#364B4E', text: '#F2F8F8', accent: '#9BC0C3', label: 'Nordic Pine' },
];

interface BookCardProps {
  book: BookRecord;
  onOpen: (book: BookRecord) => void;
  onRequestDelete: (book: BookRecord) => void;
  viewMode?: 'grid' | 'list';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpen,
  onRequestDelete,
  viewMode = 'grid',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Deterministic palette pick based on book ID or title
  const paletteIndex =
    Math.abs(
      book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % COVER_PALETTES.length;
  const palette = COVER_PALETTES[paletteIndex];

  const progress = book.progressPercentage || 0;
  const isCompleted = progress >= 100;
  const isNew = progress === 0;

  const authorText = book.authors?.length
    ? book.authors.join(', ')
    : 'Penulis Tidak Diketahui';

  const handleCardClick = () => {
    onOpen(book);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(book);
  };

  if (viewMode === 'list') {
    return (
      <article
        className="book-list-item"
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        tabIndex={0}
        role="button"
        aria-label={`Buka buku ${book.title}`}
      >
        <div
          className="book-list-item__mini-cover"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          <div className="book-list-item__spine-shadow" />
          <span className="book-list-item__mini-initial">
            {book.title.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="book-list-item__details">
          <div className="book-list-item__header">
            <h3 className="book-list-item__title">{book.title}</h3>
            {isCompleted && (
              <span className="book-badge book-badge--completed">
                <CheckCircle2 size={12} /> Selesai
              </span>
            )}
            {isNew && <span className="book-badge book-badge--new">Baru</span>}
          </div>
          <p className="book-list-item__author">{authorText}</p>
          <div className="book-list-item__meta">
            {book.currentChapterTitle && (
              <span className="book-list-item__chapter">{book.currentChapterTitle}</span>
            )}
            <span className="book-list-item__time">
              {formatLastRead(book.lastOpenedAt)}
            </span>
          </div>
        </div>

        <div className="book-list-item__progress-area">
          <div className="book-list-item__progress-info">
            <span className="book-list-item__percent">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <div className="book-list-item__actions">
          <button
            type="button"
            className="book-action-btn book-action-btn--delete"
            onClick={handleDeleteClick}
            title="Hapus buku dari perpustakaan"
            aria-label={`Hapus ${book.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="book-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      tabIndex={0}
      role="button"
      aria-label={`Buka buku ${book.title}`}
      data-testid={`book-card-${book.id}`}
    >
      {/* Book Cover Container */}
      <div className="book-card__cover-wrapper">
        <div
          className="book-card__cover"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          {/* Physical book spine sheen & book edge */}
          <div className="book-card__spine" />
          <div className="book-card__spine-crease" />

          {/* Book Content / Typographic Artwork */}
          <div className="book-card__cover-inner">
            <div
              className="book-card__cover-frame"
              style={{ borderColor: `${palette.accent}33` }}
            >
              <div className="book-card__cover-top">
                <span
                  className="book-card__monogram"
                  style={{ color: palette.accent }}
                >
                  ❦
                </span>
              </div>
              <div className="book-card__cover-title-area">
                <h4 className="book-card__cover-title">{book.title}</h4>
              </div>
              <div className="book-card__cover-bottom">
                <div
                  className="book-card__cover-divider"
                  style={{ backgroundColor: `${palette.accent}55` }}
                />
                <p
                  className="book-card__cover-author"
                  style={{ color: palette.accent }}
                >
                  {authorText}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="book-card__badges">
            {isCompleted ? (
              <span className="book-badge book-badge--completed">
                <CheckCircle2 size={12} /> Selesai
              </span>
            ) : isNew ? (
              <span className="book-badge book-badge--new">Baru</span>
            ) : (
              <span className="book-badge book-badge--progress">{progress}%</span>
            )}
          </div>

          {/* Hover overlay with quick open button */}
          <div className={`book-card__overlay ${isHovered ? 'book-card__overlay--visible' : ''}`}>
            <span className="book-card__open-prompt">
              <BookOpen size={16} />
              <span>{isNew ? 'Mulai Baca' : 'Lanjutkan'}</span>
            </span>
          </div>
        </div>

        {/* Delete button positioned gracefully on top right */}
        <button
          type="button"
          className="book-card__delete-btn"
          onClick={handleDeleteClick}
          title="Hapus buku dari perpustakaan"
          aria-label={`Hapus buku ${book.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Book Metadata & Progress */}
      <div className="book-card__info">
        <h3 className="book-card__title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-card__author" title={authorText}>
          {authorText}
        </p>

        {/* Progress bar */}
        <div className="book-card__progress-container">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="book-card__progress-text">
            <span>{isCompleted ? 'Selesai dibaca' : isNew ? 'Belum dibaca' : `${progress}% dibaca`}</span>
            {book.lastOpenedAt && (
              <span className="book-card__last-read">
                {formatLastRead(book.lastOpenedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
