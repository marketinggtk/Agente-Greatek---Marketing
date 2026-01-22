
import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import Loader from './Loader';
import MarkdownViewer from './MarkdownViewer';
import { AppMode } from '../types';

const StrategicPlanner: React.FC = () => {
    const { 
        activeConversationId, 
        conversations, 
        isStrategicPlanning, 
        error, 
        commercialDatabase,
        dbLastUpdated,
        loadCommercialDatabase,
        runStrategicAnalysisFromDB,
        isLoading
    } = useAppStore();
    
    const conversation = useMemo(() => conversations.find(c => c.id === activeConversationId), [conversations, activeConversationId]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [regionName, setRegionName] = useState('Região Sul'); 

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await loadCommercialDatabase(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handleAnalyze = () => {
        runStrategicAnalysisFromDB({ region: regionName });
    };

    const lastMessage = conversation?.messages[conversation.messages.length - 1];
    const hasResult = lastMessage && lastMessage.role === 'agent';

    if (hasResult) {
        return (
            <div className="h-full p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-white animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-greatek-border">
                        <div className="w-12 h-12 bg-greatek-dark-blue text-white rounded-lg flex items-center justify-center shadow-lg">
                            <i className="bi bi-database-check text-2xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-greatek-dark-blue">Análise da Base Interna</h1>
                            <p className="text-sm text-text-secondary">Filtro: {regionName}</p>
                        </div>
                    </div>
                    
                    {isStrategicPlanning ? (
                        <div className="py-10">
                            <Loader />
                            <p className="text-center text-sm text-text-secondary mt-4 animate-pulse">
                                Consultando base de dados local ({commercialDatabase.length} registros)...
                                <br/>Calculando métricas em tempo real.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-greatek-bg-light/30 p-6 rounded-xl border border-greatek-border shadow-sm">
                            <MarkdownViewer 
                                content={typeof lastMessage.content === 'string' ? lastMessage.content : ''} 
                                mode={AppMode.STRATEGIC_PLANNER} 
                                isLastMessage={true} 
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-greatek-bg-light/50 animate-fade-in overflow-y-auto">
            {isLoading ? (
                <div className="text-center">
                    <Loader />
                    <p className="text-sm text-text-secondary mt-4">Processando Base Mestra...</p>
                </div>
            ) : (
                <div className="max-w-3xl w-full bg-white p-8 rounded-xl shadow-lg border border-greatek-border text-center my-auto">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-greatek-dark-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                            <i className="bi bi-database-fill-gear text-4xl text-white"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-greatek-dark-blue">Central de Inteligência Comercial</h1>
                        <p className="text-text-secondary mt-2">
                            Gerencie a base unificada de clientes e gere análises instantâneas sem re-upload.
                        </p>
                    </div>

                    {commercialDatabase.length > 0 ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-green-800 font-bold flex items-center gap-2">
                                        <i className="bi bi-check-circle-fill"></i> Base Ativa
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                        {commercialDatabase.length} registros carregados.
                                        <br/>Última atualização: {dbLastUpdated?.toLocaleTimeString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded hover:bg-green-100"
                                >
                                    Atualizar Base
                                </button>
                            </div>

                            <div className="text-left">
                                <label className="block text-sm font-semibold text-greatek-dark-blue mb-1">Filtrar Análise Por Região</label>
                                <select 
                                    value={regionName} 
                                    onChange={(e) => setRegionName(e.target.value)}
                                    className="w-full p-3 border border-greatek-border rounded-lg bg-[#e9e9e9] text-black focus:ring-2 focus:ring-greatek-blue"
                                >
                                    <option value="Região Sul">Região Sul (RS, SC, PR)</option>
                                    <option value="Região Sudeste">Região Sudeste (SP, RJ, MG, ES)</option>
                                    <option value="Região Centro-Oeste">Região Centro-Oeste</option>
                                    <option value="Região Nordeste">Região Nordeste</option>
                                    <option value="Região Norte">Região Norte</option>
                                </select>
                            </div>

                            <SubmitButton
                                onClick={handleAnalyze}
                                disabled={isStrategicPlanning}
                                className="w-full py-3 rounded-xl text-lg font-bold shadow-md"
                            >
                                Gerar Análise Estratégica
                            </SubmitButton>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div 
                                className="p-10 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-greatek-blue hover:bg-gray-50 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="bi bi-cloud-arrow-up-fill text-5xl text-greatek-blue/50 mb-4 block"></i>
                                <span className="text-lg font-semibold text-greatek-dark-blue">Carregar Base Mestra (Semanal)</span>
                                <p className="text-xs text-text-secondary mt-2 max-w-sm mx-auto">
                                    Faça o upload da planilha consolidada (Metas + Vendas P12) para alimentar o sistema.
                                </p>
                            </div>
                        </div>
                    )}

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={handleFileChange}
                    />

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StrategicPlanner;
