import React from 'react';
import './SkeletonGrid.css';

interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid" data-testid="skeleton-grid" aria-label="Memuat buku...">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton--cover" />
          <div className="skeleton-card__info">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--author" />
            <div className="skeleton skeleton--bar" />
          </div>
        </div>
      ))}
    </div>
  );
};
