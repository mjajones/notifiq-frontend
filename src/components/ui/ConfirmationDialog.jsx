import React from 'react';

export default function ConfirmationDialog({ open, onClose, onConfirm, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-foreground rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
        <div className="text-text-secondary mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}