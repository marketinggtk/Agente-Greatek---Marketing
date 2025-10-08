

import React from 'react';
// FIX: Changed to a named import to match the export from the store file.
import { useAppStore } from '../store/useAppStore';
import KPICard from './ui/KPICard';
import { ChartData, AppMode } from '../types';
import MarkdownViewer from './MarkdownViewer';

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in h-full">
      <div className="w-12 h-12 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"></div>
      <p className="mt-4 text-base font-medium text-text-secondary">Analisando sua planilha e gerando insights...</p>
    </div>
);

const Chart: React.FC<{ title: string; data: ChartData[]; colorClass: string; icon: string }> = ({ title, data, colorClass, icon }) => (
    <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
        <h3 className="text-base font-semibold text-greatek-dark-blue flex items-center">
            <i className={`bi ${icon} mr-2 ${colorClass}`}></i>
            {title}
        </h3>
        {data.length > 0 ? (
            <div className="mt-4 space-y-3">
                {data.slice(0, 5).map((item, index) => (
                    <div key={index} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-text-secondary truncate pr-2">{item.label}</span>
                            <span className="font-semibold text-greatek-dark-blue">{item.value} ({item.percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-greatek-border rounded-full h-2">
                            <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${item.percentage}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-text-secondary/80 mt-4 text-center">Nenhum dado de motivo foi encontrado.</p>
        )}
    </div>
);

const AnalysisDashboard: React.FC = () => {
    const { isAnalyzing, businessAnalysisResult, error } = useAppStore();

    if (isAnalyzing) {
        return <LoadingState />;
    }

    if (error && !businessAnalysisResult) {
        return <div className="p-8 text-center text-red-600">Erro: {error}</div>;
    }

    if (!businessAnalysisResult) {
        return null; 
    }

    const { kpis, winReasons, lossReasons, aiInsights } = businessAnalysisResult;

    return (
        <div className="p-4 sm:p-6 bg-greatek-bg-light/50 h-full overflow-y-auto custom-scrollbar animate-fade-in">
            <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue mb-4">Dashboard de Análise de Negócios</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <KPICard key={kpi.title} {...kpi} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <Chart title="Principais Motivos de Ganho" data={winReasons} colorClass="bg-green-500" icon="bi-check-circle-fill" />
                <Chart title="Principais Motivos de Perda" data={lossReasons} colorClass="bg-red-500" icon="bi-x-circle-fill" />
            </div>

             <div className="mt-6 p-4 bg-white border border-greatek-border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-greatek-dark-blue mb-2 flex items-center">
                    <i className="bi bi-robot mr-3 text-greatek-blue"></i>
                    Insights da IA
                </h2>
                <div className="prose max-w-none prose-sm text-text-secondary">
                    {/* Fix: Passed AppMode to MarkdownViewer to ensure correct rendering context. */}
                    <MarkdownViewer content={aiInsights} mode={AppMode.BUSINESS_ANALYZER} isLastMessage={true} />
                </div>
            </div>
        </div>
    );
};

export default AnalysisDashboard;