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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl animate-fade-in-down z-50">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-greatek-dark-blue" id="modal-title">
            Painel de Administração
          </h3>
          <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Esta área será usada para gerenciar a base de conhecimento do agente. Futuramente, você poderá fazer upload de novos catálogos de produtos em PDF para manter o agente sempre atualizado.
          </p>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <i className="bi bi-upload mx-auto text-5xl text-gray-300" aria-hidden="true"></i>
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-greatek-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-greatek-blue focus-within:ring-offset-2 hover:text-greatek-dark-blue"
                >
                  <span>Carregar um arquivo</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" disabled />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">PDF até 10MB (Funcionalidade simulada)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b">
          <button onClick={onClose} type="button" className="text-white bg-greatek-blue hover:bg-greatek-dark-blue focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;