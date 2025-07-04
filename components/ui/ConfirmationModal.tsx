import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-start">
            <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className="fa-solid fa-triangle-exclamation h-6 w-6 text-red-600" aria-hidden="true"></i>
            </div>
            <div className="ml-4 text-left">
                <h3 className="text-lg font-bold text-slate-800" id="modal-title">
                {title}
                </h3>
                <div className="mt-2">
                <p className="text-sm text-slate-600">
                    {message}
                </p>
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
