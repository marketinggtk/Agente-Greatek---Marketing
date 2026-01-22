
import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import OutboundDashboard from './OutboundDashboard';
import Loader from './Loader';
import { extractTextFromExcel } from '../services/excelService';

const OutboundStrategist: React.FC = () => {
    const { 
        activeConversationId, 
        conversations, 
        isAnalyzingOutbound, 
        error, 
        runOutboundAnalysis 
    } = useAppStore();
    
    const conversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const processFiles = async (files: FileList | File[]) => {
        setLocalLoading(true);
        try {
            const fileArray = Array.from(files);
            const textPromises = fileArray.map(async (file) => {
                const fileNameLower = file.name.toLowerCase();
                let content = '';

                if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv')) {
                    content = await extractTextFromExcel(file);
                } else if (fileNameLower.endsWith('.pdf')) {
                    // Mock simulado para PDF
                    content = `[CONTEÚDO DO ARQUIVO PDF: ${file.name}]\n(Simulação de extração de dados de PDF...)\n`;
                } else {
                    throw new Error(`O arquivo ${file.name} não é suportado.`);
                }
                return content;
            });

            const results = await Promise.all(textPromises);
            
            // Combina o texto de todas as planilhas em um único contexto
            const combinedText = results.join('\n\n========================================\n\n');

            if (!combinedText.trim()) {
                throw new Error("Os arquivos parecem estar vazios.");
            }

            await runOutboundAnalysis(combinedText);

        } catch (e: any) {
            console.error(e);
            alert(e.message || "Erro ao processar arquivos");
        } finally {
            setLocalLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    if (conversation?.outboundReport) {
        return (
            <div className="h-full p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white">
                <OutboundDashboard report={conversation.outboundReport} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-greatek-bg-light/50 animate-fade-in overflow-y-auto">
            {isAnalyzingOutbound || localLoading ? (
                <Loader />
            ) : (
                <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg border border-greatek-border text-center my-auto">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-greatek-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="bi bi-layers-fill text-4xl text-greatek-blue"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-greatek-dark-blue">Análise Cruzada de Planilhas</h1>
                        <p className="text-text-secondary mt-2">
                            Faça o upload de <strong>uma ou mais planilhas</strong> (ex: Vendas + Metas). 
                            A IA cruzará os dados de todos os arquivos para gerar estratégias unificadas.
                        </p>
                    </div>

                    <div 
                        className={`p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragOver ? 'border-greatek-blue bg-greatek-blue/5 scale-105' : 'border-gray-300 hover:border-greatek-blue hover:bg-gray-50'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".xlsx,.xls,.csv,.pdf" 
                            multiple // Permite múltiplos arquivos
                            onChange={handleFileChange}
                        />
                        <i className="bi bi-file-earmark-spreadsheet-fill text-5xl text-green-600 mb-4 block"></i>
                        <span className="text-lg font-semibold text-greatek-dark-blue">Clique para selecionar arquivos</span>
                        <p className="text-sm text-text-secondary mt-1">Selecione vários arquivos de uma vez se necessário</p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-text-secondary/60 mt-6">
                        * Dica: Para cruzar dados, garanta que os nomes dos vendedores ou clientes estejam escritos de forma similar nas diferentes planilhas.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OutboundStrategist;
