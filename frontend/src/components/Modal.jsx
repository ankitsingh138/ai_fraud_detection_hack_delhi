import { useEffect } from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-accent-secondary/10 border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full mx-4 transform transition-all animate-modal">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
        )}
        <div className="text-gray-600 dark:text-gray-300">
          {children}
        </div>
        {showCloseButton && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Modal;

