import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="bg-popover text-popover-foreground rounded-2xl p-6 w-96 shadow-xl transform transition-all border border-border">
        <h3 className="text-lg font-bold text-foreground mb-2">{title || 'Confirm Action'}</h3>
        <p className="text-muted-foreground mb-6">{message || 'Are you sure you want to proceed?'}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl transition-colors font-medium shadow-lg shadow-destructive/30"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
