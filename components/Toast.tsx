import React, { useEffect } from 'react';
import { CheckCircleIcon, CloseIcon } from './Icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
      <div className="flex items-center bg-greatek-dark-blue text-white py-3 px-5 rounded-lg shadow-2xl">
        <CheckCircleIcon className="h-6 w-6 mr-3 text-green-400 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={onClose} 
          className="ml-4 -mr-2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fechar notificação"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
