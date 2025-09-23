import React, { useState, useRef } from 'react';
import Modal from './ui/Modal';
import useAppStore from '../store/useAppStore';
import Loader from './Loader';
import { SubmitButton } from './ui/SubmitButton';

const SpreadsheetAnalyzerModal: React.FC = () => {
  const { isAnalyzerOpen, toggleAnalyzer, startAnalysisFromSpreadsheet } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (isProcessing) return;
    setFile(null);
    setError(null);
    setInstructions('');
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toggleAnalyzer();
  };
  
  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const fileNameLower = selectedFile.name.toLowerCase();
      
      if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Tipo de arquivo inválido. Por favor, selecione um arquivo .csv, .xlsx ou .xls');
        setFile(null);
      }
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    if (!file || !instructions.trim()) return;
    setIsProcessing(true);
    setError(null);
    await startAnalysisFromSpreadsheet(file, instructions);
    // The store action closes the modal, so we just reset internal state.
    setIsProcessing(false);
    setFile(null);
    setInstructions('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isAnalyzerOpen} onClose={handleClose} title="Analisador de Planilhas de Produtos">
      {isProcessing ? <Loader /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left side - Upload Area */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">1. Anexe sua planilha</label>
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
                    id="file-upload-analyzer" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                    onChange={(e) => handleFileChange(e.target.files)} 
                />
                <i className="bi bi-cloud-arrow-up-fill text-4xl text-greatek-blue/50"></i>
                <p className="mt-2 text-sm font-semibold text-text-primary">Arraste e solte o arquivo</p>
                <p className="text-xs text-text-secondary">ou clique para selecionar</p>
                <p className="text-xs text-text-secondary/70 mt-1">Suporta .xlsx, .xls e .csv</p>
              </div>
              {file && (
                <div className="mt-4 p-3 bg-greatek-bg-light border border-greatek-border rounded-lg flex items-center justify-between text-left animate-fade-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <i className="bi bi-file-earmark-spreadsheet text-2xl text-greatek-dark-blue flex-shrink-0"></i>
                        <div className="flex flex-col overflow-hidden">
                           <span className="font-medium text-text-secondary truncate text-sm" title={file.name}>{file.name}</span>
                           <span className="text-xs text-text-secondary/80">{formatFileSize(file.size)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleRemoveFile} 
                        className="p-1.5 rounded-full hover:bg-gray-300 flex-shrink-0 ml-2"
                        aria-label="Remover arquivo"
                    >
                        <i className="bi bi-x-lg text-sm"></i>
                    </button>
                </div>
              )}
            </div>
            {/* Right side - Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-text-primary mb-2">2. Descreva o que o agente deve fazer</label>
              <textarea
                id="instructions"
                rows={8}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-md focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm p-2 text-text-primary placeholder:text-text-secondary/70 bg-greatek-border custom-scrollbar"
                placeholder="Exemplo: Analisar a licitação da 'Prefeitura de São Paulo' para fornecimento de equipamentos de rede. Apresente os produtos Greatek correspondentes em uma tabela."
                disabled={!file}
              />
            </div>
          </div>
          
          {error && <p className="text-center text-red-600 text-sm">{error}</p>}

          <div className="pt-4 flex justify-end border-t border-greatek-border">
              <SubmitButton
                  onClick={handleProcess}
                  disabled={!file || !instructions.trim() || isProcessing}
                  className="px-6 py-2 text-base font-semibold rounded-lg"
              >
                  Analisar e Iniciar Conversa
              </SubmitButton>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SpreadsheetAnalyzerModal;
