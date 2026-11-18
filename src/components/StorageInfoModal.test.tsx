import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StorageInfoModal } from './StorageInfoModal';

describe('StorageInfoModal Component', () => {
  it('renders modal with local-first explanation when open', () => {
    const handleClose = vi.fn();
    render(<StorageInfoModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Penyimpanan Lokal & Privasi')).toBeInTheDocument();
    expect(screen.getByText(/Local-First/i)).toBeInTheDocument();
    expect(screen.getByText(/IndexedDB/i)).toBeInTheDocument();
  });

  it('calls onClose when close button or Mengerti button is clicked', () => {
    const handleClose = vi.fn();
    render(<StorageInfoModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Tutup dialog informasi penyimpanan');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const understandBtn = screen.getByText('Mengerti');
    fireEvent.click(understandBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<StorageInfoModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
