import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);
  
  const toastStyles = {
    success: {
      bg: 'bg-greatek-dark-blue',
      icon: 'bi-check-circle-fill',
      iconColor: 'text-green-400',
    },
    info: {
      bg: 'bg-greatek-agent-select',
      icon: 'bi-info-circle-fill',
      iconColor: 'text-blue-300',
    },
    error: {
      bg: 'bg-red-700',
      icon: 'bi-exclamation-triangle-fill',
      iconColor: 'text-yellow-300',
    },
  };
  
  const styles = toastStyles[type];

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
      <div className={`flex items-start ${styles.bg} text-white py-3 px-5 rounded-lg shadow-2xl max-w-sm`}>
        <div className="flex-grow flex items-start">
            {styles.icon && <i className={`bi ${styles.icon} text-xl mr-3 ${styles.iconColor} flex-shrink-0`}></i>}
            <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-4 -mr-2 p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Fechar notificação"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;