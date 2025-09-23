
import React from 'react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-down z-50">
        <div className="flex items-start justify-between p-4 border-b rounded-t sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-greatek-dark-blue flex items-center gap-2" id="modal-title">
            <i className="bi bi-gear-fill"></i>
            Painel de Administração
          </h3>
          <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="flex-grow p-6 text-center text-gray-500 flex flex-col items-center justify-center">
            <i className="bi bi-tools text-5xl mb-4 text-gray-300"></i>
            <h4 className="text-lg font-semibold text-text-primary">Em Desenvolvimento</h4>
            <p className="text-sm text-text-secondary mt-1">A área de administração está sendo preparada.</p>
            <p className="text-xs text-text-secondary/80 mt-1">Funcionalidades futuras de configuração aparecerão aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;