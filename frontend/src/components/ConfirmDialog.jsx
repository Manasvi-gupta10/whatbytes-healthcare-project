import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed with this deletion? This action cannot be undone.',
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#dc2626',
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
              Deleting...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
