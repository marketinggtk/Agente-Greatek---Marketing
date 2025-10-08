
import React, { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import AnalysisDashboard from './AnalysisDashboard';

const BusinessAnalyzer: React.FC = () => {
    const { startBusinessAnalysis, isAnalyzing, error, businessAnalysisResult } = useAppStore();
    const [file, setFile] = useState<File | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const selectedFile = files[0];
            const fileNameLower = selectedFile.name.toLowerCase();
            
            if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
                setFile(selectedFile);
                setLocalError(null);
                 startBusinessAnalysis(selectedFile);
            } else {
                setLocalError('Tipo de arquivo inválido. Por favor, selecione um arquivo .csv, .xlsx ou .xls');
                setFile(null);
            }
        }
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
    
    if (isAnalyzing || businessAnalysisResult) {
        return <AnalysisDashboard />;
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 justify-center items-center bg-white animate-fade-in text-center">
            <div className="w-full max-w-lg">
                <i className="bi bi-lightbulb-fill text-5xl text-greatek-blue/30 mx-auto mb-4"></i>
                <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Analisador de Negócios (Win/Loss)</h1>
                <p className="text-sm sm:text-base text-text-secondary mt-2">
                    Faça o upload de sua planilha de negociações ganhas e perdidas para transformar dados em inteligência estratégica.
                </p>

                 <div 
                    className={`mt-6 p-8 w-full text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-greatek-blue bg-greatek-blue/10' : 'border-gray-300 hover:border-greatek-blue'}`}
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
                        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                        onChange={(e) => handleFileChange(e.target.files)} 
                    />
                    <i className="bi bi-cloud-arrow-up-fill text-4xl text-greatek-blue/50"></i>
                    <p className="mt-2 text-sm font-semibold text-text-primary">Arraste e solte a planilha</p>
                    <p className="text-xs text-text-secondary">ou clique para selecionar</p>
                </div>

                {(localError || error) && <p className="text-center text-red-600 text-sm mt-4">{localError || error}</p>}
                
                 <p className="text-xs text-text-secondary/80 mt-6">
                    A ferramenta buscará automaticamente por colunas como 'Status', 'Valor' e 'Motivo'.
                </p>
            </div>
        </div>
    );
};

export default BusinessAnalyzer;