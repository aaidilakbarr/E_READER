import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import './ErrorBanner.css';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="error-banner" role="alert" data-testid="error-banner">
      <div className="error-banner__content">
        <AlertCircle size={18} className="error-banner__icon" />
        <span className="error-banner__message">{message}</span>
      </div>
      <button
        type="button"
        className="error-banner__dismiss"
        onClick={onDismiss}
        aria-label="Tutup pesan peringatan"
      >
        <X size={16} />
      </button>
    </div>
  );
};
