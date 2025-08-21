
import React from 'react';
import { WarningIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} aria-hidden="true"></div>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-fade-in-up">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <WarningIcon />
            </div>
            <h3 id="confirmation-dialog-title" className="text-lg leading-6 font-medium text-gray-900 mt-5">{title}</h3>
            <div className="mt-2 px-4 text-sm text-gray-500">
              <p>{message}</p>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-xl">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              ยืนยันการลบ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
