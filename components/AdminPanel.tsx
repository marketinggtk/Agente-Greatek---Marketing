

import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

const AdminPanel: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
  const { updateKnowledgeBaseFromFile, isLoading, userUploadedKnowledge, resetKnowledgeBase } = useAppStore(
    (state) => ({
      updateKnowledgeBaseFromFile: state.updateKnowledgeBaseFromFile,
      isLoading: state.isLoading,
      userUploadedKnowledge: state.userUploadedKnowledge,
      resetKnowledgeBase: state.resetKnowledgeBase,
    })
  );

  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileChange = (selectedFile: File | null | undefined) => {
    if (selectedFile) {
      const fileNameLower = selectedFile.name.toLowerCase();
      if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Tipo de arquivo inválido. Use .xlsx ou .xls.');
        setFile(null);
      }
    }
  };

  const handleProcessFile = () => {
    if (file) {
      updateKnowledgeBaseFromFile(file).then(() => {
        setFile(null); // Clear file only on success
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
        
        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
          <div>
            <h4 className="text-lg font-semibold text-greatek-dark-blue">Base de Conhecimento Customizada</h4>
            <p className="text-sm text-text-secondary mt-1">
              Faça o upload de uma planilha (.xlsx, .xls) para adicionar produtos à base de conhecimento do agente para esta sessão.
            </p>
          </div>
          
          {userUploadedKnowledge.length > 0 ? (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-center animate-fade-in">
                <i className="bi bi-check-circle-fill text-3xl text-green-500"></i>
                <p className="mt-2 font-semibold text-green-800">
                    Base de conhecimento customizada ativa com {userUploadedKnowledge.length} produtos.
                </p>
                <p className="text-xs text-green-700">As informações da sua planilha terão prioridade nas respostas do agente.</p>
                <button 
                    onClick={resetKnowledgeBase}
                    className="mt-3 text-xs font-semibold text-red-600 hover:underline"
                >
                    Limpar base customizada
                </button>
            </div>
          ) : (
             <>
                <div 
                  className={`p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-greatek-blue bg-greatek-blue/10' : 'border-gray-300 hover:border-greatek-blue'}`}
                  onDragOver={(e) => handleDragEvents(e, true)}
                  onDragLeave={(e) => handleDragEvents(e, false)}
                  onDragEnter={(e) => handleDragEvents(e, true)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                      ref={fileInputRef} 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                      onChange={(e) => handleFileChange(e.target.files?.[0])} 
                  />
                  <i className="bi bi-cloud-arrow-up-fill text-4xl text-greatek-blue/50"></i>
                  <p className="mt-2 text-sm font-semibold text-text-primary">Arraste e solte o arquivo</p>
                  <p className="text-xs text-text-secondary">ou clique para selecionar</p>
                </div>

                {file && (
                    <div className="p-2 bg-greatek-bg-light border border-greatek-border rounded-lg flex items-center justify-between text-left animate-fade-in">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <i className="bi bi-file-earmark-spreadsheet text-2xl text-green-700 flex-shrink-0"></i>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium text-text-secondary truncate text-sm" title={file.name}>{file.name}</span>
                              <span className="text-xs text-text-secondary/80">{formatFileSize(file.size)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setFile(null)}
                            className="p-1.5 rounded-full hover:bg-gray-300 flex-shrink-0 ml-2" aria-label="Remover arquivo"
                        >
                            <i className="bi bi-x-lg text-sm"></i>
                        </button>
                    </div>
                )}
                
                {(error || useAppStore.getState().error) && <p className="text-center text-red-600 text-sm">{error || useAppStore.getState().error}</p>}

                <div className="flex justify-end">
                    <button
                        onClick={handleProcessFile}
                        disabled={!file || isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Processando...' : 'Atualizar Conhecimento'}
                    </button>
                </div>
            </>
          )}

          <div className="text-xs text-gray-600 p-4 bg-gray-100 rounded-md">
            <h4 className="font-semibold text-sm mb-2">Instruções para a Planilha:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>A primeira linha da planilha deve ser o cabeçalho.</li>
              <li>São necessárias as seguintes colunas: <strong>name</strong>, <strong>keywords</strong>, e <strong>details</strong>.</li>
              <li>A coluna <strong>name</strong> deve ter o nome do produto.</li>
              <li>A coluna <strong>keywords</strong> deve ter palavras-chave separadas por vírgula.</li>
              <li>A coluna <strong>details</strong> deve conter a descrição completa do produto.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;