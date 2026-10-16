import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Alert = ({ type = 'success', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`} role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isSuccess ? (
          <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
        ) : (
          <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
        )}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
